import { 
  Client, 
  GatewayIntentBits, 
  Guild, 
  GuildChannel, 
  GuildMember, 
  Role, 
  ChannelType, 
  PermissionFlagsBits,
  TextChannel,
  CategoryChannel,
  GuildBasedChannel
} from 'discord.js';
import { DiscordChannel, DiscordRole, DiscordPermission } from '@/types';
import { logger } from '@/utils/logger';

export class DiscordBotService {
  private client: Client;
  private guild: Guild | null = null;
  private botToken: string;
  private guildId: string;
  private categoryId: string;
  private isReady: boolean = false;

  constructor(config: {
    botToken: string;
    guildId: string;
    categoryId: string;
  }) {
    this.botToken = config.botToken;
    this.guildId = config.guildId;
    this.categoryId = config.categoryId;



    // Create Discord client with necessary intents
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages
      ]
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.on('ready', () => {
      logger.info(`Discord bot logged in as ${this.client.user?.tag}`);
      logger.info('Ready event fired, initializing guild...');
      this.initializeGuild();
    });

    this.client.on('error', (error) => {
      logger.error('Discord bot error:', error);
    });

    this.client.on('disconnect', () => {
      logger.warn('Discord bot disconnected');
      this.isReady = false;
    });
  }

  private async initializeGuild(): Promise<void> {
    try {
      logger.info(`Attempting to fetch guild with ID: ${this.guildId}`);
      logger.info(`Available guilds: ${this.client.guilds.cache.map(g => `${g.name} (${g.id})`).join(', ')}`);
      
      this.guild = await this.client.guilds.fetch(this.guildId);
      this.isReady = true;
      logger.info(`Discord bot connected to guild: ${this.guild.name}`);
    } catch (error) {
      logger.error(`Failed to initialize Discord guild ${this.guildId}:`, error);
      throw new Error(`Failed to connect to Discord guild: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async connect(): Promise<void> {
    if (this.isReady) return;
    
    try {
      logger.info('Attempting to connect to Discord...');
      logger.info(`Bot token length: ${this.botToken.length}`);
      logger.info(`Guild ID: ${this.guildId}`);
      logger.info(`Category ID: ${this.categoryId}`);
      
      // Wait for the ready event before proceeding
      const readyPromise = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Discord bot ready event timeout'));
        }, 30000); // 30 second timeout
        
        this.client!.once('ready', () => {
          clearTimeout(timeout);
          resolve();
        });
        
        this.client!.once('error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });
      
      await this.client!.login(this.botToken);
      logger.info('Successfully logged in to Discord, waiting for ready event...');
      
      await readyPromise;
      logger.info('Discord bot is ready and connected to guild');
    } catch (error) {
      logger.error('Failed to connect Discord bot:', error);
      throw new Error(`Failed to connect Discord bot: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.destroy();
      this.isReady = false;
      this.guild = null;
      logger.info('Discord bot disconnected');
    } catch (error) {
      logger.error('Error disconnecting Discord bot:', error);
    }
  }

  private ensureReady(): void {
    if (!this.isReady) {
      throw new Error('Discord bot is not ready. Call connect() first.');
    }
    
    if (!this.guild) {
      throw new Error('Discord bot is not connected to guild. Call connect() first.');
    }
  }

  async createChannel(name: string, categoryId?: string): Promise<DiscordChannel> {
    try {
      this.ensureReady();
      logger.info(`Creating Discord channel: ${name}`);



      const targetCategoryId = categoryId || this.categoryId;
      const category = await this.guild!.channels.fetch(targetCategoryId) as CategoryChannel;

      if (!category || category.type !== ChannelType.GuildCategory) {
        throw new Error(`Invalid category ID: ${targetCategoryId}`);
      }

      const channel = await this.guild!.channels.create({
        name: name.toLowerCase().replace(/\s+/g, '-'),
        type: ChannelType.GuildText,
        parent: category,
        permissionOverwrites: []
      });

      const discordChannel: DiscordChannel = {
        id: channel.id,
        name: channel.name,
        categoryId: targetCategoryId,
        permissions: []
      };

      logger.info(`Successfully created Discord channel: ${name} with ID: ${channel.id}`);
      return discordChannel;
    } catch (error) {
      logger.error(`Error creating Discord channel ${name}:`, error);
      throw new Error(`Failed to create Discord channel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateChannel(channelId: string, updates: Partial<DiscordChannel>): Promise<DiscordChannel> {
    try {
      this.ensureReady();
      logger.info(`Updating Discord channel: ${channelId}`);



      const channel = await this.guild!.channels.fetch(channelId) as GuildBasedChannel;
      if (!channel) {
        throw new Error(`Channel not found: ${channelId}`);
      }

      const updateData: any = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.categoryId) updateData.parent = updates.categoryId;

      await channel.edit(updateData);

      const updatedChannel: DiscordChannel = {
        id: channel.id,
        name: channel.name,
        categoryId: updates.categoryId || this.categoryId,
        permissions: updates.permissions || []
      };

      logger.info(`Successfully updated Discord channel: ${channelId}`);
      return updatedChannel;
    } catch (error) {
      logger.error(`Error updating Discord channel ${channelId}:`, error);
      throw new Error(`Failed to update Discord channel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteChannel(channelId: string): Promise<void> {
    try {
      this.ensureReady();
      logger.info(`Deleting Discord channel: ${channelId}`);



      const channel = await this.guild!.channels.fetch(channelId);
      if (!channel) {
        throw new Error(`Channel not found: ${channelId}`);
      }

      await channel.delete();
      logger.info(`Successfully deleted Discord channel: ${channelId}`);
    } catch (error) {
      logger.error(`Error deleting Discord channel ${channelId}:`, error);
      throw new Error(`Failed to delete Discord channel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createRole(name: string, permissions: string[] = []): Promise<DiscordRole> {
    try {
      this.ensureReady();
      logger.info(`Creating Discord role: ${name}`);



      // Convert permission strings to Discord permission flags
      const permissionFlags = this.convertPermissionsToFlags(permissions);

      const role = await this.guild!.roles.create({
        name,
        permissions: permissionFlags,
        reason: 'Team provisioning role creation'
      });

      const discordRole: DiscordRole = {
        id: role.id,
        name: role.name,
        permissions: permissions,
        members: []
      };

      logger.info(`Successfully created Discord role: ${name} with ID: ${role.id}`);
      return discordRole;
    } catch (error) {
      logger.error(`Error creating Discord role ${name}:`, error);
      throw new Error(`Failed to create Discord role: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateRole(roleId: string, updates: Partial<DiscordRole>): Promise<DiscordRole> {
    try {
      this.ensureReady();
      logger.info(`Updating Discord role: ${roleId}`);



      const role = await this.guild!.roles.fetch(roleId);
      if (!role) {
        throw new Error(`Role not found: ${roleId}`);
      }

      const updateData: any = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.permissions) {
        updateData.permissions = this.convertPermissionsToFlags(updates.permissions);
      }

      await role.edit(updateData);

      const updatedRole: DiscordRole = {
        id: role.id,
        name: role.name,
        permissions: updates.permissions || [],
        members: updates.members || []
      };

      logger.info(`Successfully updated Discord role: ${roleId}`);
      return updatedRole;
    } catch (error) {
      logger.error(`Error updating Discord role ${roleId}:`, error);
      throw new Error(`Failed to update Discord role: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteRole(roleId: string): Promise<void> {
    try {
      this.ensureReady();
      logger.info(`Deleting Discord role: ${roleId}`);



      const role = await this.guild!.roles.fetch(roleId);
      if (!role) {
        throw new Error(`Role not found: ${roleId}`);
      }

      await role.delete('Team provisioning role deletion');
      logger.info(`Successfully deleted Discord role: ${roleId}`);
    } catch (error) {
      logger.error(`Error deleting Discord role ${roleId}:`, error);
      throw new Error(`Failed to delete Discord role: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async setChannelPermissions(channelId: string, permissions: DiscordPermission[]): Promise<void> {
    try {
      this.ensureReady();
      logger.info(`Setting permissions for Discord channel: ${channelId}`);



      const channel = await this.guild!.channels.fetch(channelId) as GuildBasedChannel;
      if (!channel) {
        throw new Error(`Channel not found: ${channelId}`);
      }

      for (const permission of permissions) {
        const role = await this.guild!.roles.fetch(permission.roleId);
        if (role && 'permissionOverwrites' in channel) {
          const permissionFlags = this.convertPermissionsToFlags(permission.permissions);
          const permissionOverwrites: any = { ViewChannel: true };
          if (permissionFlags & PermissionFlagsBits.SendMessages) permissionOverwrites.SendMessages = true;
          if (permissionFlags & PermissionFlagsBits.ReadMessageHistory) permissionOverwrites.ReadMessageHistory = true;
          if (permissionFlags & PermissionFlagsBits.AttachFiles) permissionOverwrites.AttachFiles = true;
          if (permissionFlags & PermissionFlagsBits.EmbedLinks) permissionOverwrites.EmbedLinks = true;
          if (permissionFlags & PermissionFlagsBits.UseExternalEmojis) permissionOverwrites.UseExternalEmojis = true;
          if (permissionFlags & PermissionFlagsBits.AddReactions) permissionOverwrites.AddReactions = true;
          if (permissionFlags & PermissionFlagsBits.ManageMessages) permissionOverwrites.ManageMessages = true;
          if (permissionFlags & PermissionFlagsBits.ManageChannels) permissionOverwrites.ManageChannels = true;
          if (permissionFlags & PermissionFlagsBits.ManageRoles) permissionOverwrites.ManageRoles = true;
          if (permissionFlags & PermissionFlagsBits.Administrator) permissionOverwrites.Administrator = true;
          
          await (channel as any).permissionOverwrites.create(role, permissionOverwrites);
        }
      }

      logger.info(`Successfully set permissions for Discord channel: ${channelId}`);
    } catch (error) {
      logger.error(`Error setting permissions for Discord channel ${channelId}:`, error);
      throw new Error(`Failed to set Discord channel permissions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async assignRoleToUsers(roleId: string, userIds: string[]): Promise<void> {
    try {
      this.ensureReady();
      logger.info(`Assigning role ${roleId} to ${userIds.length} users`);

      const role = await this.guild!.roles.fetch(roleId);
      if (!role) {
        throw new Error(`Role not found: ${roleId}`);
      }

      for (const userId of userIds) {
        try {
          const member = await this.guild!.members.fetch(userId);
          await member.roles.add(role);
        } catch (memberError) {
          logger.warn(`Failed to assign role to user ${userId}:`, memberError);
        }
      }

      logger.info(`Successfully assigned role ${roleId} to users`);
    } catch (error) {
      logger.error(`Error assigning role ${roleId} to users:`, error);
      throw new Error(`Failed to assign Discord role: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async removeRoleFromUsers(roleId: string, userIds: string[]): Promise<void> {
    try {
      this.ensureReady();
      logger.info(`Removing role ${roleId} from ${userIds.length} users`);

      const role = await this.guild!.roles.fetch(roleId);
      if (!role) {
        throw new Error(`Role not found: ${roleId}`);
      }

      for (const userId of userIds) {
        try {
          const member = await this.guild!.members.fetch(userId);
          await member.roles.remove(role);
        } catch (memberError) {
          logger.warn(`Failed to remove role from user ${userId}:`, memberError);
        }
      }

      logger.info(`Successfully removed role ${roleId} from users`);
    } catch (error) {
      logger.error(`Error removing role ${roleId} from users:`, error);
      throw new Error(`Failed to remove Discord role: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getChannel(channelId: string): Promise<DiscordChannel> {
    try {
      this.ensureReady();
      logger.info(`Getting Discord channel: ${channelId}`);



      const channel = await this.guild!.channels.fetch(channelId) as GuildBasedChannel;
      if (!channel) {
        throw new Error(`Channel not found: ${channelId}`);
      }

      const discordChannel: DiscordChannel = {
        id: channel.id,
        name: channel.name,
        categoryId: channel.parentId || this.categoryId,
        permissions: []
      };

      return discordChannel;
    } catch (error) {
      logger.error(`Error getting Discord channel ${channelId}:`, error);
      throw new Error(`Failed to get Discord channel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getRole(roleId: string): Promise<DiscordRole> {
    try {
      this.ensureReady();
      logger.info(`Getting Discord role: ${roleId}`);



      const role = await this.guild!.roles.fetch(roleId);
      if (!role) {
        throw new Error(`Role not found: ${roleId}`);
      }

      const discordRole: DiscordRole = {
        id: role.id,
        name: role.name,
        permissions: this.convertFlagsToPermissions(BigInt(role.permissions.bitfield)),
        members: []
      };

      return discordRole;
    } catch (error) {
      logger.error(`Error getting Discord role ${roleId}:`, error);
      throw new Error(`Failed to get Discord role: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async channelExists(name: string): Promise<boolean> {
    try {
      this.ensureReady();
      logger.info(`Checking if Discord channel exists: ${name}`);



      const channels = await this.guild!.channels.fetch();
      const channelExists = channels.some(channel => 
        channel.name.toLowerCase() === name.toLowerCase()
      );

      return channelExists;
    } catch (error) {
      logger.error(`Error checking if Discord channel exists ${name}:`, error);
      throw new Error(`Failed to check Discord channel existence: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async roleExists(name: string): Promise<boolean> {
    try {
      this.ensureReady();
      logger.info(`Checking if Discord role exists: ${name}`);



      const roles = await this.guild!.roles.fetch();
      const roleExists = roles.some(role => 
        role.name.toLowerCase() === name.toLowerCase()
      );

      return roleExists;
    } catch (error) {
      logger.error(`Error checking if Discord role exists ${name}:`, error);
      throw new Error(`Failed to check Discord role existence: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createCategory(name: string): Promise<string> {
    try {
      this.ensureReady();
      logger.info(`Creating Discord category: ${name}`);



      const category = await this.guild!.channels.create({
        name: name.toLowerCase().replace(/\s+/g, '-'),
        type: ChannelType.GuildCategory
      });

      logger.info(`Successfully created Discord category: ${name} with ID: ${category.id}`);
      return category.id;
    } catch (error) {
      logger.error(`Error creating Discord category ${name}:`, error);
      throw new Error(`Failed to create Discord category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async moveChannelToCategory(channelId: string, categoryId: string): Promise<void> {
    try {
      this.ensureReady();
      logger.info(`Moving Discord channel ${channelId} to category ${categoryId}`);



      const channel = await this.guild!.channels.fetch(channelId) as GuildBasedChannel;
      const category = await this.guild!.channels.fetch(categoryId) as CategoryChannel;

      if (!channel) {
        throw new Error(`Channel not found: ${channelId}`);
      }

      if (!category || category.type !== ChannelType.GuildCategory) {
        throw new Error(`Invalid category ID: ${categoryId}`);
      }

      if (channel && 'edit' in channel) {
        await (channel as any).edit({ parent: category });
      }
      logger.info(`Successfully moved Discord channel ${channelId} to category ${categoryId}`);
    } catch (error) {
      logger.error(`Error moving Discord channel ${channelId} to category ${categoryId}:`, error);
      throw new Error(`Failed to move Discord channel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private convertPermissionsToFlags(permissions: string[]): bigint {
    let flags = 0n;
    
    for (const permission of permissions) {
      switch (permission.toLowerCase()) {
        case 'view_channel':
          flags |= PermissionFlagsBits.ViewChannel;
          break;
        case 'send_messages':
          flags |= PermissionFlagsBits.SendMessages;
          break;
        case 'read_message_history':
          flags |= PermissionFlagsBits.ReadMessageHistory;
          break;
        case 'attach_files':
          flags |= PermissionFlagsBits.AttachFiles;
          break;
        case 'embed_links':
          flags |= PermissionFlagsBits.EmbedLinks;
          break;
        case 'use_external_emojis':
          flags |= PermissionFlagsBits.UseExternalEmojis;
          break;
        case 'add_reactions':
          flags |= PermissionFlagsBits.AddReactions;
          break;
        case 'manage_messages':
          flags |= PermissionFlagsBits.ManageMessages;
          break;
        case 'manage_channels':
          flags |= PermissionFlagsBits.ManageChannels;
          break;
        case 'manage_roles':
          flags |= PermissionFlagsBits.ManageRoles;
          break;
        case 'administrator':
          flags |= PermissionFlagsBits.Administrator;
          break;
      }
    }
    
    return flags;
  }

  private convertFlagsToPermissions(flags: bigint): string[] {
    const permissions: string[] = [];
    
    if (flags & PermissionFlagsBits.ViewChannel) permissions.push('view_channel');
    if (flags & PermissionFlagsBits.SendMessages) permissions.push('send_messages');
    if (flags & PermissionFlagsBits.ReadMessageHistory) permissions.push('read_message_history');
    if (flags & PermissionFlagsBits.AttachFiles) permissions.push('attach_files');
    if (flags & PermissionFlagsBits.EmbedLinks) permissions.push('embed_links');
    if (flags & PermissionFlagsBits.UseExternalEmojis) permissions.push('use_external_emojis');
    if (flags & PermissionFlagsBits.AddReactions) permissions.push('add_reactions');
    if (flags & PermissionFlagsBits.ManageMessages) permissions.push('manage_messages');
    if (flags & PermissionFlagsBits.ManageChannels) permissions.push('manage_channels');
    if (flags & PermissionFlagsBits.ManageRoles) permissions.push('manage_roles');
    if (flags & PermissionFlagsBits.Administrator) permissions.push('administrator');
    
    return permissions;
  }

  async getHealthStatus(): Promise<{ status: string; message: string; details?: any }> {
    try {
      if (!this.isReady) {
        return {
          status: 'unhealthy',
          message: 'Discord bot is not connected'
        };
      }

      if (!this.guild) {
        return {
          status: 'unhealthy',
          message: 'Discord bot is not connected to guild'
        };
      }

      // Test basic operations
      await this.guild.fetch();
      
      return {
        status: 'healthy',
        message: 'Discord bot is connected and operational',
        details: {
          guildName: this.guild.name,
          guildId: this.guild.id,
          botUser: this.client.user?.tag
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'Discord bot health check failed',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}
