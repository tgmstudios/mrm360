const express = require('express');
const router = express.Router();

// Import route modules
const userRoutes = require('./users');
const teamRoutes = require('./teams');
const eventRoutes = require('./events');
const inventoryRoutes = require('./inventory');
const vpnRoutes = require('./vpn');
const analyticsRoutes = require('./analytics');
const taskRoutes = require('./tasks');

// Mount routes
router.use('/users', userRoutes);
router.use('/teams', teamRoutes);
router.use('/events', eventRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/vpn', vpnRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/tasks', taskRoutes);

module.exports = router;
