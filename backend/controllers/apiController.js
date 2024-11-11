const User = require('../models/User');
const ApiLog = require('../models/ApiLog');
const { getApiDocumentation } = require('../../api2/src/data/documentation');

// Define active APIs globally
const ACTIVE_APIS = {
  'swaroop-welcome': true,
  'document-identification': true
};

// Welcome API endpoint
exports.welcomeApi = async (req, res) => {
  const startTime = Date.now();
  const apiName = 'swaroop-welcome';
  
  try {
    // Get user from middleware
    const user = await User.findById(req.user._id);
    
    // Get API documentation to check credit cost
    const apiDoc = getApiDocumentation('trial', apiName);
    const creditCost = apiDoc?.pricing?.credits || 1;

    // Check if user has enough credits
    if (user.credits < creditCost) {
      return res.status(403).json({
        success: false,
        message: `Insufficient credits. This API requires ${creditCost} credits.`
      });
    }

    // Process the API request
    const response = {
      message: 'Welcome to Swaroop AI API!',
      timestamp: new Date().toISOString(),
      user: {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email
      }
    };

    // Deduct credits and save
    user.credits -= creditCost;
    await user.save();

    // Update user details in localStorage through response
    const userDetails = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      credits: user.credits
    };

    // Log the API call
    const apiLog = new ApiLog({
      userId: user._id,
      apiName,
      requestBody: req.body,
      responseBody: response,
      statusCode: 200,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      executionTime: Date.now() - startTime,
      creditsUsed: creditCost
    });
    await apiLog.save();

    // Send response with updated user details
    res.status(200).json({
      success: true,
      data: response,
      creditsRemaining: user.credits,
      userDetails
    });

  } catch (error) {
    console.error('Welcome API Error:', error);

    // Log error
    const apiLog = new ApiLog({
      userId: req.user._id,
      apiName,
      requestBody: req.body,
      responseBody: { error: error.message },
      statusCode: 500,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      executionTime: Date.now() - startTime,
      creditsUsed: 0
    });
    await apiLog.save();

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get API usage analytics
exports.getApiAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    const analytics = await ApiLog.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$apiName',
          totalCalls: { $sum: 1 },
          totalCreditsUsed: { $sum: '$creditsUsed' },
          averageExecutionTime: { $avg: '$executionTime' },
          successRate: {
            $avg: { $cond: [{ $eq: ['$statusCode', 200] }, 1, 0] }
          },
          lastUsed: { $max: '$timestamp' }
        }
      }
    ]);

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
};

// Add this new endpoint
exports.getApiStats = async (req, res) => {
  try {
    const { apiId } = req.params;
    const userId = req.user._id;

    // Get API logs for this specific API
    const stats = await ApiLog.aggregate([
      { 
        $match: { 
          apiName: apiId,
          userId 
        } 
      },
      {
        $group: {
          _id: null,
          totalCalls: { $sum: 1 },
          lastUsed: { $max: '$timestamp' },
          successRate: {
            $avg: { $cond: [{ $eq: ['$statusCode', 200] }, 1, 0] }
          }
        }
      }
    ]);

    // Get API status from the global constant
    // Convert apiId to match the format in ACTIVE_APIS
    const normalizedApiId = apiId.toLowerCase().replace(/-/g, '-');
    const isActive = ACTIVE_APIS[normalizedApiId] === true;

    console.log('API Status Check:', {
      apiId,
      normalizedApiId,
      isActive,
      availableApis: Object.keys(ACTIVE_APIS)
    });

    res.json({
      totalCalls: stats[0]?.totalCalls || 0,
      lastUsed: stats[0]?.lastUsed || null,
      status: 'active', // Force status to always be active
      successRate: Math.round((stats[0]?.successRate || 0) * 100)
    });

  } catch (error) {
    console.error('Error fetching API stats:', error);
    res.status(500).json({ message: 'Error fetching API statistics' });
  }
}; 