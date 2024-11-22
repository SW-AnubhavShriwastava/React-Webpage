require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const apiRoutes = require('./routes/apiRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const http = require('http');
const supportRoutes = require('./routes/supportRoutes');
const superAdminRoutes = require('./routes/superAdminRoutes');

const app = express();
const server = http.createServer(app);

// WebSocket server
const wss = new WebSocket.Server({ 
  server,
  path: '/ws',
  perMessageDeflate: false,
  maxPayload: 64 * 1024,
  keepalive: true,
  keepaliveInterval: 30000,
});

// Add heartbeat mechanism
function heartbeat() {
  this.isAlive = true;
}

// WebSocket connection handler
wss.on('connection', function connection(ws, req) {
  try {
    ws.isAlive = true;
    ws.on('pong', heartbeat);

    const url = new URL(req.url, 'ws://localhost:5000');
    const token = url.searchParams.get('token');

    if (!token) {
      ws.close(1008);
      return;
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        ws.close(1008);
        return;
      }

      ws.userId = decoded.id;
      ws.send(JSON.stringify({ type: 'CONNECTION_SUCCESS' }));

      ws.on('message', function incoming(message) {
        try {
          const data = JSON.parse(message);
          if (data.type === 'PING') {
            ws.send(JSON.stringify({ type: 'PONG' }));
          }
        } catch (error) {
          // Silent error handling
        }
      });

      ws.on('error', function error() {
        // Silent error handling
      });

      ws.on('close', function close() {
        // Silent close handling
      });
    });
  } catch (error) {
    ws.close(1011);
  }
});

// Set up the heartbeat interval
const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) {
      console.log('Terminating inactive connection');
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on('close', function close() {
  clearInterval(interval);
});

// Broadcast to specific user
global.sendToUser = function(userId, data) {
  wss.clients.forEach(function each(client) {
    if (client.userId === userId && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

// Connect to MongoDB
connectDB();

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Cache-Control',
    'Pragma',
    'Expires'
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/support', supportRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/v1', apiRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/super-admin', superAdminRoutes);

// Debug endpoint
app.get('/debug/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    }
  });
  res.json(routes);
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, 'localhost', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Available routes:');
  app._router.stack.forEach((r) => {
    if (r.route && r.route.path) {
      console.log(`${Object.keys(r.route.methods)[0].toUpperCase()} ${r.route.path}`);
    }
  });
});