const express = require('express');
const router = express.Router();
const multer = require('multer');
const apiController = require('../controllers/apiController');
const idCardController = require('../controllers/idCardController');
const verifyToken = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');
const ApiLog = require('../models/ApiLog');
const Transaction = require('../models/Transaction');

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// All routes require authentication
router.use(verifyToken);

// Welcome API endpoint
router.post('/welcome', apiController.welcomeApi);

// ID Card APIs
router.post('/document-identification', 
  upload.single('image'), 
  idCardController.documentIdentification
);

router.post('/pan-signature-extraction',
  upload.single('image'),
  idCardController.panSignatureExtraction
);

// Analytics endpoints
router.get('/analytics', async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    const userId = req.user.id;

    // Calculate the date range
    const endDate = new Date();
    const startDate = new Date();
    switch (timeRange) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    // Fetch analytics data
    const apiLogs = await ApiLog.find({
      userId,
      timestamp: { $gte: startDate, $lte: endDate }
    }).sort({ timestamp: 1 });

    // Calculate usage over time
    const usageOverTime = [];
    const dailyUsage = {};
    
    apiLogs.forEach(log => {
      const date = new Date(log.timestamp).toISOString().split('T')[0];
      if (!dailyUsage[date]) {
        dailyUsage[date] = 0;
      }
      dailyUsage[date]++;
    });

    Object.entries(dailyUsage).forEach(([date, calls]) => {
      usageOverTime.push({ date, calls });
    });

    // Calculate status code distribution
    const statusCodes = {};
    apiLogs.forEach(log => {
      if (!statusCodes[log.statusCode]) {
        statusCodes[log.statusCode] = 0;
      }
      statusCodes[log.statusCode]++;
    });

    const statusCodeDistribution = Object.entries(statusCodes).map(([code, count]) => ({
      code: parseInt(code),
      count,
      percentage: count / apiLogs.length
    }));

    // Calculate API usage by name
    const apiUsageByName = Object.entries(
      apiLogs.reduce((acc, log) => {
        acc[log.apiName] = (acc[log.apiName] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, calls]) => ({ name, calls }));

    // Calculate top endpoints
    const topEndpoints = [...apiUsageByName]
      .sort((a, b) => b.calls - a.calls)
      .slice(0, 5);

    // Calculate success rate
    const successfulCalls = apiLogs.filter(log => log.statusCode >= 200 && log.statusCode < 300).length;
    const successRate = apiLogs.length > 0 ? (successfulCalls / apiLogs.length) : 0;

    const response = {
      totalCalls: apiLogs.length,
      averageResponseTime: apiLogs.reduce((acc, log) => acc + log.executionTime, 0) / apiLogs.length || 0,
      apiUsageByName,
      usageOverTime,
      statusCodeDistribution,
      topEndpoints,
      successRate
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Error fetching analytics data' });
  }
});
router.get('/analytics/:apiId', apiController.getApiStats);

// Token deletion route
router.delete('/auth/tokens/:tokenId', verifyToken, authController.deleteToken);

// Debug log registered routes
console.log('API Routes registered:');
router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(`${r.route.stack[0].method.toUpperCase()} /api/v1${r.route.path}`);
  }
});

module.exports = router; 