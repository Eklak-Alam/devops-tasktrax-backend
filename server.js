const express = require('express');
const cors = require('cors');
require('dotenv').config();

const taskRoutes = require('./routes/taskRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/tasks', taskRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'DevOps TaskTrax Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

// Fixed 404 handler - remove the * parameter
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path
  });
});

app.listen(PORT, () => {
  console.log(`🚀 DevOps TaskTrax Backend running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
});