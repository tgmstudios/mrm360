const db = require('./db.js');
const taskQueue = require('../managers/tasks-manager.js');

// Initialize task queue processor
taskQueue.startProcessing();

module.exports = {
    db,
    taskQueue
}; 