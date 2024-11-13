import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  Card,
  CardContent,
  CardActions,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import axiosInstance from '../axiosInstance';

// Predefined packages
const creditPackages = [
  {
    id: 1,
    credits: 100,
    price: 100,
    name: 'Starter Pack',
    description: 'Perfect for testing and small projects',
    popular: false
  },
  {
    id: 2,
    credits: 500,
    price: 500,
    name: 'Professional Pack',
    description: 'Ideal for regular usage and medium projects',
    popular: true,
    savings: '10% bonus credits'
  },
  {
    id: 3,
    credits: 1000,
    price: 1000,
    name: 'Business Pack',
    description: 'Best value for larger projects',
    popular: false,
    savings: '15% bonus credits'
  }
];

function BuyCredits() {
  const [customAmount, setCustomAmount] = useState('');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [openCheckout, setOpenCheckout] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleCustomAmountChange = (event) => {
    const value = event.target.value;
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) > 0)) {
      setCustomAmount(value);
      setSelectedPackage(null);
    }
  };

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
    setCustomAmount('');
    setOpenCheckout(true);
  };

  const handleCustomPurchase = () => {
    if (customAmount && parseInt(customAmount) > 0) {
      setSelectedPackage({
        credits: parseInt(customAmount),
        price: parseInt(customAmount),
        name: 'Custom Package'
      });
      setOpenCheckout(true);
    }
  };

  const calculateBonus = (amount) => {
    if (amount >= 1000) return Math.floor(amount * 0.15);
    if (amount >= 500) return Math.floor(amount * 0.10);
    return 0;
  };

  const handleCheckout = async () => {
    setProcessing(true);
    setError('');

    try {
      const response = await axiosInstance.post('/payments/initiate', {
        amount: selectedPackage.price,
        credits: selectedPackage.credits + calculateBonus(selectedPackage.credits)
      });

      // Handle the response
      if (response.data.success) {
        setProcessing(false);
        alert('Payment successful! Credits added to your account.');
        setOpenCheckout(false);
        window.location.reload(); // Refresh to update credits display
      } else {
        setProcessing(false);
        setError(response.data.message || 'Payment failed. Please try again.');
      }

    } catch (error) {
      setProcessing(false);
      setError(error.response?.data?.message || 'Payment failed. Please try again.');
    }
  };

  return (
    <Box p={{ xs: 2, sm: 3, md: 4 }}>
      <Typography variant="h4" gutterBottom>
        Buy Credits
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" paragraph>
        1 Credit = ₹1 | Instant activation | No expiry
      </Typography>

      {/* Preset Packages */}
      <Grid container spacing={{ xs: 2, sm: 3 }} mb={4}>
        {creditPackages.map((pkg) => (
          <Grid item xs={12} sm={6} md={4} key={pkg.id}>
            <Card 
              elevation={pkg.popular ? 8 : 3}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                border: pkg.popular ? '2px solid #1976d2' : 'none',
                transform: pkg.popular ? { xs: 'none', md: 'scale(1.02)' } : 'none',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: pkg.popular ? 
                    { xs: 'scale(1.01)', md: 'scale(1.03)' } : 
                    'scale(1.01)'
                }
              }}
            >
              {pkg.popular && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -10,
                    right: 20,
                    backgroundColor: '#1976d2',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    fontSize: '0.75rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    zIndex: 1,
                    transform: 'translateY(-50%)'
                  }}
                >
                  MOST POPULAR
                </Box>
              )}
              <CardContent 
                sx={{ 
                  flexGrow: 1, 
                  p: { xs: 2, sm: 3 },
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1
                }}
              >
                <Typography 
                  variant="h5" 
                  color={pkg.popular ? 'primary' : 'inherit'}
                  sx={{ 
                    fontWeight: pkg.popular ? 600 : 400,
                    mb: 1
                  }}
                >
                  {pkg.name}
                </Typography>
                <Typography 
                  variant="h4" 
                  color="primary" 
                  sx={{ 
                    fontWeight: pkg.popular ? 700 : 600,
                    fontSize: { xs: '1.75rem', sm: '2rem', md: pkg.popular ? '2.5rem' : '2rem' }
                  }}
                >
                  ₹{pkg.price}
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontSize: pkg.popular ? '1.1rem' : '1rem',
                    fontWeight: pkg.popular ? 500 : 400
                  }}
                >
                  {pkg.credits} Credits
                </Typography>
                {pkg.savings && (
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      gap: 0.5,
                      color: 'success.main',
                      fontWeight: 500,
                      mt: 1
                    }}
                  >
                    <LocalOfferIcon sx={{ fontSize: 16 }} />
                    <Typography variant="body2">
                      {pkg.savings}
                    </Typography>
                  </Box>
                )}
                <Typography 
                  variant="body2" 
                  color="textSecondary" 
                  sx={{ 
                    mt: 2,
                    fontSize: pkg.popular ? '0.9rem' : '0.875rem'
                  }}
                >
                  {pkg.description}
                </Typography>
              </CardContent>
              <CardActions 
                sx={{ 
                  p: { xs: 2, sm: 3 }, 
                  pt: 0
                }}
              >
                <Button 
                  fullWidth 
                  variant={pkg.popular ? "contained" : "outlined"}
                  onClick={() => handlePackageSelect(pkg)}
                  size={pkg.popular ? "large" : "medium"}
                  sx={{
                    fontWeight: pkg.popular ? 600 : 400,
                    py: pkg.popular ? 1.5 : 1,
                    fontSize: pkg.popular ? '1rem' : '0.875rem'
                  }}
                >
                  Select Package
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Custom Amount */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, sm: 3 }, 
          mt: 4 
        }}
      >
        <Typography variant="h6" gutterBottom>
          Custom Amount
        </Typography>
        <Box 
          display="flex" 
          flexDirection={{ xs: 'column', sm: 'row' }} 
          alignItems={{ xs: 'stretch', sm: 'center' }} 
          gap={2}
        >
          <TextField
            label="Enter amount in ₹"
            value={customAmount}
            onChange={handleCustomAmountChange}
            type="number"
            InputProps={{
              startAdornment: <CurrencyRupeeIcon sx={{ color: 'action.active', mr: 1 }} />,
            }}
            helperText="Minimum ₹100"
            sx={{ 
              flexGrow: 1,
              maxWidth: { sm: '200px' }
            }}
          />
          <Button
            variant="contained"
            disabled={!customAmount || parseInt(customAmount) < 100}
            onClick={handleCustomPurchase}
            sx={{
              height: { xs: '48px', sm: '40px' }
            }}
          >
            Buy Credits
          </Button>
        </Box>
      </Paper>

      {/* Checkout Dialog */}
      <Dialog open={openCheckout} onClose={() => !processing && setOpenCheckout(false)}>
        <DialogTitle>Checkout</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ minWidth: 300, pt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography>Package:</Typography>
              <Typography>{selectedPackage?.name}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography>Base Credits:</Typography>
              <Typography>{selectedPackage?.credits}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography>Bonus Credits:</Typography>
              <Typography>{calculateBonus(selectedPackage?.credits || 0)}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="h6">Total Amount:</Typography>
              <Typography variant="h6">₹{selectedPackage?.price}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="h6">Total Credits:</Typography>
              <Typography variant="h6" color="primary">
                {selectedPackage?.credits + calculateBonus(selectedPackage?.credits || 0)}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenCheckout(false)} 
            disabled={processing}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCheckout}
            disabled={processing}
            startIcon={processing ? null : <ShoppingCartIcon />}
          >
            {processing ? 'Processing...' : 'Pay Now'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default BuyCredits; 