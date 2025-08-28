import { DiscordChannel, DiscordRole, DiscordPermission } from '@/types';
import { DiscordBotService } from './discordBotService';
import { logger } from '@/utils/logger';

export class DiscordService {
  private discordBotService: DiscordBotService;

  constructor(config: {
    botToken: string;
    guildId: string;
    categoryId: string;
  }) {
    this.discordBotService = new DiscordBotService(config);
  }

  async createChannel(name: string, categoryId?: string): Promise<DiscordChannel> {
    try {
      logger.info(`Creating Discord channel: ${name}`);
      
      // Connect to Discord if not already connected
      await this.discordBotService.connect();
      
      const channel = await this.discordBotService.createChannel(name, categoryId);
      
      logger.info(`Successfully created Discord channel: ${name}`);
      return channel;
    } catch (error) {
      logger.error(`Error creating Discord channel ${name}:`, error);
      throw new Error(`Failed to create Discord channel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateChannel(channelId: string, updates: Partial<DiscordChannel>): Promise<DiscordChannel> {
    try {
      logger.info(`Updating Discord channel: ${channelId}`);
      
      // Connect to Discord if not already connected
      await this.discordBotService.connect();
      
      const channel = await this.discordBotService.updateChannel(channelId, updates);
      
      logger.info(`Successfully updated Discord channel: ${channelId}`);
      return channel;
    } catch (error) {
      logger.error(`Error updating Discord channel ${channelId}:`, error);
      throw new Error(`Failed to update Discord channel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteChannel(channelId: string): Promise<void> {
    try {
      logger.info(`Deleting Discord channel: ${channelId}`);
      
      // Connect to Discord if not already connected
      await this.discordBotService.connect();
      
      await this.discordBotService.deleteChannel(channelId);
      
      logger.info(`Successfully deleted Discord channel: ${channelId}`);
    } catch (error) {
      logger.error(`Error deleting Discord channel ${channelId}:`, error);
      throw new Error(`Failed to delete Discord channel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createRole(name: string, permissions: string[] = []): Promise<DiscordRole> {
    try {
      logger.info(`Creating Discord role: ${name}`);
      
      // Connect to Discord if not already connected
      await this.discordBotService.connect();
      
      const role = await this.discordBotService.createRole(name, permissions);
      
      logger.info(`Successfully created Discord role: ${name}`);
      return role;
    } catch (error) {
      logger.error(`Error creating Discord role ${name}:`, error);
      throw new Error(`Failed to create Discord role: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateRole(roleId: string, updates: Partial<DiscordRole>): Promise<DiscordRole> {
    try {
      logger.info(`Updating Discord role: ${roleId}`);
      
      // Connect to Discord if not already connected
      await this.discordBotService.connect();
      
      const role = await this.discordBotService.updateRole(roleId, updates);
      
      logger.info(`Successfully updated Discord role: ${roleId}`);
      return role;
    } catch (error) {
      logger.error(`Error updating Discord role ${roleId}:`, error);
      throw new Error(`Failed to update Discord role: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteRole(roleId: string): Promise<void> {
    try {
      logger.info(`Deleting Discord role: ${roleId}`);
      
      // Connect to Discord if not already connected
      await this.discordBotService.connect();
      
      await this.discordBotService.deleteRole(roleId);
      
      logger.info(`Successfully deleted Discord role: ${roleId}`);
    } catch (error) {
      logger.error(`Error deleting Discord role ${roleId}:`, error);
      throw new Error(`Failed to delete Discord role: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async setChannelPermissions(channelId: string, permissions: DiscordPermission[]): Promise<void> {
    try {
      logger.info(`Setting permissions for Discord channel: ${channelId}`);
      
      // Connect to Discord if not already connected
      await this.discordBotService.connect();
      
      await this.discordBotService.setChannelPermissions(channelId, permissions);
      
      logger.info(`Successfully set permissions for Discord channel: ${channelId}`);
    } catch (error) {
      logger.error(`Error setting permissions for Discord channel ${channelId}:`, error);
      throw new Error(`Failed to set Discord channel permissions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async assignRoleToUsers(roleId: string, userIds: string[]): Promise<void> {
    try {
      logger.info(`Assigning role ${roleId} to ${userIds.length} users`);
      
      // Connect to Discord if not already connected
      await this.discordBotService.connect();
      
      await this.discordBotService.assignRoleToUsers(roleId, userIds);
      
      logger.info(`Successfully assigned role ${roleId} to users`);
    } catch (error) {
      logger.error(`Error assigning role ${roleId} to users:`, error);
      throw new Error(`Failed to assign Discord role: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async removeRoleFromUsers(roleId: string, userIds: string[]): Promise<void> {
    try {
      logger.info(`Removing role ${roleId} from ${userIds.length} users`);
      
      // Connect to Discord if not already connected
      await this.discordBotService.connect();
      
      await this.discordBotService.removeRoleFromUsers(roleId, userIds);
      
      logger.info(`Successfully removed role ${roleId} from users`);
    } catch (error) {
      logger.error(`Error removing role ${roleId} from users:`, error);
      throw new Error(`Failed to remove Discord role: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getChannel(channelId: string): Promise<DiscordChannel> {
    try {
      logger.info(`Getting Discord channel: ${channelId}`);
      
      // Connect to Discord if not already connected
      await this.discordBotService.connect();
      
      const channel = await this.discordBotService.getChannel(channelId);
      
      return channel;
    } catch (error) {
      logger.error(`Error getting Discord channel ${channelId}:`, error);
      throw new Error(`Failed to get Discord channel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getRole(roleId: string): Promise<DiscordRole> {
    try {
      logger.info(`Getting Discord role: ${roleId}`);
      
      // Connect to Discord if not already connected
      await this.discordBotService.connect();
      
      const role = await this.discordBotService.getRole(roleId);
      
      return role;
    } catch (error) {
      logger.error(`Error getting Discord role ${roleId}:`, error);
      throw new Error(`Failed to get Discord role: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async channelExists(name: string): Promise<boolean> {
    try {
      logger.info(`Checking if Discord channel exists: ${name}`);
      
      // Connect to Discord if not already connected
      await this.discordBotService.connect();
      
      const exists = await this.discordBotService.channelExists(name);
      
      return exists;
    } catch (error) {
      logger.error(`Error checking if Discord channel exists ${name}:`, error);
      throw new Error(`Failed to check Discord channel existence: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async roleExists(name: string): Promise<boolean> {
    try {
      logger.info(`Checking if Discord role exists: ${name}`);
      
      // Connect to Discord if not already connected
      await this.discordBotService.connect();
      
      const exists = await this.discordBotService.roleExists(name);
      
      return exists;
    } catch (error) {
      logger.error(`Error checking if Discord role exists ${name}:`, error);
      throw new Error(`Failed to check Discord role existence: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createCategory(name: string): Promise<string> {
    try {
      logger.info(`Creating Discord category: ${name}`);
      
      // Connect to Discord if not already connected
      await this.discordBotService.connect();
      
      const categoryId = await this.discordBotService.createCategory(name);
      
      logger.info(`Successfully created Discord category: ${name} with ID: ${categoryId}`);
      return categoryId;
    } catch (error) {
      logger.error(`Error creating Discord category ${name}:`, error);
      throw new Error(`Failed to create Discord category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async moveChannelToCategory(channelId: string, categoryId: string): Promise<void> {
    try {
      logger.info(`Moving Discord channel ${channelId} to category ${categoryId}`);
      
      // Connect to Discord if not already connected
      await this.discordBotService.connect();
      
      await this.discordBotService.moveChannelToCategory(channelId, categoryId);
      
      logger.info(`Successfully moved Discord channel ${channelId} to category ${categoryId}`);
    } catch (error) {
      logger.error(`Error moving Discord channel ${channelId} to category ${categoryId}:`, error);
      throw new Error(`Failed to move Discord channel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
