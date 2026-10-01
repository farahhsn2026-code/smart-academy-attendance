const errorHandler = (err, req, res, next) => {
  let statusCode = err.status || err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found with specified ID';
  }

  // Duplicate key (e.g. unique email or duplicate attendance)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `Duplicate entry for ${field}` : 'Duplicate record already exists';
  }

  // Mongoose Validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }

  res.status(statusCode).json({
    success: false,
    message
  });
};

module.exports = errorHandler;
