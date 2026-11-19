const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

router.get('/', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const status = isDbConnected ? 'UP' : 'DEGRADED';
  const statusCode = isDbConnected ? 200 : 503;

  res.status(statusCode).json({
    status,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    service: 'nexus-api',
    version: '1.0.0',
    database: {
      status: isDbConnected ? 'connected' : 'disconnected',
      host: mongoose.connection.host || null,
      name: mongoose.connection.name || null
    },
    memory: {
      rssMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
      heapUsedMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
    }
  });
});

module.exports = router;
