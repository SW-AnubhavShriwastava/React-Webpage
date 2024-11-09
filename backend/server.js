const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const path = require('path');

dotenv.config();
connectDB();

const app = express();
app.use(cors({ origin: 'http://localhost:3000' })); // Allow requests from frontend
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')));
// Use auth routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
