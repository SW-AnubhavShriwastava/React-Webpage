// src/pages/ApiDetail.js
import React from 'react';
import { useParams } from 'react-router-dom';
import { apis } from '../data/apis';
import { Box, Typography, Paper } from '@mui/material';

function ApiDetail() {
  const { apiName } = useParams();
  const api = apis.find((api) => api.title.replace(/\s+/g, '-').toLowerCase() === apiName);

  if (!api) {
    return <Typography variant="h6">API not found</Typography>;
  }

  return (
    <Box p={4}>
      <Paper elevation={3} sx={{ padding: 4 }}>
        <Typography variant="h4" color="primary" gutterBottom>
          {api.title}
        </Typography>
        <Typography variant="body1">{api.description}</Typography>
      </Paper>
    </Box>
  );
}

export default ApiDetail;
