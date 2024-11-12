import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';

function Login() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userDetails = localStorage.getItem('userDetails');
    if (token && userDetails) {
      navigate('/home');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear previous messages
    
    try {
      const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      console.log('Sending login request with:', { usernameOrEmail, password });
      
      const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
        usernameOrEmail,
        password,
      });

      console.log('Login response:', response.data);

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        if (response.data.user) {
          localStorage.setItem('userDetails', JSON.stringify(response.data.user));
        }
        setMessage('Login successful! Redirecting...');
        setTimeout(() => navigate('/home'), 1000);
      } else {
        setMessage('Invalid response from server: No token received');
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage(
        error.response?.data?.message || 
        'Login failed. Please check your credentials and try again.'
      );
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f0f2f5">
      <Paper elevation={3} sx={{ padding: 4, width: '100%', maxWidth: 400 }}>
        <Box textAlign="center" mb={2}>
          <Typography variant="h4">Login</Typography>
          {message && (
            <Typography 
              color={message.includes('successful') ? 'primary' : 'error'} 
              mt={1}
            >
              {message}
            </Typography>
          )}
        </Box>
        <form onSubmit={handleLogin}>
          <TextField
            label="Username or Email"
            fullWidth
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
            required
            margin="normal"
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            Login
          </Button>
        </form>
        <Box mt={2} textAlign="center">
          <Link to="/forgot-username" style={{ textDecoration: 'none', color: '#1976d2' }}>
            Forgot Username?
          </Link>
          <br />
          <Link to="/forgot-password" style={{ textDecoration: 'none', color: '#1976d2' }}>
            Forgot Password?
          </Link>
        </Box>
        <Box mt={1} textAlign="center">
          <Typography variant="body2">
            Don't have an account?{' '}
            <Link to="/signup" style={{ textDecoration: 'none', color: '#1976d2' }}>
              Sign up
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default Login;
