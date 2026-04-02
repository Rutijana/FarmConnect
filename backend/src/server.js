require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

const authRoutes    = require('./routes/authRoutes');
const listingRoutes = require('./routes/listingRoutes');
const orderRoutes   = require('./routes/orderRoutes');

const app = express();

// Create uploads folder if it doesn't exist
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// Security & parsing middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded photos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth',     authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/orders',   orderRoutes);

// Health check — visit this in browser to confirm API is running
app.get('/api/health', (req, res) => {
  res.json({
    status: '✅ FarmConnect Rwanda API is running!',
    time: new Date().toISOString()
  });
});

// Unknown route handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.path} not found` });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 FarmConnect API → http://localhost:${PORT}`);
});