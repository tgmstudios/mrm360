const axios = require('axios');

class GitHubIntegration {
    constructor() {
        this.baseUrl = 'https://api.github.com';
        this.token = process.env.GITHUB_TOKEN;
        this.orgName = process.env.GITHUB_ORG;
    }

    getHeaders() {
        return {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json'
        };
    }

    async createTeam(teamData) {
        try {
            // Create team
            const teamResponse = await axios.post(
                `${this.baseUrl}/orgs/${this.orgName}/teams`,
                {
                    name: teamData.name,
                    description: teamData.description,
                    privacy: 'closed'
                },
                { headers: this.getHeaders() }
            );

            // Create team repository
            const repoResponse = await axios.post(
                `${this.baseUrl}/orgs/${this.orgName}/repos`,
                {
                    name: teamData.name.toLowerCase().replace(/\s+/g, '-'),
                    description: teamData.description,
                    private: true,
                    has_issues: true,
                    has_wiki: true,
                    has_projects: true
                },
                { headers: this.getHeaders() }
            );

            // Add repository to team
            await axios.put(
                `${this.baseUrl}/teams/${teamResponse.data.id}/repos/${this.orgName}/${repoResponse.data.name}`,
                { permission: 'push' },
                { headers: this.getHeaders() }
            );

            // Add members to team
            for (const member of teamData.members) {
                await axios.put(
                    `${this.baseUrl}/teams/${teamResponse.data.id}/memberships/${member.github_username}`,
                    { role: member.role === 'admin' ? 'maintainer' : 'member' },
                    { headers: this.getHeaders() }
                );
            }

            return {
                teamId: teamResponse.data.id,
                repoName: repoResponse.data.name
            };
        } catch (error) {
            console.error('Error creating GitHub team:', error);
            throw error;
        }
    }

    async updateTeam(teamData) {
        try {
            // Update team details
            await axios.patch(
                `${this.baseUrl}/teams/${teamData.teamId}`,
                {
                    name: teamData.name,
                    description: teamData.description
                },
                { headers: this.getHeaders() }
            );

            // Update team members
            const currentMembers = await this.getTeamMembers(teamData.teamId);
            const newMembers = teamData.members.map(m => m.github_username);

            // Remove members not in new list
            for (const member of currentMembers) {
                if (!newMembers.includes(member.login)) {
                    await axios.delete(
                        `${this.baseUrl}/teams/${teamData.teamId}/memberships/${member.login}`,
                        { headers: this.getHeaders() }
                    );
                }
            }

            // Add new members
            for (const member of teamData.members) {
                if (!currentMembers.find(m => m.login === member.github_username)) {
                    await axios.put(
                        `${this.baseUrl}/teams/${teamData.teamId}/memberships/${member.github_username}`,
                        { role: member.role === 'admin' ? 'maintainer' : 'member' },
                        { headers: this.getHeaders() }
                    );
                }
            }

            return true;
        } catch (error) {
            console.error('Error updating GitHub team:', error);
            throw error;
        }
    }

    async deleteTeam(teamData) {
        try {
            // Delete team repository
            await axios.delete(
                `${this.baseUrl}/repos/${this.orgName}/${teamData.repoName}`,
                { headers: this.getHeaders() }
            );

            // Delete team
            await axios.delete(
                `${this.baseUrl}/teams/${teamData.teamId}`,
                { headers: this.getHeaders() }
            );

            return true;
        } catch (error) {
            console.error('Error deleting GitHub team:', error);
            throw error;
        }
    }

    async getTeamMembers(teamId) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/teams/${teamId}/members`,
                { headers: this.getHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Error getting GitHub team members:', error);
            throw error;
        }
    }

    async createIssue(teamData, issueData) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/repos/${this.orgName}/${teamData.repoName}/issues`,
                {
                    title: issueData.title,
                    body: issueData.description,
                    labels: issueData.labels || [],
                    assignees: issueData.assignees || []
                },
                { headers: this.getHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Error creating GitHub issue:', error);
            throw error;
        }
    }

    async getTeamRepositories(teamId) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/teams/${teamId}/repos`,
                { headers: this.getHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Error getting GitHub team repositories:', error);
            throw error;
        }
    }
}

module.exports = new GitHubIntegration();
