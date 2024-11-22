import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Tooltip,
  IconButton,
  useTheme
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import axiosInstance from '../axiosInstance';

const UsageInsights = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [usageData, setUsageData] = useState({
    totalCalls: 0,
    averageResponseTime: 0,
    apiUsageByName: [],
    usageOverTime: [],
    statusCodeDistribution: [],
    topEndpoints: [],
    successRate: 0
  });

  const fetchUsageData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/v1/analytics', {
        params: { timeRange }
      });
      setUsageData(response.data);
    } catch (error) {
      console.error('Error fetching usage data:', error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchUsageData();
  }, [fetchUsageData]);

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    '#8884d8',
    '#82ca9d',
    '#ffc658'
  ];

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, mt: '64px' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Usage Insights
        </Typography>
        <Box display="flex" gap={2}>
          <FormControl size="small">
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="24h">Last 24 Hours</MenuItem>
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="90d">Last 90 Days</MenuItem>
            </Select>
          </FormControl>
          <IconButton onClick={fetchUsageData}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: theme.palette.background.paper }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total API Calls
              </Typography>
              <Typography variant="h3" color="primary">
                {usageData.totalCalls.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: theme.palette.background.paper }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Response Time
              </Typography>
              <Typography variant="h3" color="secondary">
                {usageData.averageResponseTime.toFixed(2)}ms
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: theme.palette.background.paper }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Success Rate
              </Typography>
              <Typography variant="h3" color="success.main">
                {(usageData.successRate * 100).toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Usage Over Time Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: theme.palette.background.paper }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Typography variant="h6">API Usage Over Time</Typography>
              <Tooltip title="Shows the number of API calls over time">
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={usageData.usageOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <YAxis />
                <ChartTooltip 
                  formatter={(value, name) => [value, 'API Calls']}
                  labelFormatter={(date) => new Date(date).toLocaleString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="calls" 
                  stroke={theme.palette.primary.main} 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* API Distribution Pie Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, bgcolor: theme.palette.background.paper }}>
            <Typography variant="h6" gutterBottom>
              API Usage Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={usageData.apiUsageByName}
                  dataKey="calls"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.name} (${entry.calls})`}
                >
                  {usageData.apiUsageByName.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <ChartTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Top Endpoints Bar Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, bgcolor: theme.palette.background.paper }}>
            <Typography variant="h6" gutterBottom>
              Top Endpoints by Usage
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={usageData.topEndpoints} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <ChartTooltip />
                <Bar dataKey="calls" fill={theme.palette.primary.main}>
                  {usageData.topEndpoints.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UsageInsights; 