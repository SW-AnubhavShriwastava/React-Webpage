const axios = require('axios');
const FormData = require('form-data');
const User = require('../models/User');
const ApiLog = require('../models/ApiLog');
const { getApiDocumentation } = require('../../api2/src/data/documentation');

const CLOUD_RUN_URL = 'https://api-application-140313483314.asia-south1.run.app';

exports.documentIdentification = async (req, res) => {
  const startTime = Date.now();
  const apiName = 'document-identification';

  try {
    // Get user from middleware
    const user = await User.findById(req.user._id);
    
    // Get API documentation to check credit cost
    const apiDoc = getApiDocumentation('id_card', apiName);
    const creditCost = apiDoc?.pricing?.credits || 2;

    // Check if user has enough credits
    if (user.credits < creditCost) {
      return res.status(403).json({
        success: false,
        message: `Insufficient credits. This API requires ${creditCost} credits.`
      });
    }

    // Check if file exists in request
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Create FormData for Cloud Run request
    const formData = new FormData();
    formData.append('image', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    // Forward request to Cloud Run
    const cloudRunResponse = await axios.post(
      `${CLOUD_RUN_URL}/document-identification`,
      formData,
      {
        headers: {
          ...formData.getHeaders()
        }
      }
    );

    // Deduct credits
    user.credits -= creditCost;
    await user.save();

    // Log the API call
    const apiLog = new ApiLog({
      userId: user._id,
      apiName,
      requestBody: { filename: req.file.originalname },
      responseBody: cloudRunResponse.data,
      statusCode: cloudRunResponse.status,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      executionTime: Date.now() - startTime,
      creditsUsed: creditCost
    });
    await apiLog.save();

    // Send response
    res.status(200).json({
      success: true,
      data: cloudRunResponse.data,
      creditsRemaining: user.credits
    });

  } catch (error) {
    console.error('Document Identification API Error:', error);

    // Log error
    const apiLog = new ApiLog({
      userId: req.user._id,
      apiName,
      requestBody: { filename: req?.file?.originalname },
      responseBody: { error: error.message },
      statusCode: error.response?.status || 500,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      executionTime: Date.now() - startTime,
      creditsUsed: 0
    });
    await apiLog.save();

    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.detail || 'Error processing document',
      error: error.message
    });
  }
};

exports.panSignatureExtraction = async (req, res) => {
  const startTime = Date.now();
  const apiName = 'pan-signature-extraction';

  try {
    // Get user from middleware
    const user = await User.findById(req.user._id);
    
    // Get API documentation to check credit cost
    const apiDoc = getApiDocumentation('id_card', apiName);
    const creditCost = apiDoc?.pricing?.credits || 1;

    // Check if user has enough credits
    if (user.credits < creditCost) {
      return res.status(403).json({
        success: false,
        message: `Insufficient credits. This API requires ${creditCost} credits.`
      });
    }

    // Check if file exists in request
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Create FormData for Cloud Run request
    const formData = new FormData();
    formData.append('image', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    // Forward request to Cloud Run with responseType: arraybuffer
    const cloudRunResponse = await axios.post(
      `${CLOUD_RUN_URL}/pan-signature-extraction`,
      formData,
      {
        headers: {
          ...formData.getHeaders()
        },
        responseType: 'arraybuffer'  // Important for binary response
      }
    );

    // Deduct credits
    user.credits -= creditCost;
    await user.save();

    // Log the API call
    const apiLog = new ApiLog({
      userId: user._id,
      apiName,
      requestBody: { filename: req.file.originalname },
      responseBody: { message: 'Signature image extracted successfully' },
      statusCode: cloudRunResponse.status,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      executionTime: Date.now() - startTime,
      creditsUsed: creditCost
    });
    await apiLog.save();

    // Set response headers and send binary data
    res.set('Content-Type', 'image/png');
    res.send(cloudRunResponse.data);

  } catch (error) {
    console.error('PAN Signature Extraction API Error:', error);

    // Log error
    const apiLog = new ApiLog({
      userId: req.user._id,
      apiName,
      requestBody: { filename: req?.file?.originalname },
      responseBody: { error: error.message },
      statusCode: error.response?.status || 500,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      executionTime: Date.now() - startTime,
      creditsUsed: 0
    });
    await apiLog.save();

    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.detail || 'Error extracting signature',
      error: error.message
    });
  }
}; 