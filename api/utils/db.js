const mysql = require('mysql2');
const { initializeTables } = require('./db-init.js');

const mysql_host = process.env.MYSQL_HOST;
const mysql_port = process.env.MYSQL_PORT;
const mysql_user = process.env.MYSQL_USER;
const mysql_pass = process.env.MYSQL_PASS;
const mysql_db = process.env.MYSQL_DB;

const credentials = {
    host: mysql_host,
    port: mysql_port,
    user: mysql_user,
    password: mysql_pass,
    database: mysql_db,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
};

// Create the connection pool
const pool = mysql.createPool(credentials);

// Handle pool errors
pool.on('error', (err) => {
    console.error('Unexpected error on idle connection', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.warn('Database connection was closed. Pool will handle reconnection.');
    } else if (err.code === 'ER_CON_COUNT_ERROR') {
        console.error('Database has too many connections.');
    } else if (err.code === 'ECONNREFUSED') {
        console.error('Database connection was refused.');
    } else if (err.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR') {
        console.error('Fatal error occurred. Pool will handle reconnection.');
    }
});

// Initialize tables when the pool is ready
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error getting initial connection:', err);
        return;
    }
    
    console.log('Connected to database.');
    initializeTables(connection)
        .then(() => {
            console.log('Database tables initialized successfully');
        })
        .catch((error) => {
            console.error('Failed to initialize tables:', error);
        })
        .finally(() => {
            connection.release();
        });
});

// Helper function for executing queries
const executeQuery = async (query, params) => {
    return new Promise((resolve, reject) => {
        pool.query(query, params, (error, results) => {
            if (error) {
                console.error("Query Error:", error);
                return reject(error);
            }
            resolve(results);
        });
    });
};

// Insert function
const insert = async (table, fields, values) => {
    const placeholders = fields.map(() => '?').join(', ');
    const query = `INSERT INTO \`${table}\` (${fields.join(', ')}) VALUES (${placeholders})`;
    
    try {
        await executeQuery(query, values);
        return { result: "success" };
    } catch (error) {
        return { result: "error", type: error.message };
    }
};

// Search function
const search = async (table, field, value) => {
    const query = `SELECT * FROM \`${table}\` WHERE \`${field}\` = ?`;
    
    try {
        const results = await executeQuery(query, [value]);
        return results[0] || null;
    } catch (error) {
        return { result: "error", type: error.message };
    }
};

// Update function
const update = async (table, fieldToUpdate, newValue, searchField, searchValue) => {
    const query = `UPDATE \`${table}\` SET \`${fieldToUpdate}\` = ? WHERE \`${searchField}\` = ?`;
    
    try {
        await executeQuery(query, [newValue, searchValue]);
        return { result: "success" };
    } catch (error) {
        return { result: "error", type: error.message };
    }
};

// Search Exists function
const searchExists = async (table, field, value) => {
    const query = `SELECT 1 FROM \`${table}\` WHERE \`${field}\` = ? LIMIT 1`;

    try {
        const results = await executeQuery(query, [value]);
        return results.length > 0;
    } catch (error) {
        console.error("Error checking existence:", error);
        return false;
    }
};

module.exports = {
    insert,
    search,
    update,
    searchExists,
    executeQuery
};
