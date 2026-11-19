const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const { problemDetailsHandler } = require('./middleware/problemDetails');

// Route Imports
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const profileRoutes = require('./routes/profileRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');

const app = express();

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false // Allows Swagger UI to load inline assets
  })
);

// Cross-Origin Resource Sharing
const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL, 'http://localhost:3000', 'http://localhost:5173']
  : '*';

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true
  })
);

// Body Parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Rate Limiting on Authentication Endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    type: 'https://api.nexus-platform.com/errors/rate-limit-exceeded',
    title: 'Too Many Requests',
    status: 429,
    detail: 'Too many authentication attempts. Please try again after 15 minutes.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// Swagger / OpenAPI documentation (if openapi.yaml exists)
const openapiPath = path.join(__dirname, 'docs', 'openapi.yaml');
if (fs.existsSync(openapiPath)) {
  try {
    const swaggerUi = require('swagger-ui-express');
    const YAML = require('yamljs');
    const swaggerDocument = YAML.load(openapiPath);
    app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  } catch (err) {
    console.warn('[Swagger] Documentation could not be initialized:', err.message);
  }
}

// Health Check
app.use('/health', healthRoutes);

// API v1 Routes
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/admin', userRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/applications', applicationRoutes);

// Root informational endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Nexus API',
    status: 'online',
    version: '1.0.0',
    documentation: '/api/v1/docs',
    health: '/health'
  });
});

// 404 Catch-All Handler
app.use((req, res, next) => {
  res.status(404).json({
    type: 'https://api.nexus-platform.com/errors/not-found',
    title: 'Not Found',
    status: 404,
    detail: `Route ${req.method} ${req.originalUrl} does not exist.`,
    instance: req.originalUrl,
    code: 'RESOURCE_NOT_FOUND',
    timestamp: new Date().toISOString()
  });
});

// Centralized RFC 7807 Problem Details Error Handler
app.use(problemDetailsHandler);

module.exports = app;
