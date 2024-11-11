// Home.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { categories } from '../data/categories';
import { apis } from '../data/apis';
import { Box, Typography, Paper, TextField, Grid, Button } from '@mui/material';
import './Home.css';

function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if no token is found in localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const filteredApis = apis.filter((api) => {
    const inCategory = selectedCategory === 'all' || api.category === selectedCategory;
    const inSearch = api.title.toLowerCase().includes(searchTerm.toLowerCase());
    return inCategory && inSearch;
  });

  return (
    <Box display="flex" minHeight="100vh">
      {/* Sidebar */}
      <Box width="250px" bgcolor="#1976d2" color="white" p={2}>
        <Typography variant="h5" gutterBottom><b>Categories</b></Typography>
        {categories.map((category) => (
          <Button
            key={category.key}
            color="inherit"
            style={{
              textAlign: 'left',
              color: 'white',
              display: 'block',
              width: '100%',
              padding: '10px 0',
            }}
            onClick={() => handleCategoryChange(category.key)}
          >
            {category.name}
          </Button>
        ))}
      </Box>

      {/* Main Content */}
      <Box flex={1} p={4}>
        <TextField
          label="Search here..."
          variant="outlined"
          fullWidth
          margin="normal"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Grid container spacing={3}>
          {filteredApis.map((api) => (
            <Grid item xs={12} sm={6} md={4} key={api.title}>
              <Button
                onClick={() => navigate(`/api/${api.title.replace(/\s+/g, '-').toLowerCase()}`)}
                style={{ textDecoration: 'none', width: '100%' }}
              >
                <Paper
                  elevation={3}
                  sx={{
                    padding: 2,
                    height: '125px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    backgroundColor: '#f5f5f5',
                  }}
                >
                  <Typography variant="h6" color="primary" gutterBottom>
                    {api.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {api.description}
                  </Typography>
                </Paper>
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}

export default Home;
