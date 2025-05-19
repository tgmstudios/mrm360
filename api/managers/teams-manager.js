const { db, taskQueue } = require('../index.js');
const { v4: uuidv4 } = require('uuid');

class TeamManager {
    async createTeam(teamData) {
        const teamId = uuidv4();
        
        // Insert team into database
        await db.insert('teams', [
            'id', 'name', 'category', 'created_by'
        ], [
            teamId, teamData.name, teamData.category, teamData.created_by
        ]);

        // Add team members
        if (teamData.members && teamData.members.length > 0) {
            for (const member of teamData.members) {
                await db.insert('team_members', [
                    'team_id', 'user_id', 'role'
                ], [
                    teamId, member.user_id, member.role || 'member'
                ]);
            }
        }

        // Create tasks for integrations
        await taskQueue.createTask('CREATE_DISCORD_TEAM', {
            teamId,
            name: teamData.name,
            category: teamData.category,
            members: teamData.members
        });

        await taskQueue.createTask('CREATE_NEXTCLOUD_FOLDER', {
            teamId,
            name: teamData.name,
            category: teamData.category
        });

        await taskQueue.createTask('CREATE_WIKIJS_PAGE', {
            teamId,
            name: teamData.name,
            category: teamData.category
        });

        if (teamData.create_github_repo) {
            await taskQueue.createTask('CREATE_GITHUB_REPO', {
                teamId,
                name: teamData.name,
                category: teamData.category
            });
        }

        return teamId;
    }

    async updateTeam(teamId, updates) {
        const team = await db.search('teams', 'id', teamId);
        if (!team) return false;

        // Update team in database
        if (updates.name || updates.category) {
            const fields = [];
            const values = [];
            
            if (updates.name) {
                fields.push('name');
                values.push(updates.name);
            }
            if (updates.category) {
                fields.push('category');
                values.push(updates.category);
            }

            await db.update('teams', fields, values, 'id', teamId);
        }

        // Update team members if provided
        if (updates.members) {
            // Remove existing members
            await db.executeQuery('DELETE FROM team_members WHERE team_id = ?', [teamId]);
            
            // Add new members
            for (const member of updates.members) {
                await db.insert('team_members', [
                    'team_id', 'user_id', 'role'
                ], [
                    teamId, member.user_id, member.role || 'member'
                ]);
            }
        }

        // Create tasks for integration updates
        if (updates.name || updates.category || updates.members) {
            await taskQueue.createTask('UPDATE_DISCORD_TEAM', {
                teamId,
                name: updates.name || team.name,
                category: updates.category || team.category,
                members: updates.members
            });
        }

        return true;
    }

    async deleteTeam(teamId) {
        const team = await db.search('teams', 'id', teamId);
        if (!team) return false;

        // Create tasks for integration cleanup
        await taskQueue.createTask('DELETE_DISCORD_TEAM', { teamId });
        await taskQueue.createTask('DELETE_NEXTCLOUD_FOLDER', { teamId });
        await taskQueue.createTask('DELETE_WIKIJS_PAGE', { teamId });
        await taskQueue.createTask('DELETE_GITHUB_REPO', { teamId });

        // Delete team members
        await db.executeQuery('DELETE FROM team_members WHERE team_id = ?', [teamId]);
        
        // Delete team
        await db.executeQuery('DELETE FROM teams WHERE id = ?', [teamId]);

        return true;
    }

    async getTeam(teamId) {
        const team = await db.search('teams', 'id', teamId);
        if (!team) return null;

        // Get team members
        const members = await db.executeQuery(
            'SELECT tm.*, u.email, u.username FROM team_members tm ' +
            'JOIN users u ON tm.user_id = u.id ' +
            'WHERE tm.team_id = ?',
            [teamId]
        );

        return {
            ...team,
            members
        };
    }

    async listTeams(filters = {}) {
        let query = 'SELECT * FROM teams';
        const params = [];

        if (filters.category) {
            query += ' WHERE category = ?';
            params.push(filters.category);
        }

        const teams = await db.executeQuery(query, params);

        // Get members for each team
        for (const team of teams) {
            team.members = await db.executeQuery(
                'SELECT tm.*, u.email, u.username FROM team_members tm ' +
                'JOIN users u ON tm.user_id = u.id ' +
                'WHERE tm.team_id = ?',
                [team.id]
            );
        }

        return teams;
    }

    async addTeamMember(teamId, userId, role = 'member') {
        // Check if team exists
        const team = await db.search('teams', 'id', teamId);
        if (!team) return false;

        // Check if user exists
        const user = await db.search('users', 'id', userId);
        if (!user) return false;

        // Add member to team
        await db.insert('team_members', [
            'team_id', 'user_id', 'role'
        ], [
            teamId, userId, role
        ]);

        // Create task to update Discord team
        await taskQueue.createTask('UPDATE_DISCORD_TEAM', {
            teamId,
            name: team.name,
            category: team.category,
            members: [{ user_id: userId, role }]
        });

        return true;
    }

    async removeTeamMember(teamId, userId) {
        // Remove member from team
        await db.executeQuery(
            'DELETE FROM team_members WHERE team_id = ? AND user_id = ?',
            [teamId, userId]
        );

        // Get team info
        const team = await db.search('teams', 'id', teamId);
        if (!team) return false;

        // Create task to update Discord team
        await taskQueue.createTask('UPDATE_DISCORD_TEAM', {
            teamId,
            name: team.name,
            category: team.category,
            members: [] // Will be updated with remaining members
        });

        return true;
    }
}

module.exports = new TeamManager();
