import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Paper,
  useTheme,
  CircularProgress,
  Tooltip,
  IconButton,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';

// Icons
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import SpeedIcon from '@mui/icons-material/Speed';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const ApiPricing = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [apis, setApis] = useState([]);
  const [creditValue] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/v1/available-apis');
        
        // Add marketing tags and competitive analysis
        const enhancedApis = response.data.map(api => ({
          ...api,
          marketingTags: generateMarketingTags(api),
          competitiveAdvantage: generateCompetitiveAdvantage(api),
          savingsExample: calculateSavingsExample(api)
        }));
        
        setApis(enhancedApis);
      } catch (err) {
        console.error('Error fetching APIs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const generateMarketingTags = (api) => {
    const tags = [];
    
    // Cost-effective tag
    if (api.pricing?.credits < 3) {
      tags.push({
        label: '20% Cheaper than competitors',
        icon: <TrendingDownIcon />,
        color: 'success'
      });
    }

    // Performance tag
    if (api.method === 'POST') {
      tags.push({
        label: 'High Performance',
        icon: <SpeedIcon />,
        color: 'primary'
      });
    }

    // New API tag
    if (api.version === '1.0.0') {
      tags.push({
        label: 'New API',
        icon: <NewReleasesIcon />,
        color: 'secondary'
      });
    }

    return tags;
  };

  const generateCompetitiveAdvantage = (api) => {
    switch (api.id) {
      case 'welcome':
        return 'Perfect for testing and integration';
      case 'document-identification':
        return '99.9% accuracy rate - Industry Leading';
      case 'pan-signature-extraction':
        return 'Advanced AI with real-time processing';
      default:
        return 'State-of-the-art technology';
    }
  };

  const calculateSavingsExample = (api) => {
    const monthlyUsage = 1000;
    const ourCost = api.pricing?.credits * monthlyUsage;
    const competitorCost = Math.round(ourCost * 1.2); // Assuming 20% higher competitor prices
    return {
      usage: monthlyUsage,
      saving: competitorCost - ourCost
    };
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, mt: '64px' }}>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          API Pricing
        </Typography>
        <Typography color="textSecondary">
          Transparent, usage-based pricing with no hidden costs. Pay only for what you use.
        </Typography>
        <Paper sx={{ p: 2, mt: 2, bgcolor: theme.palette.primary.main, color: 'white' }}>
          <Typography variant="h6">
            Special Offer! 🎉
          </Typography>
          <Typography>
            Get 100 free credits when you sign up today! Perfect for testing and development.
          </Typography>
        </Paper>
      </Box>

      <Grid container spacing={3}>
        {apis.map((api) => (
          <Grid item xs={12} md={4} key={api.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8]
                }
              }}
            >
              {/* Price Tag */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: -8,
                  bgcolor: theme.palette.secondary.main,
                  color: 'white',
                  py: 0.5,
                  px: 2,
                  borderRadius: '4px 0 0 4px',
                  boxShadow: 2,
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    border: '4px solid transparent',
                    borderTopColor: theme.palette.secondary.dark,
                    borderRightColor: theme.palette.secondary.dark,
                  }
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {api.pricing?.credits} Credits/Call
                </Typography>
              </Box>

              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  {api.title}
                </Typography>

                {/* Marketing Tags */}
                <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                  {api.marketingTags.map((tag, index) => (
                    <Chip
                      key={index}
                      icon={tag.icon}
                      label={tag.label}
                      color={tag.color}
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                  ))}
                </Box>

                <Typography color="textSecondary" paragraph>
                  {api.description}
                </Typography>

                <Divider sx={{ my: 2 }} />

                {/* Competitive Advantage */}
                <Box mb={2}>
                  <Typography variant="subtitle2" color="primary" sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    fontWeight: 600 
                  }}>
                    <CheckCircleIcon fontSize="small" />
                    {api.competitiveAdvantage}
                  </Typography>
                </Box>

                {/* Savings Example */}
                <Paper 
                  sx={{ 
                    p: 2, 
                    bgcolor: theme.palette.success.light,
                    color: theme.palette.success.contrastText,
                    mb: 2
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    💰 Potential Monthly Savings
                  </Typography>
                  <Typography>
                    Save ₹{api.savingsExample.saving.toLocaleString()} on {api.savingsExample.usage.toLocaleString()} calls
                  </Typography>
                </Paper>

                {/* Price Breakdown */}
                <Box mb={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Price Breakdown:
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    • {api.pricing?.credits} credits = ₹{api.pricing?.credits * creditValue}
                    <Tooltip title="Based on current credit value">
                      <IconButton size="small">
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Typography>
                </Box>
              </CardContent>

              <Box p={2} pt={0}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => navigate(`/api/${api.id}`)}
                  startIcon={<LocalOfferIcon />}
                  sx={{ mb: 1 }}
                >
                  Try It Now
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/buy-credits')}
                  startIcon={<CompareArrowsIcon />}
                >
                  Buy Credits
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Volume Pricing */}
      <Paper sx={{ mt: 4, p: 3, bgcolor: theme.palette.background.paper }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          Volume Pricing
        </Typography>
        <Typography color="textSecondary" paragraph>
          Save more when you use more. Contact us for custom pricing on high-volume usage.
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: theme.palette.primary.light, color: 'white' }}>
              <CardContent>
                <Typography variant="h6">10,000+ calls/month</Typography>
                <Typography>10% discount on all APIs</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: theme.palette.secondary.light, color: 'white' }}>
              <CardContent>
                <Typography variant="h6">50,000+ calls/month</Typography>
                <Typography>15% discount on all APIs</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: theme.palette.success.light, color: 'white' }}>
              <CardContent>
                <Typography variant="h6">100,000+ calls/month</Typography>
                <Typography>Custom pricing available</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ApiPricing; 