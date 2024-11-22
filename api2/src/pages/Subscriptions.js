import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  useTheme,
  Snackbar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';

const Subscriptions = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apis, setApis] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const showMessage = useCallback((message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }, []);

  const fetchSubscriptions = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/auth/api-subscriptions');
      setSubscriptions(response.data);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      setError('Failed to fetch subscriptions');
    }
  }, []);

  const handleSubscribe = useCallback(async (apiName) => {
    try {
      await axiosInstance.post('/auth/api-subscriptions', { apiName });
      showMessage('Successfully subscribed to API');
      await fetchSubscriptions();
    } catch (error) {
      console.error('Error subscribing to API:', error);
      showMessage('Failed to subscribe to API', 'error');
    }
  }, [fetchSubscriptions, showMessage]);

  const handleUnsubscribe = useCallback(async (apiName) => {
    try {
      await axiosInstance.delete(`/auth/api-subscriptions/${apiName}`);
      showMessage('Successfully unsubscribed from API');
      await fetchSubscriptions();
    } catch (error) {
      console.error('Error unsubscribing from API:', error);
      showMessage('Failed to unsubscribe from API', 'error');
    }
  }, [fetchSubscriptions, showMessage]);

  const handleTryApi = useCallback((apiName) => {
    const apiPathMap = {
      'welcome': 'swaroop-welcome',
      'document-identification': 'document-identification',
      'pan-signature-extraction': 'pan-signature-extraction'
    };

    const apiPath = apiPathMap[apiName] || apiName;
    navigate(`/api/${apiPath}`);
  }, [navigate]);

  useEffect(() => {
    const fetchApis = async () => {
      try {
        const response = await axiosInstance.get('/v1/available-apis');
        setApis(response.data);
      } catch (error) {
        console.error('Error fetching APIs:', error);
        setError('Failed to fetch available APIs');
      }
    };

    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchSubscriptions(),
          fetchApis()
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // WebSocket setup
    const token = localStorage.getItem('token');
    if (!token) return;

    const ws = new WebSocket(`ws://localhost:5000/ws?token=${token}`);

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'SUBSCRIPTION_UPDATE') {
          await fetchSubscriptions();
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [fetchSubscriptions]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ p: 3, mt: '64px' }}>
        <Typography variant="h4" gutterBottom>
          Available APIs
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {apis.map((api) => (
            <Grid item xs={12} md={4} key={api.id}>
              <Card 
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  bgcolor: theme.palette.background.paper,
                  '&:hover': {
                    boxShadow: theme.shadows[4]
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" gutterBottom>
                    {api.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {api.description}
                  </Typography>
                  <Box mt={2}>
                    <Typography variant="subtitle2" gutterBottom>
                      Features:
                    </Typography>
                    <ul>
                      <li>Method: {api.method}</li>
                      <li>Version: {api.version}</li>
                      <li>Credits per call: {api.pricing?.credits || 1}</li>
                    </ul>
                  </Box>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  {subscriptions.find(sub => sub.apiName === api.id && sub.status === 'ACTIVE') ? (
                    <Button 
                      variant="outlined"
                      color="error"
                      fullWidth
                      onClick={() => handleUnsubscribe(api.id)}
                    >
                      Unsubscribe
                    </Button>
                  ) : (
                    <Button 
                      variant="contained"
                      fullWidth
                      onClick={() => handleSubscribe(api.id)}
                    >
                      Subscribe
                    </Button>
                  )}
                  <Button 
                    variant="outlined"
                    onClick={() => handleTryApi(api.id)}
                    disabled={!subscriptions.find(sub => sub.apiName === api.id && sub.status === 'ACTIVE')}
                  >
                    Try API
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
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
    </>
  );
};

export default Subscriptions; 