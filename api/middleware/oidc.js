const jwt = require('jsonwebtoken');
const axios = require('axios');
const { Issuer } = require('openid-client');
const logger = require('../utils/logger');

// OIDC configuration from environment variables
const OIDC_ISSUER = process.env.OIDC_ISSUER;
const OIDC_CLIENT_ID = process.env.OIDC_CLIENT_ID;
const OIDC_CLIENT_SECRET = process.env.OIDC_CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;
const OIDC_REDIRECT_URI = process.env.OIDC_REDIRECT_URI;

let client;

const initializeOIDC = async () => {
    try {
        logger.info('Initializing OIDC client');
        const issuer = await Issuer.discover(OIDC_ISSUER);
        logger.debug('Discovered OIDC issuer:', { 
            issuer: issuer.metadata.issuer,
            authorization_endpoint: issuer.metadata.authorization_endpoint,
            token_endpoint: issuer.metadata.token_endpoint
        });

        client = new issuer.Client({
            client_id: OIDC_CLIENT_ID,
            client_secret: OIDC_CLIENT_SECRET,
            redirect_uris: [OIDC_REDIRECT_URI],
            response_types: ['code']
        });

        logger.info('OIDC client initialized successfully');
    } catch (error) {
        logger.error('Failed to initialize OIDC client:', error);
        throw error;
    }
};

const getAuthUrl = () => {
    try {
        const authUrl = client.authorizationUrl({
            scope: 'openid profile email',
            state: Math.random().toString(36).substring(7)
        });
        logger.debug('Generated OIDC authorization URL');
        return authUrl;
    } catch (error) {
        logger.error('Failed to generate OIDC authorization URL:', error);
        throw error;
    }
};

const handleCallback = async (code) => {
    try {
        logger.debug('Processing OIDC callback with authorization code');
        const tokenSet = await client.callback(OIDC_REDIRECT_URI, { code });
        logger.debug('Received token set from OIDC provider');

        const userInfo = await client.userinfo(tokenSet.access_token);
        logger.info('Retrieved user info from OIDC provider:', { 
            sub: userInfo.sub,
            email: userInfo.email
        });

        return {
            tokenSet,
            userInfo
        };
    } catch (error) {
        logger.error('Failed to process OIDC callback:', error);
        throw error;
    }
};

const refreshToken = async (refreshToken) => {
    try {
        logger.debug('Refreshing OIDC token');
        const tokenSet = await client.refresh(refreshToken);
        logger.info('Successfully refreshed OIDC token');
        return tokenSet;
    } catch (error) {
        logger.error('Failed to refresh OIDC token:', error);
        throw error;
    }
};

const revokeToken = async (token) => {
    try {
        logger.debug('Revoking OIDC token');
        await client.revoke(token);
        logger.info('Successfully revoked OIDC token');
    } catch (error) {
        logger.error('Failed to revoke OIDC token:', error);
        throw error;
    }
};

// Helper function to exchange OIDC token for JWT
async function exchangeToken(oidcToken) {
    try {
        // Verify the OIDC token with the provider
        const response = await axios.get(`${OIDC_ISSUER}/userinfo`, {
            headers: {
                'Authorization': `Bearer ${oidcToken}`
            }
        });

        const userInfo = response.data;

        // Create JWT with user info and groups
        const token = jwt.sign({
            sub: userInfo.sub,
            email: userInfo.email,
            name: userInfo.name,
            groups: userInfo.groups || [],
            preferred_username: userInfo.preferred_username
        }, JWT_SECRET, {
            expiresIn: '1h'
        });

        return token;
    } catch (error) {
        console.error('Error exchanging OIDC token:', error);
        throw new Error('Invalid OIDC token');
    }
}

// OIDC authentication middleware
async function oidcAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ error: 'No authorization header' });
    }

    const oidcToken = authHeader.split(' ')[1];
    if (!oidcToken) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        // Exchange OIDC token for JWT
        const token = await exchangeToken(oidcToken);
        
        // Set JWT in response header
        res.setHeader('Authorization', `Bearer ${token}`);
        
        // Decode and attach user info to request
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Authentication failed' });
    }
}

module.exports = {
    initializeOIDC,
    getAuthUrl,
    handleCallback,
    refreshToken,
    revokeToken,
    oidcAuth
}; 