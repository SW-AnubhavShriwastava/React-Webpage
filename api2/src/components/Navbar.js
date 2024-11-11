import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Divider,
} from '@mui/material';
import axiosInstance from '../axiosInstance';

const Navbar = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [userDetails, setUserDetails] = useState(() => {
    try {
      const stored = localStorage.getItem('userDetails');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const fetchUserDetails = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axiosInstance.get('/auth/me');
      if (response.data) {
        setUserDetails(response.data);
        localStorage.setItem('userDetails', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userDetails');
        navigate('/login');
      }
    }
  }, [navigate]);

  // Fetch user details on mount and when localStorage changes
  useEffect(() => {
    fetchUserDetails();

    // Add event listener for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'userDetails' || e.key === 'token') {
        fetchUserDetails();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Set up periodic refresh (every 30 seconds)
    const refreshInterval = setInterval(fetchUserDetails, 30000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(refreshInterval);
    };
  }, [fetchUserDetails]);

  // Add event listener for visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchUserDetails();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchUserDetails]);

  // Refresh user details after API calls
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if (args[0].includes('/api/v1/')) {
        fetchUserDetails();
      }
      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [fetchUserDetails]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userDetails');
    navigate('/login');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (!userDetails) {
    return null;
  }

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        backgroundColor: '#000000',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        height: '64px',
      }}
    >
      <Toolbar sx={{ 
        minHeight: '64px',
        height: '64px',
        padding: '0 16px'
      }}>
        {/* Logo */}
        <Box 
          sx={{ 
            flexGrow: 0, 
            mr: 2, 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            height: '64px',
            width: 'auto',
            padding: '12px 0',
            transform: 'none !important'
          }} 
          onClick={() => navigate('/home')}
        >
          <img
            src="https://raw.githubusercontent.com/SW-AnubhavShriwastava/localhost/main/logo2_2.png"
            alt="Logo"
            style={{ 
              height: '40px',
              width: 'auto',
              objectFit: 'contain',
              transform: 'none'
            }}
          />
        </Box>

        {/* Navigation Links */}
        <Box sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          gap: 3,
          alignItems: 'center',
          height: '64px'
        }}>
          <Typography 
            variant="body1" 
            sx={{ 
              cursor: 'pointer', 
              color: 'white',
              fontWeight: 500,
              padding: '8px 16px',
              borderRadius: '4px',
              transition: 'background-color 0.2s ease',
              transform: 'none !important',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                transform: 'none !important'
              }
            }}
            onClick={() => navigate('/api-documentation')}
          >
            API Documentation
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              cursor: 'pointer', 
              color: 'white',
              fontWeight: 500,
              padding: '8px 16px',
              borderRadius: '4px',
              transition: 'background-color 0.2s ease',
              transform: 'none !important',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                transform: 'none !important'
              }
            }}
            onClick={() => navigate('/api-pricing')}
          >
            API Pricing
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              cursor: 'pointer', 
              color: 'white',
              fontWeight: 500,
              padding: '8px 16px',
              borderRadius: '4px',
              transition: 'background-color 0.2s ease',
              transform: 'none !important',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                transform: 'none !important'
              }
            }}
            onClick={() => navigate('/buy-credits')}
          >
            Buy Credits
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              cursor: 'pointer', 
              color: 'white',
              fontWeight: 500,
              padding: '8px 16px',
              borderRadius: '4px',
              transition: 'background-color 0.2s ease',
              transform: 'none !important',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                transform: 'none !important'
              }
            }}
            onClick={() => navigate('/token-management')}
          >
            Token Management
          </Typography>
        </Box>

        {/* Credits Display */}
        <Typography 
          variant="body1" 
          sx={{ 
            mr: 3, 
            color: 'white',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            padding: '8px 16px',
            borderRadius: '4px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            transform: 'none !important'
          }}
        >
          Credits: {userDetails.credits}
        </Typography>

        {/* Profile Menu */}
        <IconButton 
          onClick={handleMenu} 
          color="inherit"
          sx={{ 
            border: '2px solid rgba(255, 255, 255, 0.2)',
            padding: '8px',
            transition: 'background-color 0.2s ease',
            transform: 'none !important',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              transform: 'none !important'
            }
          }}
        >
          <Avatar sx={{ 
            bgcolor: '#1565c0',
            width: 32,
            height: 32,
            transform: 'none !important'
          }}>
            {userDetails.firstName ? userDetails.firstName[0].toUpperCase() : 'U'}
          </Avatar>
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            elevation: 3,
            sx: {
              minWidth: '200px',
              mt: 1.5,
              '& .MuiMenuItem-root': {
                padding: '12px 16px'
              }
            }
          }}
        >
          <MenuItem disabled sx={{ opacity: 1 }}>
            <Box>
              <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 600 }}>
                {`${getGreeting()}, ${userDetails.firstName || 'User'}!`}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {userDetails.email}
              </Typography>
            </Box>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => {
            navigate('/subscriptions');
            handleClose();
          }}>
            My Subscriptions
          </MenuItem>
          <MenuItem onClick={() => {
            navigate('/usage-insights');
            handleClose();
          }}>
            Usage Insights
          </MenuItem>
          <MenuItem onClick={() => {
            window.location.href = 'mailto:support@swaroop.ai';
            handleClose();
          }}>
            Contact Support
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: '#d32f2f' }}>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;