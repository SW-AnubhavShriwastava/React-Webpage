// src/pages/ApiDetail.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Chip,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getApiDocumentation } from '../data/documentation';
import ApiDocumentation from '../components/ApiDocumentation';
import { apis } from '../data/apis';
import axiosInstance from '../axiosInstance';

function ApiDetail() {
  const { apiName } = useParams();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

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

  const showMessage = useCallback((message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }, []);

  // Fetch subscription status
  const fetchSubscription = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/auth/api-subscriptions');
      const subscriptions = response.data;
      const apiNameForSubscription = normalizedApiName === 'swaroop-welcome' ? 'welcome' : normalizedApiName;
      const currentSubscription = subscriptions.find(
        sub => sub.apiName === apiNameForSubscription && sub.status === 'ACTIVE'
      );
      setSubscription(currentSubscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  }, [normalizedApiName]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const handleSubscribe = async () => {
    try {
      const apiNameForSubscription = normalizedApiName === 'swaroop-welcome' ? 'welcome' : normalizedApiName;
      await axiosInstance.post('/auth/api-subscriptions', { 
        apiName: apiNameForSubscription 
      });
      showMessage('Successfully subscribed to API');
      fetchSubscription();
    } catch (error) {
      console.error('Error subscribing to API:', error);
      showMessage('Failed to subscribe to API', 'error');
    }
  };

  const handleUnsubscribe = async () => {
    try {
      const apiNameForSubscription = normalizedApiName === 'swaroop-welcome' ? 'welcome' : normalizedApiName;
      await axiosInstance.delete(`/auth/api-subscriptions/${apiNameForSubscription}`);
      showMessage('Successfully unsubscribed from API');
      fetchSubscription();
    } catch (error) {
      console.error('Error unsubscribing from API:', error);
      showMessage('Failed to unsubscribe from API', 'error');
    }
  };

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
    <Box sx={{ paddingTop: '64px' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        p: 2,
        position: 'sticky',
        top: '64px',
        backgroundColor: 'background.default',
        zIndex: 1,
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/home')}
        >
          Back to APIs
        </Button>
        {loading ? (
          <CircularProgress size={24} />
        ) : (
          subscription ? (
            <Box display="flex" gap={2} alignItems="center">
              <Chip 
                label="Subscribed" 
                color="success" 
                variant="outlined" 
              />
              <Button 
                variant="outlined" 
                color="error"
                onClick={handleUnsubscribe}
              >
                Unsubscribe
              </Button>
            </Box>
          ) : (
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleSubscribe}
            >
              Subscribe
            </Button>
          )
        )}
      </Box>
      <Box sx={{ p: 2 }}>
        <ApiDocumentation doc={doc} />
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ApiDetail;
