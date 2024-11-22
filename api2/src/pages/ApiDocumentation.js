import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Chip,
  Paper,
  useTheme,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import axiosInstance from '../axiosInstance';

// Category icons
import ApiIcon from '@mui/icons-material/Api';
import DescriptionIcon from '@mui/icons-material/Description';
import CodeIcon from '@mui/icons-material/Code';
import SecurityIcon from '@mui/icons-material/Security';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

const API_PATH_MAP = {
  'welcome': 'swaroop-welcome',
  'document-identification': 'document-identification',
  'pan-signature-extraction': 'pan-signature-extraction'
};

const ApiDocumentation = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apis, setApis] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [subscriptions, setSubscriptions] = useState([]);

  // Fetch APIs and subscriptions
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [apisResponse, subscriptionsResponse] = await Promise.all([
          axiosInstance.get('/v1/available-apis'),
          axiosInstance.get('/auth/api-subscriptions')
        ]);
        setApis(apisResponse.data);
        setSubscriptions(subscriptionsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch API documentation');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Group APIs by category
  const categories = React.useMemo(() => {
    const cats = apis.reduce((acc, api) => {
      if (!acc[api.category]) {
        acc[api.category] = [];
      }
      acc[api.category].push(api);
      return acc;
    }, { all: apis });
    return cats;
  }, [apis]);

  const isSubscribed = (apiId) => {
    return subscriptions.some(sub => 
      sub.apiName === apiId && sub.status === 'ACTIVE'
    );
  };

  const handleTryApi = useCallback((apiId) => {
    const mappedPath = API_PATH_MAP[apiId] || apiId;
    navigate(`/api/${mappedPath}`);
  }, [navigate]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, mt: '64px' }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#000', fontWeight: 600 }}>
        API Documentation
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* API Categories */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, bgcolor: theme.palette.background.paper }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#000', fontWeight: 600 }}>
              Categories
            </Typography>
            <Tabs
              orientation="vertical"
              value={selectedCategory}
              onChange={(e, newValue) => setSelectedCategory(newValue)}
              sx={{ 
                borderRight: 1, 
                borderColor: 'divider',
                '& .MuiTab-root': {
                  color: '#000',
                  '&.Mui-selected': {
                    color: theme.palette.primary.main,
                    fontWeight: 600
                  }
                }
              }}
            >
              <Tab 
                label="All APIs" 
                value="all"
                icon={<ApiIcon />}
                iconPosition="start"
              />
              {Object.keys(categories).filter(cat => cat !== 'all').map((category) => (
                <Tab 
                  key={category}
                  label={category.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                  value={category}
                  icon={<DescriptionIcon />}
                  iconPosition="start"
                />
              ))}
            </Tabs>
          </Paper>
        </Grid>

        {/* API List */}
        <Grid item xs={12} md={9}>
          <Grid container spacing={3}>
            {(categories[selectedCategory] || []).map((api) => (
              <Grid item xs={12} key={api.id}>
                <Card 
                  sx={{ 
                    bgcolor: theme.palette.background.paper,
                    '&:hover': {
                      boxShadow: theme.shadows[4],
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease'
                    },
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    overflow: 'hidden'
                  }}
                >
                  <CardContent>
                    <Box 
                      display="flex" 
                      justifyContent="space-between" 
                      alignItems="center" 
                      mb={2}
                      sx={{
                        borderBottom: 1,
                        borderColor: 'divider',
                        pb: 2
                      }}
                    >
                      <Box>
                        <Typography variant="h6" gutterBottom sx={{ 
                          fontWeight: 600,
                          color: '#000'
                        }}>
                          {api.title}
                        </Typography>
                        <Box display="flex" gap={1}>
                          <Chip 
                            label={`v${api.version}`} 
                            size="small" 
                            color="primary"
                            variant="outlined"
                          />
                          <Chip 
                            label={api.method} 
                            size="small" 
                            color="secondary"
                            variant="outlined"
                          />
                          <Chip 
                            label={isSubscribed(api.id) ? 'Subscribed' : 'Not Subscribed'} 
                            size="small" 
                            color={isSubscribed(api.id) ? 'success' : 'default'}
                            icon={isSubscribed(api.id) ? <CheckCircleIcon /> : <ErrorIcon />}
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                      <Box display="flex" gap={1}>
                        <Button
                          variant="contained"
                          onClick={() => handleTryApi(api.id)}
                          startIcon={<CodeIcon />}
                          disabled={!isSubscribed(api.id)}
                          sx={{
                            bgcolor: isSubscribed(api.id) ? 'primary.main' : 'grey.300',
                            '&:hover': {
                              bgcolor: isSubscribed(api.id) ? 'primary.dark' : 'grey.300'
                            }
                          }}
                        >
                          Try It Out
                        </Button>
                        {!isSubscribed(api.id) && (
                          <Button
                            variant="outlined"
                            onClick={() => navigate('/subscriptions')}
                            startIcon={<SecurityIcon />}
                            color="primary"
                          >
                            Subscribe
                          </Button>
                        )}
                      </Box>
                    </Box>

                    <Typography 
                      color="#000"
                      paragraph
                      sx={{ mb: 3, opacity: 0.87 }}
                    >
                      {api.description}
                    </Typography>

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom sx={{ 
                          fontWeight: 600,
                          color: '#000'
                        }}>
                          Base URL
                        </Typography>
                        <Paper 
                          sx={{ 
                            p: 2, 
                            bgcolor: '#f5f5f5',
                            border: '1px solid',
                            borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
                            borderRadius: 1,
                            position: 'relative',
                            overflow: 'hidden',
                            '& pre': {
                              color: '#000 !important',
                              fontFamily: 'monospace !important'
                            },
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '4px',
                              height: '100%',
                              backgroundColor: theme.palette.primary.main
                            }
                          }}
                        >
                          <SyntaxHighlighter 
                            language="bash" 
                            style={tomorrow}
                            customStyle={{ 
                              fontSize: '0.9rem',
                              margin: 0,
                              background: 'transparent',
                              padding: 0,
                              color: '#000'
                            }}
                          >
                            {api.baseUrl}
                          </SyntaxHighlighter>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom sx={{ 
                          fontWeight: 600,
                          color: '#000'
                        }}>
                          Endpoint
                        </Typography>
                        <Paper 
                          sx={{ 
                            p: 2, 
                            bgcolor: '#f5f5f5',
                            border: '1px solid',
                            borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
                            borderRadius: 1,
                            position: 'relative',
                            overflow: 'hidden',
                            '& pre': {
                              color: '#000 !important',
                              fontFamily: 'monospace !important'
                            },
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '4px',
                              height: '100%',
                              backgroundColor: theme.palette.secondary.main
                            }
                          }}
                        >
                          <SyntaxHighlighter 
                            language="bash" 
                            style={tomorrow}
                            customStyle={{ 
                              fontSize: '0.9rem',
                              margin: 0,
                              background: 'transparent',
                              padding: 0,
                              color: '#000'
                            }}
                          >
                            {api.endpoint || API_PATH_MAP[api.id]}
                          </SyntaxHighlighter>
                        </Paper>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ApiDocumentation; 