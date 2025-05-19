const web = require('./utils/web.js')
const { v4: uuidv4 } = require('uuid')

// Initialize managers
const userManager = require('./managers/user-manager.js')
const teamManager = require('./managers/teams-manager.js')
const eventManager = require('./managers/events-manager.js')
const inventoryManager = require('./managers/inventory-manager.js')
const vpnManager = require('./managers/vpn-manager.js')
const analyticsManager = require('./managers/analytics-manager.js')

// Export managers for use in routes
module.exports = {
    userManager,
    teamManager,
    eventManager,
    inventoryManager,
    vpnManager,
    analyticsManager
}

console.log("MRM 360 Server initiated successfully")