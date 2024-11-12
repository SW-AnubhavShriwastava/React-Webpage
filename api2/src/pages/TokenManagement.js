import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Snackbar,
  Alert,
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import axiosInstance from '../axiosInstance';

function TokenManagement() {
  const [tokens, setTokens] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [tokenName, setTokenName] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('info');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const fetchTokens = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/auth/tokens');
      setTokens(response.data);
    } catch (error) {
      console.error('Error fetching tokens:', error);
      showMessage('Error fetching tokens: ' + (error.response?.data?.message || 'Unknown error'), 'error');
    }
  }, []);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  const handleCreateToken = async () => {
    try {
      const response = await axiosInstance.post('/auth/tokens', { 
        name: tokenName 
      });
      
      if (response.data && response.data.token) {
        setTokens(prevTokens => [...prevTokens, response.data]);
        setOpenDialog(false);
        setTokenName('');
        showMessage('Token created successfully! Token copied to clipboard.', 'success');
        copyToClipboard(response.data.token);
      } else {
        showMessage('Invalid response from server', 'error');
      }
    } catch (error) {
      console.error('Error creating token:', error);
      showMessage(error.response?.data?.message || 'Error creating token', 'error');
    }
  };

  const handleDeleteToken = async (tokenId) => {
    try {
      console.log('Attempting to delete token:', tokenId);
      
      const response = await axiosInstance.delete(`/auth/tokens/${tokenId}`);
      console.log('Delete response:', response);
      
      if (response.data.success) {
        setTokens(prevTokens => prevTokens.filter(token => token._id !== tokenId));
        showMessage('Token deleted successfully', 'success');
      } else {
        showMessage(response.data.message || 'Error deleting token', 'error');
      }
    } catch (error) {
      console.error('Error deleting token:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Error deleting token. Please try again.';
      showMessage(errorMessage, 'error');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showMessage('Token copied to clipboard!', 'success');
  };

  const showMessage = (msg, sev) => {
    setMessage(msg);
    setSeverity(sev);
    setOpenSnackbar(true);
  };

  return (
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" gutterBottom>API Access Tokens</Typography>
          <Typography variant="body2" color="textSecondary">
            Manage your API access tokens. Each token can be used to authenticate API requests.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenDialog(true)}
          startIcon={<ContentCopyIcon />}
        >
          Generate New Token
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Token</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Last Used</TableCell>
              <TableCell>Usage Count</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tokens.map((token) => (
              <TableRow key={token._id}>
                <TableCell>{token.name}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {`${token.token.substring(0, 15)}...`}
                    </Typography>
                    <Tooltip title="Copy full token">
                      <IconButton size="small" onClick={() => copyToClipboard(token.token)}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell>{new Date(token.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  {token.lastUsed ? new Date(token.lastUsed).toLocaleDateString() : 'Never'}
                </TableCell>
                <TableCell>{token.usageCount}</TableCell>
                <TableCell>
                  <Chip
                    label={token.isActive ? 'Active' : 'Inactive'}
                    color={token.isActive ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Delete token">
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteToken(token._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate New Access Token</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <TextField
              autoFocus
              label="Token Name"
              fullWidth
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              helperText="Give your token a memorable name for easy identification"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateToken} 
            variant="contained" 
            color="primary"
            disabled={!tokenName.trim()}
          >
            Generate
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={6000} 
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity={severity} 
          sx={{ width: '100%' }}
        >
          {message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default TokenManagement; 