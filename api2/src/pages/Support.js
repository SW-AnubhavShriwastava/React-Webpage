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
  List,
  ListItem,
  ListItemText,
  Chip,
  Tabs,
  Tab,
  IconButton,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputLabel
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as OpenIcon,
  CheckCircleOutline as ResolvedIcon,
  Cancel as ClosedIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import axiosInstance from '../axiosInstance';

const Support = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0); // 0 for open, 1 for closed
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = React.useRef();
  const [newTicketDialog, setNewTicketDialog] = useState(false);
  const [newTicketData, setNewTicketData] = useState({
    subject: '',
    category: '',
    priority: 'MEDIUM',
    message: ''
  });

  // Filter tickets based on status
  const openTickets = tickets.filter(ticket => 
    ['OPEN', 'IN_PROGRESS'].includes(ticket.status)
  );
  const closedTickets = tickets.filter(ticket => 
    ['RESOLVED', 'CLOSED'].includes(ticket.status)
  );

  // Fetch tickets on component mount
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await axiosInstance.get('/support/tickets');
        setTickets(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching tickets:', error);
        setError('Failed to fetch support tickets');
      }
    };

    fetchTickets();
  }, []);

  // Add status update function
  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await axiosInstance.patch(`/support/admin/tickets/${ticketId}/status`, {
        status: newStatus
      });
      
      // Refresh tickets after status change
      const response = await axiosInstance.get('/support/tickets');
      setTickets(response.data);
      
      // Update selected ticket if it exists
      if (selectedTicket && selectedTicket.ticketId === ticketId) {
        const updatedTicket = response.data.find(t => t.ticketId === ticketId);
        setSelectedTicket(updatedTicket);
      }

      // Show success message
      setError(null);
    } catch (error) {
      console.error('Error updating ticket status:', error);
      setError('Failed to update ticket status');
    }
  };

  // Handle sending new message
  const handleSendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) return;

    try {
      const formData = new FormData();
      formData.append('message', newMessage);
      attachments.forEach(file => {
        formData.append('attachments', file);
      });

      await axiosInstance.post(
        `/support/tickets/${selectedTicket.ticketId}/messages`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      // Refresh ticket data
      const response = await axiosInstance.get('/support/tickets');
      setTickets(response.data);
      setSelectedTicket(response.data.find(t => t.ticketId === selectedTicket.ticketId));
      setNewMessage('');
      setAttachments([]);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  // Handle file attachment
  const handleFileAttachment = (event) => {
    setAttachments(Array.from(event.target.files));
  };

  // Handle creating a new ticket
  const handleNewTicket = async () => {
    try {
      const formData = new FormData();
      Object.keys(newTicketData).forEach(key => {
        formData.append(key, newTicketData[key]);
      });
      attachments.forEach(file => {
        formData.append('attachments', file);
      });

      await axiosInstance.post('/support/tickets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Reset form and close dialog
      setNewTicketDialog(false);
      setNewTicketData({
        subject: '',
        category: '',
        priority: 'MEDIUM',
        message: ''
      });
      setAttachments([]);

      // Refresh tickets list
      const response = await axiosInstance.get('/support/tickets');
      setTickets(response.data);
    } catch (error) {
      console.error('Error creating ticket:', error);
      setError('Failed to create support ticket');
    }
  };

  return (
    <Box sx={{ p: 3, mt: '64px' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Support Center
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setNewTicketDialog(true)}
          startIcon={<EmailIcon />}
        >
          New Support Ticket
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Grid container spacing={3}>
        {/* Tickets List */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Tabs
                value={tabValue}
                onChange={(e, newValue) => setTabValue(newValue)}
                sx={{ mb: 2 }}
              >
                <Tab 
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <OpenIcon color="primary" />
                      {`Open (${openTickets.length})`}
                    </Box>
                  } 
                />
                <Tab 
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <CheckCircleIcon color="success" />
                      {`Closed (${closedTickets.length})`}
                    </Box>
                  } 
                />
              </Tabs>

              <List>
                {(tabValue === 0 ? openTickets : closedTickets).map((ticket) => (
                  <ListItem
                    key={ticket._id}
                    button
                    selected={selectedTicket?._id === ticket._id}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <ListItemText
                      primary={
                        <Box>
                          <Typography variant="subtitle1">
                            {ticket.subject}
                          </Typography>
                          <Box display="flex" gap={1} mt={1}>
                            <Chip
                              icon={
                                ticket.status === 'OPEN' ? <OpenIcon /> :
                                ticket.status === 'IN_PROGRESS' ? <OpenIcon /> :
                                ticket.status === 'RESOLVED' ? <ResolvedIcon /> :
                                <ClosedIcon />
                              }
                              label={ticket.status}
                              size="small"
                              color={
                                ticket.status === 'OPEN' ? 'primary' :
                                ticket.status === 'IN_PROGRESS' ? 'warning' :
                                ticket.status === 'RESOLVED' ? 'success' :
                                'error'
                              }
                            />
                            <Chip
                              label={ticket.priority}
                              size="small"
                              color={
                                ticket.priority === 'HIGH' ? 'error' :
                                ticket.priority === 'MEDIUM' ? 'warning' : 'success'
                              }
                            />
                          </Box>
                        </Box>
                      }
                      secondary={new Date(ticket.createdAt).toLocaleString()}
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
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">{selectedTicket.subject}</Typography>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <Select
                      value={selectedTicket.status}
                      onChange={(e) => handleStatusChange(selectedTicket.ticketId, e.target.value)}
                    >
                      <MenuItem value="OPEN">Open</MenuItem>
                      <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                      <MenuItem value="RESOLVED">Resolved</MenuItem>
                      <MenuItem value="CLOSED">Closed</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Messages List */}
                <Paper 
                  sx={{ 
                    p: 2, 
                    mb: 2, 
                    maxHeight: '400px',
                    overflowY: 'auto',
                    backgroundColor: '#f5f5f5'  // Light background for chat area
                  }}
                >
                  <List>
                    {selectedTicket.messages.map((message, index) => (
                      <ListItem
                        key={index}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: message.sender === 'USER' ? 'flex-end' : 'flex-start',
                          padding: '8px 0'
                        }}
                      >
                        <Box
                          sx={{
                            maxWidth: '70%',
                            minWidth: '200px',
                            backgroundColor: message.sender === 'USER' ? '#1976d2' : '#fff',
                            color: message.sender === 'USER' ? '#fff' : '#000',
                            borderRadius: message.sender === 'USER' 
                              ? '20px 20px 0 20px'
                              : '20px 20px 20px 0',
                            padding: '12px 16px',
                            boxShadow: 1,
                            position: 'relative'
                          }}
                        >
                          <Typography variant="body1">
                            {message.content}
                          </Typography>
                          
                          {message.attachments?.length > 0 && (
                            <Box mt={1} sx={{ 
                              borderTop: 1, 
                              borderColor: message.sender === 'USER' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                              paddingTop: 1 
                            }}>
                              {message.attachments.map((attachment, i) => (
                                <Chip
                                  key={i}
                                  label={attachment.filename}
                                  size="small"
                                  sx={{ 
                                    mr: 1,
                                    mb: 1,
                                    backgroundColor: message.sender === 'USER' 
                                      ? 'rgba(255,255,255,0.2)' 
                                      : 'rgba(0,0,0,0.05)',
                                    color: message.sender === 'USER' ? '#fff' : 'inherit',
                                    '& .MuiChip-deleteIcon': {
                                      color: message.sender === 'USER' ? '#fff' : 'inherit',
                                    }
                                  }}
                                />
                              ))}
                            </Box>
                          )}
                          
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              display: 'block',
                              mt: 0.5,
                              opacity: 0.8,
                              fontSize: '0.75rem',
                              color: message.sender === 'USER' ? '#fff' : '#666'
                            }}
                          >
                            {message.sender === 'USER' ? 'You' : 'Support'} • {new Date(message.timestamp).toLocaleString()}
                          </Typography>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                </Paper>

                {/* Message Input */}
                <Box sx={{ 
                  display: 'flex',
                  gap: 1,
                  backgroundColor: '#fff',
                  p: 2,
                  borderRadius: 1,
                  boxShadow: 1
                }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#fff'
                      }
                    }}
                  />
                  <Box display="flex" flexDirection="column" gap={1}>
                    <input
                      type="file"
                      multiple
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      onChange={handleFileAttachment}
                    />
                    <IconButton 
                      onClick={() => fileInputRef.current.click()}
                      color="primary"
                      sx={{ 
                        backgroundColor: 'rgba(25, 118, 210, 0.05)',
                        '&:hover': {
                          backgroundColor: 'rgba(25, 118, 210, 0.1)'
                        }
                      }}
                    >
                      <AttachFileIcon />
                    </IconButton>
                    <IconButton 
                      onClick={handleSendMessage}
                      color="primary"
                      disabled={!newMessage.trim() && attachments.length === 0}
                      sx={{ 
                        backgroundColor: 'rgba(25, 118, 210, 0.05)',
                        '&:hover': {
                          backgroundColor: 'rgba(25, 118, 210, 0.1)'
                        }
                      }}
                    >
                      <SendIcon />
                    </IconButton>
                  </Box>
                </Box>

                {/* Attachment Preview */}
                {attachments.length > 0 && (
                  <Box mt={2} p={2} bgcolor="#fff" borderRadius={1} boxShadow={1}>
                    <Typography variant="subtitle2" gutterBottom>
                      Attachments:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {attachments.map((file, index) => (
                        <Chip
                          key={index}
                          label={file.name}
                          onDelete={() => {
                            const newAttachments = [...attachments];
                            newAttachments.splice(index, 1);
                            setAttachments(newAttachments);
                          }}
                          sx={{ m: 0.5 }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CardContent>
                <Typography color="textSecondary">
                  Select a ticket to view the conversation
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* New Ticket Dialog */}
      <Dialog 
        open={newTicketDialog} 
        onClose={() => setNewTicketDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Support Ticket</DialogTitle>
        <DialogContent>
          <Box component="form" noValidate sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Subject"
                  value={newTicketData.subject}
                  onChange={(e) => setNewTicketData(prev => ({
                    ...prev,
                    subject: e.target.value
                  }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={newTicketData.category}
                    label="Category"
                    onChange={(e) => setNewTicketData(prev => ({
                      ...prev,
                      category: e.target.value
                    }))}
                  >
                    <MenuItem value="TECHNICAL">Technical</MenuItem>
                    <MenuItem value="BILLING">Billing</MenuItem>
                    <MenuItem value="API_USAGE">API Usage</MenuItem>
                    <MenuItem value="ACCOUNT">Account</MenuItem>
                    <MenuItem value="OTHER">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={newTicketData.priority}
                    label="Priority"
                    onChange={(e) => setNewTicketData(prev => ({
                      ...prev,
                      priority: e.target.value
                    }))}
                  >
                    <MenuItem value="LOW">Low</MenuItem>
                    <MenuItem value="MEDIUM">Medium</MenuItem>
                    <MenuItem value="HIGH">High</MenuItem>
                    <MenuItem value="URGENT">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  multiline
                  rows={4}
                  label="Message"
                  value={newTicketData.message}
                  onChange={(e) => setNewTicketData(prev => ({
                    ...prev,
                    message: e.target.value
                  }))}
                />
              </Grid>
              <Grid item xs={12}>
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={(e) => setAttachments(Array.from(e.target.files))}
                />
                <Button
                  variant="outlined"
                  startIcon={<AttachFileIcon />}
                  onClick={() => fileInputRef.current.click()}
                >
                  Attach Files
                </Button>
                {attachments.length > 0 && (
                  <Box mt={1}>
                    {attachments.map((file, index) => (
                      <Chip
                        key={index}
                        label={file.name}
                        onDelete={() => {
                          const newAttachments = [...attachments];
                          newAttachments.splice(index, 1);
                          setAttachments(newAttachments);
                        }}
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                )}
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setNewTicketDialog(false);
            setNewTicketData({
              subject: '',
              category: '',
              priority: 'MEDIUM',
              message: ''
            });
            setAttachments([]);
          }}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={handleNewTicket}
            disabled={!newTicketData.subject || !newTicketData.category || !newTicketData.message}
          >
            Create Ticket
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Support; 