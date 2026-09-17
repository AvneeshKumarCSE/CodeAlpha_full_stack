const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDB } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static assets
app.use(express.static(path.join(__dirname, '..', 'public')));

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'CodeAlpha Social Media Platform', time: new Date().toISOString() });
});

// Single Page Application Fallback
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Initialize database and start server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` CodeAlpha Social Media Platform Running`);
    console.log(` URL: http://localhost:${PORT}`);
    console.log(` Demo Account: demo@codealpha.com / password123`);
    console.log(` (Username: @alex_dev)`);
    console.log(`====================================================`);
  });
}).catch(err => {
  console.error('Failed to initialize database and launch server:', err);
});
