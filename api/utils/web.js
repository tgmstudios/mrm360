const express = require('express')
const cors = require('cors');
const routes = require('../routes');

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerSpec = require('../swaggerConfig');

const { authenticate, attachUserRoles } = require('../middleware/auth');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.set('trust proxy', true)

// Authentication middleware
app.use(authenticate);
app.use(attachUserRoles);

const ROOT_DOMAIN = '/api/v1';

// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    const originalSend = res.send;
    
    // Override the send method to log the response
    res.send = function(body) {
        const duration = Date.now() - start;
        const logMessage = {
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.originalUrl || req.url,
            ip: req.ip,
            statusCode: res.statusCode,
            responseTime: `${duration}ms`,
            headers: req.headers,
            body: req.method !== 'GET' ? req.body : undefined
        };
        
        console.log(JSON.stringify(logMessage));
        return originalSend.call(this, body);
    };
    
    next();
});

app.use(ROOT_DOMAIN, (req, res, next) => {
    next();
});

/* API Documentation */
app.use(`${ROOT_DOMAIN}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get(`${ROOT_DOMAIN}/docs.json`, (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Use the routes from the `routes` folder with a base path `/fota/ibs`
app.use(`${ROOT_DOMAIN}`, routes);

// 404 handler (should be after all other routes/middleware)
app.use((req, res, next) => {
    res.status(404).send('Not Found');
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

app.listen(80, () => {
    console.log(`Accepting requests on port 80 with root domain ${ROOT_DOMAIN}`);
});
