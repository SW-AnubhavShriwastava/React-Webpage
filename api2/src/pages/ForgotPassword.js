import React, { useState } from 'react';
import axios from 'axios';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false); // To handle success status
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setMessage(response.data.message || 'Password reset email sent successfully! Redirecting to login...');
      setIsSuccess(true);

      // Redirect to login after 5 seconds
      setTimeout(() => navigate('/'), 5000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to send reset link, please try again.');
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
          <Typography variant="h4">Forgot Password</Typography>
          {message && (
            <Typography color={isSuccess ? 'primary' : 'error'} mt={1}>
              {message}
            </Typography>
          )}
        </Box>
        <form onSubmit={handleForgotPassword}>
          <TextField
            label="Enter your email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            Send Reset Link
          </Button>
        </form>
        <Box mt={2} textAlign="center">
          <Button
            variant="text"
            color="primary"
            onClick={() => navigate('/')}
          >
            Back to Login
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default ForgotPassword;
