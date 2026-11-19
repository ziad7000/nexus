/**
 * RFC 7807 Problem Details Error Handling Middleware
 * Media Type: application/problem+json
 */
class ProblemError extends Error {
  constructor({ status = 500, title, detail, type, code, invalidParams }) {
    super(detail || title);
    this.status = status;
    this.title = title || 'Internal Server Error';
    this.detail = detail;
    this.type = type || 'about:blank';
    this.code = code || 'INTERNAL_ERROR';
    this.invalidParams = invalidParams;
  }
}

const problemDetailsHandler = (err, req, res, next) => {
  let status = err.status || err.statusCode || 500;
  let title = err.title || 'Internal Server Error';
  let detail = err.detail || err.message || 'An unexpected error occurred';
  let type = err.type || 'about:blank';
  let code = err.code || 'INTERNAL_SERVER_ERROR';
  let invalidParams = err.invalidParams;

  // Handle Mongoose / MongoDB errors
  if (err.name === 'ValidationError') {
    status = 422;
    title = 'Unprocessable Entity';
    detail = 'Database validation failed for submitted data';
    code = 'DB_VALIDATION_ERROR';
    invalidParams = Object.keys(err.errors || {}).map((key) => ({
      name: key,
      reason: err.errors[key].message
    }));
  } else if (err.code === 11000) {
    status = 409;
    title = 'Conflict';
    detail = 'A resource with this key already exists';
    code = 'DUPLICATE_KEY';
  } else if (err.name === 'CastError') {
    status = 400;
    title = 'Bad Request';
    detail = `Invalid identifier format: ${err.value}`;
    code = 'INVALID_ID';
  } else if (err.name === 'JsonWebTokenError') {
    status = 401;
    title = 'Unauthorized';
    detail = 'Authentication token is invalid or malformed';
    code = 'INVALID_TOKEN';
  } else if (err.name === 'TokenExpiredError') {
    status = 401;
    title = 'Unauthorized';
    detail = 'Authentication token has expired';
    code = 'TOKEN_EXPIRED';
  }

  const problemResponse = {
    type,
    title,
    status,
    detail,
    instance: req.originalUrl,
    code,
    timestamp: new Date().toISOString()
  };

  if (invalidParams && invalidParams.length > 0) {
    problemResponse.invalidParams = invalidParams;
  }

  res.setHeader('Content-Type', 'application/problem+json');
  return res.status(status).json(problemResponse);
};

module.exports = {
  ProblemError,
  problemDetailsHandler
};
