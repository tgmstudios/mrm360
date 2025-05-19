async function initializeTables(connection) {
    try {
        // Users table (created via OAuth)
        await connection.promise().query(`
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(36) PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                username VARCHAR(255),
                discord_id VARCHAR(255) UNIQUE,
                github_id VARCHAR(255),
                ssh_key TEXT,
                newsletter_subscribed BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                enabled BOOLEAN DEFAULT true,
                deleted BOOLEAN DEFAULT false,
                INDEX idx_email (email),
                INDEX idx_discord_id (discord_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `);

        // Groups table (e.g., admin, tech-team, red-ctf)
        await connection.promise().query(`
            CREATE TABLE IF NOT EXISTS groups (
                id VARCHAR(36) PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `);

        // Many-to-many: user_groups
        await connection.promise().query(`
            CREATE TABLE IF NOT EXISTS user_groups (
                user_id VARCHAR(36),
                group_id VARCHAR(36),
                PRIMARY KEY (user_id, group_id),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `);

        // Teams table
        await connection.promise().query(`
            CREATE TABLE IF NOT EXISTS teams (
                id VARCHAR(36) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                category ENUM('red', 'blue', 'ctf', 'social', 'development') NOT NULL,
                created_by VARCHAR(36) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (created_by) REFERENCES users(id),
                UNIQUE KEY unique_team (category, name)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `);

        // Team membership
        await connection.promise().query(`
            CREATE TABLE IF NOT EXISTS team_members (
                team_id VARCHAR(36),
                user_id VARCHAR(36),
                role ENUM('member', 'lead') DEFAULT 'member',
                PRIMARY KEY (team_id, user_id),
                FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `);

        // Events table
        await connection.promise().query(`
            CREATE TABLE IF NOT EXISTS events (
                id VARCHAR(36) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                location VARCHAR(255),
                calendar ENUM('general', 'red', 'blue', 'ctf', 'social') NOT NULL,
                type ENUM('gbm', 'workshop', 'social', 'practice') NOT NULL,
                start_time TIMESTAMP NOT NULL,
                estimated_attendance INT,
                team_id VARCHAR(36),
                created_by VARCHAR(36),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (team_id) REFERENCES teams(id),
                FOREIGN KEY (created_by) REFERENCES users(id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `);

        // Event attendance
        await connection.promise().query(`
            CREATE TABLE IF NOT EXISTS event_attendance (
                event_id VARCHAR(36),
                user_id VARCHAR(36),
                status ENUM('rsvp', 'attended') DEFAULT 'rsvp',
                scanned_by VARCHAR(36),
                scanned_at TIMESTAMP,
                PRIMARY KEY (event_id, user_id),
                FOREIGN KEY (event_id) REFERENCES events(id),
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (scanned_by) REFERENCES users(id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `);

        // Inventory
        await connection.promise().query(`
            CREATE TABLE IF NOT EXISTS inventory (
                id VARCHAR(36) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                in_stock BOOLEAN DEFAULT true,
                created_by VARCHAR(36),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (created_by) REFERENCES users(id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `);

        // Inventory logs
        await connection.promise().query(`
            CREATE TABLE IF NOT EXISTS inventory_log (
                id VARCHAR(36) PRIMARY KEY,
                item_id VARCHAR(36),
                user_id VARCHAR(36),
                checked_out_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                checked_in_at TIMESTAMP NULL,
                FOREIGN KEY (item_id) REFERENCES inventory(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `);

        // VPN Requests
        await connection.promise().query(`
            CREATE TABLE IF NOT EXISTS vpn_requests (
                id VARCHAR(36) PRIMARY KEY,
                user_id VARCHAR(36),
                status ENUM('pending', 'approved', 'denied') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `);

        // Task queue
        await connection.promise().query(`
            CREATE TABLE IF NOT EXISTS tasks (
                id VARCHAR(36) PRIMARY KEY,
                type VARCHAR(255) NOT NULL,
                context JSON NOT NULL,
                status ENUM('pending', 'in_progress', 'completed', 'error') DEFAULT 'pending',
                attempts INT DEFAULT 0,
                error_message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_status (status),
                INDEX idx_type (type)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `);

        console.log('MRM 360 tables initialized successfully');
    } catch (error) {
        console.error('Error initializing MRM 360 tables:', error);
        throw error;
    }
}

module.exports = {
    initializeTables
};
