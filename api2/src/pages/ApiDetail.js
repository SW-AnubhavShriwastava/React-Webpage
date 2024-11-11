// src/pages/ApiDetail.js
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apis } from '../data/apis';
import { Box, Typography, Paper, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function ApiDetail() {
  const { apiName } = useParams();
  const navigate = useNavigate();
  const api = apis.find((api) => api.title.replace(/\s+/g, '-').toLowerCase() === apiName);

  if (!api) {
    return (
      <Box p={4}>
        <Typography variant="h6">API not found</Typography>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/home')}
          sx={{ mt: 2 }}
        >
          Back to Home
        </Button>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Button 
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/home')}
        sx={{ mb: 2 }}
      >
        Back to APIs
      </Button>
      <Paper elevation={3} sx={{ padding: 4 }}>
        <Typography variant="h4" color="primary" gutterBottom>
          {api.title}
        </Typography>
        <Typography variant="body1" paragraph>
          {api.description}
        </Typography>
        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Category
        </Typography>
        <Typography variant="body1" color="textSecondary">
          {api.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </Typography>
      </Paper>
    </Box>
  );
}

export default ApiDetail;
