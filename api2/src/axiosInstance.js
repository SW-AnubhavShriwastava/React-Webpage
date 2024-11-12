// src/axiosInstance.js
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create an axios instance
const axiosInstance = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include the token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
