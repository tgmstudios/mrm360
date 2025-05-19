const { db, taskQueue } = require('../index.js');
const { v4: uuidv4 } = require('uuid');

class EventManager {
    async createEvent(eventData) {
        const eventId = uuidv4();
        
        // Insert event into database
        await db.insert('events', [
            'id', 'name', 'description', 'location', 'calendar',
            'type', 'start_time', 'estimated_attendance',
            'team_id', 'created_by'
        ], [
            eventId, eventData.name, eventData.description,
            eventData.location, eventData.calendar, eventData.type,
            eventData.start_time, eventData.estimated_attendance,
            eventData.team_id, eventData.created_by
        ]);

        // Create tasks for integrations
        if (eventData.type === 'practice' || eventData.type === 'workshop') {
            await taskQueue.createTask('CREATE_OPENSTACK_PROJECT', {
                eventId,
                name: eventData.name,
                type: eventData.type
            });

            await taskQueue.createTask('CREATE_COMPSOLE_COMPETITION', {
                eventId,
                name: eventData.name,
                type: eventData.type,
                estimated_attendance: eventData.estimated_attendance
            });
        }

        return eventId;
    }

    async updateEvent(eventId, updates) {
        const event = await db.search('events', 'id', eventId);
        if (!event) return false;

        // Update event in database
        const fields = [];
        const values = [];
        
        Object.entries(updates).forEach(([key, value]) => {
            if (['name', 'description', 'location', 'calendar', 'type', 
                 'start_time', 'estimated_attendance', 'team_id'].includes(key)) {
                fields.push(key);
                values.push(value);
            }
        });

        if (fields.length > 0) {
            await db.update('events', fields, values, 'id', eventId);
        }

        // Create tasks for integration updates if needed
        if (updates.type && (updates.type === 'practice' || updates.type === 'workshop')) {
            await taskQueue.createTask('CREATE_OPENSTACK_PROJECT', {
                eventId,
                name: updates.name || event.name,
                type: updates.type
            });

            await taskQueue.createTask('CREATE_COMPSOLE_COMPETITION', {
                eventId,
                name: updates.name || event.name,
                type: updates.type,
                estimated_attendance: updates.estimated_attendance || event.estimated_attendance
            });
        }

        return true;
    }

    async deleteEvent(eventId) {
        const event = await db.search('events', 'id', eventId);
        if (!event) return false;

        // Create tasks for integration cleanup
        if (event.type === 'practice' || event.type === 'workshop') {
            await taskQueue.createTask('DELETE_OPENSTACK_PROJECT', { eventId });
            await taskQueue.createTask('DELETE_COMPSOLE_COMPETITION', { eventId });
        }

        // Delete event attendance records
        await db.executeQuery('DELETE FROM event_attendance WHERE event_id = ?', [eventId]);
        
        // Delete event
        await db.executeQuery('DELETE FROM events WHERE id = ?', [eventId]);

        return true;
    }

    async getEvent(eventId) {
        const event = await db.search('events', 'id', eventId);
        if (!event) return null;

        // Get attendance data
        const attendance = await db.executeQuery(
            'SELECT ea.*, u.email, u.username FROM event_attendance ea ' +
            'JOIN users u ON ea.user_id = u.id ' +
            'WHERE ea.event_id = ?',
            [eventId]
        );

        return {
            ...event,
            attendance
        };
    }

    async listEvents(filters = {}) {
        let query = 'SELECT * FROM events';
        const params = [];
        const conditions = [];

        if (filters.calendar) {
            conditions.push('calendar = ?');
            params.push(filters.calendar);
        }

        if (filters.type) {
            conditions.push('type = ?');
            params.push(filters.type);
        }

        if (filters.team_id) {
            conditions.push('team_id = ?');
            params.push(filters.team_id);
        }

        if (filters.start_time) {
            conditions.push('start_time >= ?');
            params.push(filters.start_time);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY start_time ASC';

        const events = await db.executeQuery(query, params);

        // Get attendance data for each event
        for (const event of events) {
            event.attendance = await db.executeQuery(
                'SELECT ea.*, u.email, u.username FROM event_attendance ea ' +
                'JOIN users u ON ea.user_id = u.id ' +
                'WHERE ea.event_id = ?',
                [event.id]
            );
        }

        return events;
    }

    async recordAttendance(eventId, userId, status = 'attended', scannedBy = null) {
        // Check if event exists
        const event = await db.search('events', 'id', eventId);
        if (!event) return false;

        // Check if user exists
        const user = await db.search('users', 'id', userId);
        if (!user) return false;

        // Record attendance
        await db.insert('event_attendance', [
            'event_id', 'user_id', 'status', 'scanned_by', 'scanned_at'
        ], [
            eventId, userId, status, scannedBy, new Date()
        ]);

        return true;
    }

    async getAttendance(eventId) {
        return await db.executeQuery(
            'SELECT ea.*, u.email, u.username FROM event_attendance ea ' +
            'JOIN users u ON ea.user_id = u.id ' +
            'WHERE ea.event_id = ?',
            [eventId]
        );
    }
}

module.exports = new EventManager();
