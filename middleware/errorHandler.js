const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.stack);
  
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message
  });
};

module.exports = errorHandler;