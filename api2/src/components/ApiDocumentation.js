import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Card,
  CardContent,
  CardMedia,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HistoryIcon from '@mui/icons-material/History';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DownloadIcon from '@mui/icons-material/Download';
import axiosInstance from '../axiosInstance';

function ApiDocumentation({ doc }) {
  const [activeTab, setActiveTab] = useState('curl');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [selectedToken, setSelectedToken] = useState('');
  const [apiStats, setApiStats] = useState({
    totalCalls: 0,
    lastUsed: null,
    status: doc.status || 'active',
    successRate: 0
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [testResponse, setTestResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testError, setTestError] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const navigate = useNavigate();

  const showMessage = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const fetchApiStats = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/v1/analytics/${doc.id}`);
      setApiStats(prevStats => {
        const newStatus = response.data.status || prevStats.status;
        return {
          ...response.data,
          status: newStatus
        };
      });
    } catch (error) {
      console.error('Error fetching API stats:', error);
    }
  }, [doc.id]);

  const fetchTokens = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/auth/tokens');
      setTokens(response.data);
    } catch (error) {
      console.error('Error fetching tokens:', error);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchTokens();
    fetchApiStats();
  }, [fetchTokens, fetchApiStats]);

  // Reduce refresh frequency to every 30 seconds instead of 10
  useEffect(() => {
    const interval = setInterval(fetchApiStats, 30000);
    return () => clearInterval(interval);
  }, [fetchApiStats]);

  // Only refresh stats when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchApiStats();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchApiStats]);

  // Monitor API calls and refresh stats
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if (args[0].includes('/api/v1/welcome')) {
        setTimeout(fetchApiStats, 1000); // Refresh stats after API call
      }
      return response;
    };
    return () => {
      window.fetch = originalFetch;
    };
  }, [fetchApiStats]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setOpenSnackbar(true);
  };

  const getCodeWithToken = (code) => {
    if (!selectedToken) return code;
    return code.replace('your_token_here', selectedToken);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL for image
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setTestResponse(null);
      setTestError(null);
    }
  };

  const handleTryApi = async () => {
    if (!selectedToken) {
      setTestError('Please select an authentication token');
      return;
    }

    setIsLoading(true);
    setTestError(null);
    setTestResponse(null);

    try {
      let response;
      const config = {
        headers: {
          'Authorization': `Bearer ${selectedToken}`,
        },
        responseType: doc.response?.success?.contentType === 'image/png' ? 'blob' : 'json'
      };

      if (doc.requestBody?.type === 'multipart/form-data') {
        const formData = new FormData();
        formData.append('image', selectedFile);
        config.headers['Content-Type'] = 'multipart/form-data';
        response = await axiosInstance.post(`/v1${doc.endpoint}`, formData, config);
      } else {
        config.headers['Content-Type'] = 'application/json';
        response = await axiosInstance.post(`/v1${doc.endpoint}`, {}, config);
      }

      // Handle image response
      if (doc.response?.success?.contentType === 'image/png') {
        const imageUrl = URL.createObjectURL(response.data);
        setTestResponse({
          type: 'image',
          url: imageUrl,
          blob: response.data
        });
      } else {
        setTestResponse({
          type: 'json',
          data: response.data
        });
      }

      showMessage('API call successful!', 'success');
    } catch (error) {
      console.error('API Test Error:', error);
      setTestError(error.response?.data?.message || 'Error testing API');
      showMessage(error.response?.data?.message || 'Error testing API', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!testResponse || testResponse.type !== 'image') return;
    
    const link = document.createElement('a');
    link.href = testResponse.url;
    link.download = 'signature.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!doc) return null;

  return (
    <Box sx={{ 
      p: 4, 
      mt: '64px',
      maxWidth: '1200px', 
      margin: '0 auto'
    }}>
      {/* API Header */}
      <Typography variant="h4" gutterBottom>{doc.title}</Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        {doc.description}
      </Typography>

      {/* API Stats with stable status */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">API Statistics</Typography>
          <Button 
            size="small" 
            onClick={fetchApiStats}
            variant="outlined"
          >
            Refresh Stats
          </Button>
        </Box>
        <Box display="flex" gap={4} flexWrap="wrap">
          <Box display="flex" alignItems="center" gap={1}>
            <QueryStatsIcon />
            <Box>
              <Typography variant="subtitle2">Total API Calls</Typography>
              <Typography variant="h6">{apiStats.totalCalls}</Typography>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <HistoryIcon />
            <Box>
              <Typography variant="subtitle2">Last Used</Typography>
              <Typography variant="h6">
                {apiStats.lastUsed 
                  ? new Date(apiStats.lastUsed).toLocaleString()
                  : 'Never'
                }
              </Typography>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <CheckCircleIcon color={doc.status === 'active' ? 'success' : 'error'} />
            <Box>
              <Typography variant="subtitle2">Status</Typography>
              <Chip 
                label={'ACTIVE'}
                color={'success'}
                size="small"
                sx={{
                  '& .MuiChip-label': {
                    color: 'white'
                  }
                }}
              />
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* API Details */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>API Details</Typography>
        <Box display="flex" gap={2} mb={2} flexWrap="wrap">
          <Chip label={`Version: ${doc.version}`} />
          <Chip label={`Credits: ${doc.pricing?.credits}`} color="primary" />
          <Chip label={`Method: ${doc.method}`} color="secondary" />
        </Box>
        <Typography variant="body2" gutterBottom>
          <strong>Base URL:</strong> {doc.baseUrl}
        </Typography>
        <Typography variant="body2">
          <strong>Endpoint:</strong> {doc.endpoint}
        </Typography>
      </Paper>

      {/* Authentication */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Authentication</Typography>
        <Typography variant="body2" paragraph>
          {doc.authentication?.description}
        </Typography>
        
        <Box mt={2}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Select Authentication Token</InputLabel>
            <Select
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
              label="Select Authentication Token"
              sx={{ mb: 2 }}
            >
              {tokens.map((token) => (
                <MenuItem key={token._id} value={token.token}>
                  {token.name} ({token.token.substring(0, 15)}...)
                </MenuItem>
              ))}
              <MenuItem value="" divider />
              <MenuItem onClick={() => navigate('/token-management')} sx={{ color: 'primary.main' }}>
                Generate New Token
              </MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Headers */}
      {doc.headers && doc.headers.length > 0 && (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>Headers</Typography>
          {doc.headers.map((header, index) => (
            <Box key={index} mb={2}>
              <Typography variant="subtitle2">{header.name}</Typography>
              <Typography variant="body2" color="textSecondary">
                {header.description}
              </Typography>
            </Box>
          ))}
        </Paper>
      )}

      {/* Response */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Response</Typography>
        
        <Typography variant="subtitle1" gutterBottom>Success Response (200)</Typography>
        <Box position="relative" mb={3}>
          <Button
            size="small"
            startIcon={<ContentCopyIcon />}
            sx={{ position: 'absolute', right: 8, top: 8, zIndex: 1 }}
            onClick={() => copyToClipboard(JSON.stringify(doc.response.success.example, null, 2))}
          >
            Copy
          </Button>
          <Box sx={{ position: 'relative', mt: 2 }}>
            <SyntaxHighlighter language="json" style={tomorrow}>
              {JSON.stringify(doc.response.success.example, null, 2)}
            </SyntaxHighlighter>
          </Box>
        </Box>

        <Typography variant="subtitle1" gutterBottom>Error Response (401)</Typography>
        <Box position="relative">
          <Button
            size="small"
            startIcon={<ContentCopyIcon />}
            sx={{ position: 'absolute', right: 8, top: 8, zIndex: 1 }}
            onClick={() => copyToClipboard(JSON.stringify(doc.response.error.example, null, 2))}
          >
            Copy
          </Button>
          <Box sx={{ position: 'relative', mt: 2 }}>
            <SyntaxHighlighter language="json" style={tomorrow}>
              {JSON.stringify(doc.response.error.example, null, 2)}
            </SyntaxHighlighter>
          </Box>
        </Box>
      </Paper>

      {/* Code Examples */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Code Examples</Typography>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ mb: 2 }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="cURL" value="curl" />
          <Tab label="Python" value="python" />
          <Tab label="Node.js" value="nodejs" />
          <Tab label="PowerShell" value="powershell" />
        </Tabs>
        <Box position="relative">
          <Button
            size="small"
            startIcon={<ContentCopyIcon />}
            sx={{ position: 'absolute', right: 8, top: 8, zIndex: 1 }}
            onClick={() => copyToClipboard(getCodeWithToken(doc.codeExamples[activeTab]))}
          >
            Copy
          </Button>
          <Box sx={{ position: 'relative', mt: 2 }}>
            <SyntaxHighlighter
              language={activeTab === 'curl' ? 'bash' : activeTab}
              style={tomorrow}
            >
              {getCodeWithToken(doc.codeExamples[activeTab])}
            </SyntaxHighlighter>
          </Box>
        </Box>
      </Paper>

      {/* Try It Here Section */}
      {doc.requestBody && (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>Try It Here</Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            {doc.requestBody.type === 'multipart/form-data' 
              ? 'Test the API directly by uploading an image and viewing the response.'
              : 'Test the API directly and view the response.'}
          </Typography>

          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
              <InputLabel>Select Authentication Token</InputLabel>
              <Select
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value)}
                label="Select Authentication Token"
              >
                {tokens.map((token) => (
                  <MenuItem key={token._id} value={token.token}>
                    {token.name} ({token.token.substring(0, 15)}...)
                  </MenuItem>
                ))}
                <MenuItem value="" divider />
                <MenuItem onClick={() => navigate('/token-management')} sx={{ color: 'primary.main' }}>
                  Generate New Token
                </MenuItem>
              </Select>
            </FormControl>

            {doc.requestBody.type === 'multipart/form-data' && (
              <Box 
                sx={{ 
                  border: '2px dashed #ccc',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  mb: 2,
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'rgba(25, 118, 210, 0.04)'
                  }
                }}
                onClick={() => document.getElementById('file-input').click()}
              >
                <input
                  type="file"
                  id="file-input"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
                <UploadFileIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="body1" gutterBottom>
                  Click to upload or drag and drop
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Supports: JPEG, PNG (max 5MB)
                </Typography>
              </Box>
            )}

            {previewUrl && doc.requestBody.type === 'multipart/form-data' && (
              <Card sx={{ mb: 2 }}>
                <CardMedia
                  component="img"
                  image={previewUrl}
                  alt="Preview"
                  sx={{ height: 200, objectFit: 'contain' }}
                />
                <CardContent>
                  <Typography variant="body2" color="textSecondary">
                    Selected file: {selectedFile?.name}
                  </Typography>
                </CardContent>
              </Card>
            )}

            <Button
              variant="contained"
              color="primary"
              fullWidth
              disabled={
                !selectedToken || 
                (doc.requestBody.type === 'multipart/form-data' && !selectedFile) || 
                isLoading
              }
              onClick={handleTryApi}
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
            >
              {isLoading ? 'Processing...' : 'Test API'}
            </Button>
          </Box>

          {testError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {testError}
            </Alert>
          )}

          {testResponse && (
            <Box>
              <Typography variant="h6" gutterBottom>Response:</Typography>
              <Box position="relative">
                {testResponse.type === 'image' ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box 
                      sx={{ 
                        border: '1px solid #e0e0e0',
                        borderRadius: '4px',
                        padding: '16px',
                        backgroundColor: '#f5f5f5',
                        width: 'fit-content'
                      }}
                    >
                      <img 
                        src={testResponse.url} 
                        alt="API Response"
                        style={{ 
                          maxWidth: '300px',
                          maxHeight: '100px',
                          objectFit: 'contain',
                          display: 'block'
                        }} 
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<DownloadIcon />}
                        onClick={handleDownload}
                        size="small"
                      >
                        Download Signature
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <>
                    <Button
                      size="small"
                      startIcon={<ContentCopyIcon />}
                      sx={{ position: 'absolute', right: 8, top: 8, zIndex: 1 }}
                      onClick={() => copyToClipboard(JSON.stringify(testResponse.data, null, 2))}
                    >
                      Copy
                    </Button>
                    <Box sx={{ position: 'relative', mt: 2 }}>
                      <SyntaxHighlighter language="json" style={tomorrow}>
                        {JSON.stringify(testResponse.data, null, 2)}
                      </SyntaxHighlighter>
                    </Box>
                  </>
                )}
              </Box>
            </Box>
          )}
        </Paper>
      )}

      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={3000} 
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ApiDocumentation;