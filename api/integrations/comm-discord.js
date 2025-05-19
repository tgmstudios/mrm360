const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

class DiscordBot {
    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
            ],
            partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember]
        });

        this.verificationLinks = new Map(); // Store verification links temporarily
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        this.client.on('ready', () => {
            logger.info('Discord client ready', {
                username: this.client.user.tag,
                guilds: this.client.guilds.cache.size
            });
        });

        this.client.on('error', (error) => {
            logger.error('Discord client error:', error);
        });

        this.client.on('guildMemberAdd', async (member) => {
            // Generate verification link
            const verificationId = uuidv4();
            const verificationLink = `${process.env.FRONTEND_URL}/verify/${verificationId}`;
            this.verificationLinks.set(verificationId, {
                userId: member.id,
                expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
            });

            // Send verification message
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Welcome to MRM 360!')
                .setDescription('Please verify your account by clicking the link below:')
                .addFields({ name: 'Verification Link', value: verificationLink })
                .setTimestamp();

            try {
                await member.send({ embeds: [embed] });
            } catch (error) {
                console.error('Error sending verification message:', error);
            }
        });
    }

    async login() {
        try {
            await this.client.login(process.env.DISCORD_TOKEN);
            logger.info('Discord client logged in successfully');
        } catch (error) {
            logger.error('Failed to initialize Discord client:', error);
            throw error;
        }
    }

    async createTeam(teamData) {
        try {
            const guild = await this.client.guilds.fetch(process.env.DISCORD_GUILD_ID);
            
            // Create team role
            const role = await guild.roles.create({
                name: `${teamData.category}-${teamData.name}`,
                color: this.getCategoryColor(teamData.category),
                reason: 'Team creation'
            });

            // Create team category
            const category = await guild.channels.create({
                name: `${teamData.category}-${teamData.name}`,
                type: 4, // CategoryChannel
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: ['ViewChannel']
                    },
                    {
                        id: role.id,
                        allow: ['ViewChannel']
                    }
                ]
            });

            // Create team channels
            const channels = await Promise.all([
                guild.channels.create({
                    name: 'general',
                    type: 0, // TextChannel
                    parent: category.id
                }),
                guild.channels.create({
                    name: 'announcements',
                    type: 0,
                    parent: category.id
                }),
                guild.channels.create({
                    name: 'voice',
                    type: 2, // VoiceChannel
                    parent: category.id
                })
            ]);

            // Assign role to members
            for (const member of teamData.members) {
                const discordMember = await guild.members.fetch(member.discord_id);
                await discordMember.roles.add(role);
            }

            return {
                roleId: role.id,
                categoryId: category.id,
                channelIds: channels.map(c => c.id)
            };
        } catch (error) {
            logger.error('Error creating Discord team:', error);
            throw error;
        }
    }

    async updateTeam(teamData) {
        try {
            const guild = await this.client.guilds.fetch(process.env.DISCORD_GUILD_ID);
            const role = await guild.roles.fetch(teamData.roleId);

            // Update role name if category or team name changed
            if (teamData.name || teamData.category) {
                await role.setName(`${teamData.category}-${teamData.name}`);
            }

            // Update members
            if (teamData.members) {
                // Remove role from all members
                const members = await guild.members.fetch();
                for (const [, member] of members) {
                    if (member.roles.cache.has(role.id)) {
                        await member.roles.remove(role);
                    }
                }

                // Add role to new members
                for (const member of teamData.members) {
                    const discordMember = await guild.members.fetch(member.discord_id);
                    await discordMember.roles.add(role);
                }
            }

            return true;
        } catch (error) {
            logger.error('Error updating Discord team:', error);
            throw error;
        }
    }

    async deleteTeam(teamData) {
        try {
            const guild = await this.client.guilds.fetch(process.env.DISCORD_GUILD_ID);
            
            // Delete channels
            const category = await guild.channels.fetch(teamData.categoryId);
            if (category) {
                await Promise.all(category.children.cache.map(channel => channel.delete()));
                await category.delete();
            }

            // Delete role
            const role = await guild.roles.fetch(teamData.roleId);
            if (role) {
                await role.delete();
            }

            return true;
        } catch (error) {
            logger.error('Error deleting Discord team:', error);
            throw error;
        }
    }

    getCategoryColor(category) {
        const colors = {
            'red': '#ff0000',
            'blue': '#0000ff',
            'ctf': '#00ff00',
            'social': '#ff00ff',
            'development': '#00ffff'
        };
        return colors[category.toLowerCase()] || '#ffffff';
    }

    async verifyUser(verificationId) {
        const verification = this.verificationLinks.get(verificationId);
        if (!verification || Date.now() > verification.expiresAt) {
            return null;
        }

        this.verificationLinks.delete(verificationId);
        return verification.userId;
    }
}

const bot = new DiscordBot();
bot.login();

module.exports = bot;
