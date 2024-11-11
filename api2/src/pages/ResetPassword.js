import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';

function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    try {
      console.log('Attempting to reset password with token:', token);
      const response = await axios.post('http://localhost:5000/api/auth/reset-password', {
        token,
        newPassword
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Reset password response:', response.data);
      setMessage(response.data.message || 'Password reset successful!');
      setIsSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      console.error('Reset password error:', error.response || error);
      setMessage(
        error.response?.data?.message || 
        'Failed to reset password. Please try again.'
      );
      setIsSuccess(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#f0f2f5"
    >
      <Paper elevation={3} sx={{ padding: 4, width: '100%', maxWidth: 400 }}>
        <Box textAlign="center" mb={2}>
          <Typography variant="h4">Reset Password</Typography>
          {message && (
            <Typography color={isSuccess ? 'primary' : 'error'} mt={1}>
              {message}
            </Typography>
          )}
        </Box>
        <form onSubmit={handleResetPassword}>
          <TextField
            label="New Password"
            type="password"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            margin="normal"
          />
          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            margin="normal"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ marginTop: 2 }}
          >
            Reset Password
          </Button>
        </form>
        <Box mt={2} textAlign="center">
          <Button
            variant="text"
            color="primary"
            onClick={() => navigate('/login')}
          >
            Back to Login
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default ResetPassword; 