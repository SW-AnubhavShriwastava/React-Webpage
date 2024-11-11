const { trialApis } = require('./trial');
const { idCardApis } = require('./id_card');

// Create empty objects for categories that don't exist yet
const imageProcessingApis = {};
const videoProcessingApis = {};

const apiDocumentation = {
  trial: trialApis,
  id_card: idCardApis,
  image_processing: imageProcessingApis,
  video_processing: videoProcessingApis
};

const getApiDocumentation = (category, apiName) => {
  console.log('Looking for documentation:', { category, apiName });
  console.log('Available documentation:', apiDocumentation);
  return apiDocumentation[category]?.[apiName];
};

module.exports = {
  apiDocumentation,
  getApiDocumentation
}; 