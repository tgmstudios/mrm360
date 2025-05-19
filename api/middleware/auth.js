const jwt = require('jsonwebtoken');
const roles = require('../config/roles.json');
const logger = require('../utils/logger');

// JWT secret from environment variable
const JWT_SECRET = process.env.JWT_SECRET;

// Helper function to check if a permission matches a pattern
function matchesPermission(permission, pattern) {
    if (pattern === '*') return true;
    if (pattern.endsWith('.*')) {
        const prefix = pattern.slice(0, -2);
        return permission.startsWith(prefix);
    }
    return permission === pattern;
}

// Helper function to get user roles from OIDC groups
function getUserRoles(groups) {
    const userRoles = new Set();
    
    // Map groups to roles
    Object.entries(roles.roles).forEach(([role, config]) => {
        if (config.groups.some(group => groups.includes(group))) {
            userRoles.add(role);
        }
    });

    return Array.from(userRoles);
}

// Helper function to check if user has required permission
function hasPermission(userRoles, requiredPermission) {
    // Get all permissions for user's roles
    const userPermissions = new Set();
    
    userRoles.forEach(role => {
        const roleConfig = roles.roles[role];
        if (roleConfig) {
            roleConfig.permissions.forEach(permission => {
                if (permission === '*') {
                    // Add all permissions
                    Object.keys(roles.permissions).forEach(category => {
                        Object.keys(roles.permissions[category]).forEach(action => {
                            userPermissions.add(`${category}.${action}`);
                        });
                    });
                } else {
                    userPermissions.add(permission);
                }
            });
        }
    });

    // Check if user has the required permission
    return Array.from(userPermissions).some(permission => 
        matchesPermission(requiredPermission, permission)
    );
}

// Authentication middleware
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        
        if (!authHeader) {
            logger.warn('Authentication failed: No authorization header');
            return res.status(401).json({ error: 'No authorization header' });
        }

        if (!authHeader.startsWith('Bearer ')) {
            logger.warn('Authentication failed: Invalid authorization format');
            return res.status(401).json({ error: 'Invalid authorization format' });
        }

        const token = authHeader.replace('Bearer ', '');
        
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
            logger.debug('User authenticated:', { userId: decoded.id, role: decoded.role });
            next();
        } catch (error) {
            logger.warn('Authentication failed: Invalid token', { error: error.message });
            return res.status(401).json({ error: 'Invalid token' });
        }
    } catch (error) {
        logger.error('Authentication error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Role-based access control middleware
const requireRole = (roles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                logger.warn('Role check failed: No user in request');
                return res.status(401).json({ error: 'Authentication required' });
            }

            if (!roles.includes(req.user.role)) {
                logger.warn('Role check failed: Insufficient permissions', {
                    userId: req.user.id,
                    userRole: req.user.role,
                    requiredRoles: roles
                });
                return res.status(403).json({ error: 'Insufficient permissions' });
            }

            logger.debug('Role check passed:', {
                userId: req.user.id,
                userRole: req.user.role,
                requiredRoles: roles
            });
            next();
        } catch (error) {
            logger.error('Role check error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
};

// Middleware to attach user roles to request
function attachUserRoles(req, res, next) {
    if (req.user) {
        req.userRoles = getUserRoles(req.user.groups || []);
    }
    next();
}

// Permission-based access control middleware
const requirePermission = (permission) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                logger.warn('Permission check failed: No user in request');
                return res.status(401).json({ error: 'Authentication required' });
            }

            if (!req.userRoles) {
                logger.warn('Permission check failed: No user roles attached');
                return res.status(403).json({ error: 'User roles not available' });
            }

            if (!hasPermission(req.userRoles, permission)) {
                logger.warn('Permission check failed: Insufficient permissions', {
                    userId: req.user.id,
                    userRoles: req.userRoles,
                    requiredPermission: permission
                });
                return res.status(403).json({ error: 'Insufficient permissions' });
            }

            logger.debug('Permission check passed:', {
                userId: req.user.id,
                userRoles: req.userRoles,
                requiredPermission: permission
            });
            next();
        } catch (error) {
            logger.error('Permission check error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
};

module.exports = {
    authenticate,
    requireRole,
    attachUserRoles,
    requirePermission
};
