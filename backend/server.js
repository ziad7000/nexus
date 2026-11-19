const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

let server;

const startServer = async () => {
  try {
    await connectDB();
    server = app.listen(PORT, () => {
      console.log(`[Server] Nexus API running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`[Server] Healthcheck: http://localhost:${PORT}/health`);
      console.log(`[Server] API Docs:    http://localhost:${PORT}/api/v1/docs`);
    });
  } catch (error) {
    console.error(`[Server Fatal] Initialization failed: ${error.message}`);
    process.exit(1);
  }
};

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`\n[Server] Received ${signal}. Commencing graceful shutdown...`);
  if (server) {
    server.close(() => {
      console.log('[Server] HTTP server closed cleanly.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }

  // Force shutdown after 10s if connections refuse to terminate
  setTimeout(() => {
    console.error('[Server] Forcing shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Server Error] Unhandled Promise Rejection:', reason);
});

startServer();
