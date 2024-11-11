// src/pages/ApiDetail.js
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getApiDocumentation } from '../data/documentation';
import ApiDocumentation from '../components/ApiDocumentation';
import { apis } from '../data/apis';

function ApiDetail() {
  const { apiName } = useParams();
  const navigate = useNavigate();

  // Normalize the API name for comparison
  const normalizedApiName = apiName.toLowerCase();

  // Find the API details
  const api = apis.find(api => {
    const apiTitle = api.title.replace(/\s+/g, '-').toLowerCase();
    console.log('Comparing:', { apiTitle, normalizedApiName });
    return apiTitle === normalizedApiName;
  });
  
  // Get the documentation
  const doc = api ? getApiDocumentation(api.category, normalizedApiName) : null;

  console.log('API Details:', {
    requestedName: apiName,
    normalizedName: normalizedApiName,
    foundApi: api,
    documentation: doc
  });

  if (!api || !doc) {
    return (
      <Box p={4}>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/home')}
          sx={{ mb: 2 }}
        >
          Back to Home
        </Button>
        <Box>
          API not found or documentation not available.
          <br />
          Requested: {apiName}
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Button 
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/home')}
        sx={{ m: 2 }}
      >
        Back to APIs
      </Button>
      <ApiDocumentation doc={doc} />
    </Box>
  );
}

export default ApiDetail;
