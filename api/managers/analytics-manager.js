const { db } = require('../index.js');

class AnalyticsManager {
    async getMemberStats() {
        const stats = {
            total_members: 0,
            active_members: 0,
            newsletter_subscribers: 0,
            vpn_users: 0
        };

        // Get total members
        const totalMembers = await db.executeQuery(
            'SELECT COUNT(*) as count FROM users WHERE deleted = false'
        );
        stats.total_members = totalMembers[0].count;

        // Get active members
        const activeMembers = await db.executeQuery(
            'SELECT COUNT(*) as count FROM users WHERE deleted = false AND enabled = true'
        );
        stats.active_members = activeMembers[0].count;

        // Get newsletter subscribers
        const newsletterSubscribers = await db.executeQuery(
            'SELECT COUNT(*) as count FROM users WHERE deleted = false AND newsletter_subscribed = true'
        );
        stats.newsletter_subscribers = newsletterSubscribers[0].count;

        // Get VPN users
        const vpnUsers = await db.executeQuery(
            'SELECT COUNT(DISTINCT user_id) as count FROM vpn_requests WHERE status = ?',
            ['approved']
        );
        stats.vpn_users = vpnUsers[0].count;

        return stats;
    }

    async getTeamStats() {
        const stats = {
            total_teams: 0,
            teams_by_category: {},
            members_by_team: []
        };

        // Get total teams
        const totalTeams = await db.executeQuery('SELECT COUNT(*) as count FROM teams');
        stats.total_teams = totalTeams[0].count;

        // Get teams by category
        const teamsByCategory = await db.executeQuery(
            'SELECT category, COUNT(*) as count FROM teams GROUP BY category'
        );
        teamsByCategory.forEach(row => {
            stats.teams_by_category[row.category] = row.count;
        });

        // Get member count by team
        const membersByTeam = await db.executeQuery(
            'SELECT t.id, t.name, t.category, COUNT(tm.user_id) as member_count ' +
            'FROM teams t ' +
            'LEFT JOIN team_members tm ON t.id = tm.team_id ' +
            'GROUP BY t.id, t.name, t.category ' +
            'ORDER BY member_count DESC'
        );
        stats.members_by_team = membersByTeam;

        return stats;
    }

    async getEventStats() {
        const stats = {
            total_events: 0,
            events_by_type: {},
            events_by_calendar: {},
            upcoming_events: 0,
            total_attendance: 0
        };

        // Get total events
        const totalEvents = await db.executeQuery('SELECT COUNT(*) as count FROM events');
        stats.total_events = totalEvents[0].count;

        // Get events by type
        const eventsByType = await db.executeQuery(
            'SELECT type, COUNT(*) as count FROM events GROUP BY type'
        );
        eventsByType.forEach(row => {
            stats.events_by_type[row.type] = row.count;
        });

        // Get events by calendar
        const eventsByCalendar = await db.executeQuery(
            'SELECT calendar, COUNT(*) as count FROM events GROUP BY calendar'
        );
        eventsByCalendar.forEach(row => {
            stats.events_by_calendar[row.calendar] = row.count;
        });

        // Get upcoming events
        const upcomingEvents = await db.executeQuery(
            'SELECT COUNT(*) as count FROM events WHERE start_time > NOW()'
        );
        stats.upcoming_events = upcomingEvents[0].count;

        // Get total attendance
        const totalAttendance = await db.executeQuery(
            'SELECT COUNT(*) as count FROM event_attendance WHERE status = ?',
            ['attended']
        );
        stats.total_attendance = totalAttendance[0].count;

        return stats;
    }

    async getInventoryStats() {
        const stats = {
            total_items: 0,
            items_in_stock: 0,
            items_checked_out: 0,
            active_checkouts: []
        };

        // Get total items
        const totalItems = await db.executeQuery('SELECT COUNT(*) as count FROM inventory');
        stats.total_items = totalItems[0].count;

        // Get items in stock
        const itemsInStock = await db.executeQuery(
            'SELECT COUNT(*) as count FROM inventory WHERE in_stock = true'
        );
        stats.items_in_stock = itemsInStock[0].count;

        // Get items checked out
        const itemsCheckedOut = await db.executeQuery(
            'SELECT COUNT(*) as count FROM inventory WHERE in_stock = false'
        );
        stats.items_checked_out = itemsCheckedOut[0].count;

        // Get active checkouts
        const activeCheckouts = await db.executeQuery(
            'SELECT il.*, i.name as item_name, u.email, u.username ' +
            'FROM inventory_log il ' +
            'JOIN inventory i ON il.item_id = i.id ' +
            'JOIN users u ON il.user_id = u.id ' +
            'WHERE il.checked_in_at IS NULL ' +
            'ORDER BY il.checked_out_at DESC'
        );
        stats.active_checkouts = activeCheckouts;

        return stats;
    }

    async getDashboardStats() {
        const [memberStats, teamStats, eventStats, inventoryStats] = await Promise.all([
            this.getMemberStats(),
            this.getTeamStats(),
            this.getEventStats(),
            this.getInventoryStats()
        ]);

        return {
            members: memberStats,
            teams: teamStats,
            events: eventStats,
            inventory: inventoryStats
        };
    }
}

module.exports = new AnalyticsManager();
