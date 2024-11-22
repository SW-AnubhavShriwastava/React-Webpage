import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  Chip,
  Tabs,
  Tab,
  IconButton,
  Paper,
  Button,
  Divider,
  Alert
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as OpenIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import axiosInstance from '../axiosInstance';

const AdminSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const fileInputRef = React.useRef();

  // Filter tickets based on status and search/filter criteria
  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = tabValue === 0 ? 
      ['OPEN', 'IN_PROGRESS'].includes(ticket.status) :
      ['RESOLVED', 'CLOSED'].includes(ticket.status);

    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.messages.some(msg => msg.content.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPriority = filterPriority === 'ALL' || ticket.priority === filterPriority;

    return matchesStatus && matchesSearch && matchesPriority;
  });

  // Fetch all tickets
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await axiosInstance.get('/support/admin/tickets');
        setTickets(response.data);
      } catch (error) {
        console.error('Error fetching tickets:', error);
        setError('Failed to fetch tickets');
      }
    };

    fetchTickets();
    // Set up polling for new tickets
    const interval = setInterval(fetchTickets, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle sending admin response
  const handleSendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) return;

    try {
      const formData = new FormData();
      formData.append('message', newMessage);
      formData.append('isAdminResponse', 'true');
      attachments.forEach(file => {
        formData.append('attachments', file);
      });

      await axiosInstance.post(
        `/support/admin/tickets/${selectedTicket.ticketId}/messages`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      // Refresh ticket data
      const response = await axiosInstance.get('/support/admin/tickets');
      setTickets(response.data);
      setSelectedTicket(response.data.find(t => t.ticketId === selectedTicket.ticketId));
      setNewMessage('');
      setAttachments([]);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  // Handle ticket status change
  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const response = await axiosInstance.patch(`/support/admin/tickets/${ticketId}/status`, {
        status: newStatus
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Refresh tickets list
      const ticketsResponse = await axiosInstance.get('/support/admin/tickets');
      setTickets(ticketsResponse.data);

      // Update selected ticket if it exists
      if (selectedTicket && selectedTicket.ticketId === ticketId) {
        setSelectedTicket(response.data);
      }

      setError(null);
    } catch (error) {
      console.error('Error updating ticket status:', error);
      setError('Failed to update ticket status');
    }
  };

  // Handle priority change
  const handlePriorityChange = async (ticketId, newPriority) => {
    try {
      await axiosInstance.patch(`/support/admin/tickets/${ticketId}/priority`, {
        priority: newPriority
      });
      const response = await axiosInstance.get('/support/admin/tickets');
      setTickets(response.data);
      setSelectedTicket(prev => prev && {
        ...prev,
        priority: newPriority
      });
    } catch (error) {
      console.error('Error updating ticket priority:', error);
      setError('Failed to update ticket priority');
    }
  };

  return (
    <Box sx={{ p: 3, mt: '64px' }}>
      <Typography variant="h4" gutterBottom>
        Support Admin Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Tickets List */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box mb={2}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon color="action" />,
                  }}
                />
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={filterPriority}
                    label="Priority"
                    onChange={(e) => setFilterPriority(e.target.value)}
                  >
                    <MenuItem value="ALL">All</MenuItem>
                    <MenuItem value="LOW">Low</MenuItem>
                    <MenuItem value="MEDIUM">Medium</MenuItem>
                    <MenuItem value="HIGH">High</MenuItem>
                    <MenuItem value="URGENT">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Tabs
                value={tabValue}
                onChange={(e, newValue) => setTabValue(newValue)}
                sx={{ mb: 2 }}
              >
                <Tab 
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <OpenIcon color="primary" />
                      {`Active (${tickets.filter(t => ['OPEN', 'IN_PROGRESS'].includes(t.status)).length})`}
                    </Box>
                  } 
                />
                <Tab 
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <CheckCircleIcon color="success" />
                      {`Closed (${tickets.filter(t => ['RESOLVED', 'CLOSED'].includes(t.status)).length})`}
                    </Box>
                  } 
                />
              </Tabs>

              <List>
                {filteredTickets.map((ticket) => (
                  <ListItem
                    key={ticket._id}
                    button
                    selected={selectedTicket?._id === ticket._id}
                    onClick={() => setSelectedTicket(ticket)}
                    sx={{
                      mb: 1,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {ticket.subject}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            User: {ticket.userId.email}
                          </Typography>
                          <Box display="flex" gap={1} mt={1}>
                            <Chip
                              size="small"
                              label={ticket.status}
                              color={
                                ticket.status === 'OPEN' ? 'primary' :
                                ticket.status === 'IN_PROGRESS' ? 'warning' :
                                ticket.status === 'RESOLVED' ? 'success' :
                                'error'
                              }
                            />
                            <Chip
                              size="small"
                              label={ticket.priority}
                              color={
                                ticket.priority === 'URGENT' ? 'error' :
                                ticket.priority === 'HIGH' ? 'warning' :
                                ticket.priority === 'MEDIUM' ? 'info' :
                                'success'
                              }
                            />
                          </Box>
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption">
                          Created: {new Date(ticket.createdAt).toLocaleString()}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Conversation View */}
        <Grid item xs={12} md={8}>
          {selectedTicket ? (
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box>
                    <Typography variant="h6">{selectedTicket.subject}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      Ticket ID: {selectedTicket.ticketId}
                    </Typography>
                  </Box>
                  <Box display="flex" gap={2}>
                    <FormControl size="small">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={selectedTicket.status}
                        label="Status"
                        onChange={(e) => handleStatusChange(selectedTicket.ticketId, e.target.value)}
                      >
                        <MenuItem value="OPEN">Open</MenuItem>
                        <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                        <MenuItem value="RESOLVED">Resolved</MenuItem>
                        <MenuItem value="CLOSED">Closed</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl size="small">
                      <InputLabel>Priority</InputLabel>
                      <Select
                        value={selectedTicket.priority}
                        label="Priority"
                        onChange={(e) => handlePriorityChange(selectedTicket.ticketId, e.target.value)}
                      >
                        <MenuItem value="LOW">Low</MenuItem>
                        <MenuItem value="MEDIUM">Medium</MenuItem>
                        <MenuItem value="HIGH">High</MenuItem>
                        <MenuItem value="URGENT">Urgent</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Messages */}
                <Paper 
                  sx={{ 
                    p: 2, 
                    mb: 2, 
                    maxHeight: '400px',
                    overflowY: 'auto'
                  }}
                >
                  <List>
                    {selectedTicket.messages.map((message, index) => (
                      <ListItem
                        key={index}
                        sx={{
                          flexDirection: 'column',
                          alignItems: message.sender === 'SUPPORT' ? 'flex-end' : 'flex-start',
                          mb: 2
                        }}
                      >
                        <Paper
                          elevation={1}
                          sx={{
                            p: 2,
                            maxWidth: '80%',
                            bgcolor: message.sender === 'SUPPORT' ? 'primary.light' : 'grey.100'
                          }}
                        >
                          <Typography variant="body1">
                            {message.content}
                          </Typography>
                          {message.attachments?.length > 0 && (
                            <Box mt={1}>
                              {message.attachments.map((attachment, i) => (
                                <Chip
                                  key={i}
                                  label={attachment.filename}
                                  size="small"
                                  sx={{ mr: 1 }}
                                />
                              ))}
                            </Box>
                          )}
                          <Typography variant="caption" color="textSecondary" display="block" mt={1}>
                            {message.sender} • {new Date(message.timestamp).toLocaleString()}
                          </Typography>
                        </Paper>
                      </ListItem>
                    ))}
                  </List>
                </Paper>

                {/* Reply Box */}
                <Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Type your response..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <input
                        type="file"
                        multiple
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={(e) => setAttachments(Array.from(e.target.files))}
                      />
                      <IconButton onClick={() => fileInputRef.current.click()}>
                        <AttachFileIcon />
                      </IconButton>
                      {attachments.length > 0 && (
                        <Box component="span">
                          {attachments.length} file(s) selected
                        </Box>
                      )}
                    </Box>
                    <Button
                      variant="contained"
                      endIcon={<SendIcon />}
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() && attachments.length === 0}
                    >
                      Send Response
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CardContent>
                <Typography color="textSecondary">
                  Select a ticket to view and respond
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminSupport; 