const express = require('express');
const router = express.Router();
const multer = require('multer');
const apiController = require('../controllers/apiController');
const idCardController = require('../controllers/idCardController');
const verifyToken = require('../middleware/authMiddleware');

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

// Analytics endpoints
router.get('/analytics', apiController.getApiAnalytics);
router.get('/analytics/:apiId', apiController.getApiStats);

// Debug log registered routes
console.log('API Routes registered:');
router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(`${r.route.stack[0].method.toUpperCase()} /api/v1${r.route.path}`);
  }
});

module.exports = router; 