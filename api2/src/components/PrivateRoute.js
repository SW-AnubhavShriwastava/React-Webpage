// src/components/PrivateRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './Navbar';

const PrivateRoute = () => {
  const token = localStorage.getItem('token');
  const userDetails = localStorage.getItem('userDetails');

  if (!token || !userDetails) {
    return <Navigate to="/login" />;
  }

  return (
    <Box>
      <Navbar />
      <Box sx={{ 
        paddingTop: '64px', // Height of navbar
        minHeight: 'calc(100vh - 64px)'
      }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default PrivateRoute;
