import React, { useState, useEffect } from 'react';
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Select,
  FormControl,
  InputLabel,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  Chip
} from '@mui/material';
import SortIcon from '@mui/icons-material/Sort';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import RefreshIcon from '@mui/icons-material/Refresh';
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
  const [openTransactions, setOpenTransactions] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [filterType, setFilterType] = useState('ALL');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const showMessage = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Simple function to fetch transactions
  const fetchTransactions = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      
      // Fetch transactions
      const transactionResponse = await axiosInstance.get('/auth/transactions', {
        params: {
          page,
          limit: rowsPerPage,
          type: filterType !== 'ALL' ? filterType : undefined,
          sortBy,
          sortOrder,
          startDate: dateRange.start || undefined,
          endDate: dateRange.end || undefined,
          timestamp: Date.now() // Cache buster
        }
      });

      // Fetch updated user details
      const userResponse = await axiosInstance.get('/auth/me');

      // Update states
      if (transactionResponse.data) {
        setTransactions(transactionResponse.data.transactions);
        setTotalTransactions(transactionResponse.data.total);
      }

      if (userResponse.data) {
        setUserDetails(userResponse.data);
        localStorage.setItem('userDetails', JSON.stringify(userResponse.data));
      }

      showMessage('Data refreshed successfully', 'success');
    } catch (error) {
      console.error('Error fetching data:', error);
      showMessage('Error refreshing data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when dialog opens or filters change
  useEffect(() => {
    if (openTransactions) {
      fetchTransactions();
    }
  }, [openTransactions, page, rowsPerPage, filterType, sortBy, sortOrder, dateRange]);

  // Handle manual refresh
  const handleRefreshClick = () => {
    fetchTransactions();
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Add missing handler functions
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
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getTransactionColor = (type) => {
    return type === 'CREDIT' ? 'success.main' : 'error.main';
  };

  const formatAmount = (type, amount) => {
    return `${type === 'CREDIT' ? '+' : '-'}${Math.abs(amount)}`;
  };

  return (
    <>
      <AppBar position="fixed" sx={{ backgroundColor: '#000000', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
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

          <Button
            onClick={() => setOpenTransactions(true)}
            startIcon={<ReceiptLongIcon />}
            sx={{
              mr: 3,
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              padding: '8px 16px',
              borderRadius: '4px',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              }
            }}
          >
            Credits: {userDetails?.credits || 0}
          </Button>

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

      <Dialog
        open={openTransactions}
        onClose={() => setOpenTransactions(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Transaction History</Typography>
            <Box display="flex" gap={2}>
              <Button 
                size="small"
                onClick={handleRefreshClick}
                startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
                disabled={loading}
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </Button>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Filter</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  label="Filter"
                >
                  <MenuItem value="ALL">All</MenuItem>
                  <MenuItem value="CREDIT">Credits</MenuItem>
                  <MenuItem value="DEBIT">Debits</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort By"
                >
                  <MenuItem value="timestamp">Date</MenuItem>
                  <MenuItem value="amount">Amount</MenuItem>
                </Select>
              </FormControl>
              <IconButton 
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                size="small"
              >
                <SortIcon />
              </IconButton>
            </Box>
          </Box>
          <Box display="flex" gap={2} mt={2}>
            <TextField
              label="Start Date"
              type="date"
              size="small"
              InputLabelProps={{ shrink: true }}
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
            <TextField
              label="End Date"
              type="date"
              size="small"
              InputLabelProps={{ shrink: true }}
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          {loading && transactions.length === 0 ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="right">Balance</TableCell>
                      <TableCell>Source</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction._id}>
                        <TableCell>
                          {new Date(transaction.timestamp).toLocaleDateString()}
                          <Typography variant="caption" display="block" color="textSecondary">
                            {new Date(transaction.timestamp).toLocaleTimeString()}
                          </Typography>
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell 
                          align="right"
                          sx={{ color: getTransactionColor(transaction.type) }}
                        >
                          {formatAmount(transaction.type, transaction.amount)}
                        </TableCell>
                        <TableCell align="right">{transaction.balance}</TableCell>
                        <TableCell>
                          <Chip 
                            label={transaction.source} 
                            size="small"
                            color={transaction.source === 'PURCHASE' ? 'primary' : 'default'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={totalTransactions}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[10, 25, 50]}
              />
            </>
          )}
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Navbar;