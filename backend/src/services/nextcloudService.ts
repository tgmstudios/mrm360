import { NextcloudGroup, NextcloudFolder, NextcloudCalendar, NextcloudDeckBoard } from '@/types';
import { logger } from '@/utils/logger';
import { NextcloudApiClient } from '@/utils/nextcloudApiClient';
import { NextcloudTransformers } from '@/utils/nextcloudTransformers';

export class NextcloudService {
  private apiClient: NextcloudApiClient;
  private basePath: string;
  private baseUrl: string;
  private username: string;

  constructor(config: {
    baseUrl: string;
    username: string;
    password: string;
    basePath: string;
  }) {
    this.apiClient = new NextcloudApiClient({
      baseUrl: config.baseUrl,
      username: config.username,
      password: config.password
    });
    this.basePath = config.basePath;
    this.baseUrl = config.baseUrl;
    this.username = config.username;
  }

  async createGroup(groupName: string, description?: string): Promise<NextcloudGroup> {
    try {
      logger.info(`Creating Nextcloud group: ${groupName}`);
      
      // Sanitize group name for Nextcloud compatibility
      const sanitizedGroupName = NextcloudTransformers.sanitizeGroupName(groupName);
      
      // Validate group data
      const validationErrors = NextcloudTransformers.validateGroupData({ name: sanitizedGroupName });
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      const response = await this.apiClient.createGroup({
        name: sanitizedGroupName,
        displayName: description || groupName
      });
      
      const group = NextcloudTransformers.transformGroupResponse(response);
      
      logger.info(`Successfully created Nextcloud group: ${groupName} with ID: ${group.id}`);
      return group;
    } catch (error) {
      logger.error(`Error creating Nextcloud group ${groupName}:`, error);
      throw new Error(`Failed to create Nextcloud group: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateGroup(groupId: string, updates: Partial<NextcloudGroup>): Promise<NextcloudGroup> {
    try {
      logger.info(`Updating Nextcloud group: ${groupId}`);
      
      // Validate updates
      if (updates.name) {
        const sanitizedName = NextcloudTransformers.sanitizeGroupName(updates.name);
        const validationErrors = NextcloudTransformers.validateGroupData({ name: sanitizedName });
        if (validationErrors.length > 0) {
          throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
        }
        updates.name = sanitizedName;
      }
      
      const response = await this.apiClient.updateGroup(groupId, {
        name: updates.name,
        displayName: updates.name // Use name as display name for simplicity
      });
      
      const group = NextcloudTransformers.transformGroupResponse(response);
      
      logger.info(`Successfully updated Nextcloud group: ${groupId}`);
      return group;
    } catch (error) {
      logger.error(`Error updating Nextcloud group ${groupId}:`, error);
      throw new Error(`Failed to update Nextcloud group: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteGroup(groupId: string): Promise<void> {
    try {
      logger.info(`Deleting Nextcloud group: ${groupId}`);
      
      await this.apiClient.deleteGroup(groupId);
      
      logger.info(`Successfully deleted Nextcloud group: ${groupId}`);
    } catch (error) {
      logger.error(`Error deleting Nextcloud group ${groupId}:`, error);
      throw new Error(`Failed to delete Nextcloud group: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createGroupFolder(folderName: string, groupId: string): Promise<NextcloudFolder> {
    try {
      logger.info(`Creating Nextcloud group folder: ${folderName}`);
      
      // Validate folder name
      if (!folderName || folderName.trim() === '') {
        throw new Error('Folder name cannot be empty');
      }
      
      // Clean folder name (remove any path separators, use only the name)
      const cleanFolderName = folderName.replace(/[\/\\]/g, '').trim();
      if (cleanFolderName === '') {
        throw new Error('Invalid folder name after cleaning');
      }
      
      // Create folder using Nextcloud Groupfolders API
      const response = await this.apiClient.createGroupFolder({
        path: cleanFolderName,
        groupId
      });
      
      const folder = NextcloudTransformers.transformFolderResponse(response);
      
      logger.info(`Successfully created Nextcloud group folder: ${cleanFolderName}`);
      return folder;
    } catch (error) {
      logger.error(`Error creating Nextcloud group folder ${folderName}:`, error);
      
      // Provide specific error messages for common issues
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          throw new Error('Groupfolders app not found. Please ensure the Groupfolders app is installed and enabled on your Nextcloud instance.');
        }
        if (error.message.includes('409')) {
          throw new Error('Folder already exists with that name.');
        }
        if (error.message.includes('401') || error.message.includes('403')) {
          throw new Error('Authentication failed or insufficient permissions. Please check your Nextcloud credentials and ensure the user has admin privileges for group folder management.');
        }
        if (error.message.includes('422')) {
          throw new Error('Invalid folder name. Please ensure the name contains only valid characters and follows Nextcloud naming conventions.');
        }
      }
      
      throw new Error(`Failed to create Nextcloud group folder: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateGroupFolder(folderName: string, updates: Partial<NextcloudFolder>): Promise<NextcloudFolder> {
    try {
      logger.info(`Updating Nextcloud group folder: ${folderName}`);
      
      // Note: Nextcloud group folder updates are limited through the API
      // Most updates require web interface or advanced API calls
      logger.warn('Nextcloud group folder updates are limited through the API - most changes require web interface');
      
      const response = await this.apiClient.updateGroupFolder(folderName, updates);
      const folder = NextcloudTransformers.transformFolderResponse(response);
      
      logger.info(`Successfully updated Nextcloud group folder: ${folderName}`);
      return folder;
    } catch (error) {
      logger.error(`Error updating Nextcloud group folder ${folderName}:`, error);
      throw new Error(`Failed to update Nextcloud group folder: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteGroupFolder(folderNameOrId: string | { folderId: string; path?: string }): Promise<void> {
    try {
      let folderId: string;
      let folderPath: string;
      
      if (typeof folderNameOrId === 'string') {
        // If it's a string, treat it as a folder name and try to look it up
        folderPath = folderNameOrId;
        logger.info(`Deleting Nextcloud group folder by name: ${folderPath}`);
        
        try {
          const folder = await this.apiClient.getGroupFolder(folderPath);
          folderId = folder.folderId!;
        } catch (lookupError) {
          logger.error(`Could not look up folder for deletion: ${folderPath}`, lookupError);
          throw new Error(`Cannot delete folder: unable to determine folder ID for '${folderPath}'. This may be due to authentication issues with the Groupfolders API.`);
        }
      } else {
        // If it's an object, use the folderId directly
        folderId = folderNameOrId.folderId;
        folderPath = folderNameOrId.path || folderId;
        logger.info(`Deleting Nextcloud group folder by ID: ${folderId} (${folderPath})`);
      }
      
      // Delete using the folder ID directly
      await this.apiClient.deleteGroupFolderById(folderId);
      
      logger.info(`Successfully deleted Nextcloud group folder: ${folderPath} (ID: ${folderId})`);
    } catch (error) {
      logger.error(`Error deleting Nextcloud group folder:`, error);
      throw new Error(`Failed to delete Nextcloud group folder: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createCalendar(name: string, groupId: string): Promise<NextcloudCalendar> {
    try {
      logger.info(`Creating Nextcloud calendar: ${name}`);
      
      // Build calendar name for group
      const calendarName = NextcloudTransformers.buildGroupCalendarName(groupId, name);
      
      // Validate calendar data
      const validationErrors = NextcloudTransformers.validateCalendarData({
        name: calendarName,
        groupId
      });
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      const response = await this.apiClient.createCalendar({
        name: calendarName,
        groupId
      });
      
      const calendar = NextcloudTransformers.transformCalendarResponse(response);
      
      logger.info(`Successfully created Nextcloud calendar: ${calendarName}`);
      return calendar;
    } catch (error) {
      logger.error(`Error creating Nextcloud calendar ${name}:`, error);
      // Provide specific error messages for common issues
      if (error instanceof Error) {
        if (error.message.includes('Calendar app not installed')) {
          throw new Error('Calendar app not installed or configured on this Nextcloud instance. Please install the Calendar app from the Nextcloud app store.');
        }
        if (error.message.includes('401') || error.message.includes('403')) {
          throw new Error('Authentication failed. Please check your Nextcloud credentials and ensure the user has admin privileges.');
        }
        if (error.message.includes('404')) {
          throw new Error('Calendar endpoint not found. Please ensure the Calendar app is properly installed and configured.');
        }
      }
      
      throw new Error(`Failed to create Nextcloud calendar: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteCalendar(name: string): Promise<void> {
    try {
      logger.info(`Deleting Nextcloud calendar: ${name}`);
      
      await this.apiClient.deleteCalendar(name);
      
      logger.info(`Successfully deleted Nextcloud calendar: ${name}`);
    } catch (error) {
      logger.error(`Error deleting Nextcloud calendar ${name}:`, error);
      throw new Error(`Failed to delete Nextcloud calendar: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createDeckBoard(name: string, groupId: string): Promise<NextcloudDeckBoard> {
    try {
      logger.info(`Creating Nextcloud deck board: ${name}`);
      
      // Build deck board name for group
      const boardName = NextcloudTransformers.buildGroupDeckBoardName(groupId, name);
      
      // Validate deck board data
      const validationErrors = NextcloudTransformers.validateDeckBoardData({
        name: boardName,
        groupId
      });
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      const response = await this.apiClient.createDeckBoard({
        name: boardName,
        groupId
      });
      
      const board = NextcloudTransformers.transformDeckBoardResponse(response);
      
      logger.info(`Successfully created Nextcloud deck board: ${boardName}`);
      return board;
    } catch (error) {
      logger.error(`Error creating Nextcloud deck board ${name}:`, error);
      // Provide specific error messages for common issues
      if (error instanceof Error) {
        if (error.message.includes('Deck app not installed')) {
          throw new Error('Deck app not installed or configured on this Nextcloud instance. Please install the Deck app from the Nextcloud app store.');
        }
        if (error.message.includes('Invalid color format')) {
          throw new Error('Invalid color format provided. Color must be a valid 6-character hex color (e.g., #FF0000).');
        }
        if (error.message.includes('401') || error.message.includes('403')) {
          throw new Error('Authentication failed. Please check your Nextcloud credentials and ensure the user has admin privileges.');
        }
        if (error.message.includes('404')) {
          throw new Error('Deck endpoint not found. Please ensure the Deck app is properly installed and configured.');
        }
      }
      
      throw new Error(`Failed to create Nextcloud deck board: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteDeckBoard(name: string): Promise<void> {
    try {
      logger.info(`Deleting Nextcloud deck board: ${name}`);
      
      await this.apiClient.deleteDeckBoard(name);
      
      logger.info(`Successfully deleted Nextcloud deck board: ${name}`);
    } catch (error) {
      logger.error(`Error deleting Nextcloud deck board ${name}:`, error);
      throw new Error(`Failed to delete Nextcloud deck board: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async addUsersToGroup(groupId: string, userIds: string[]): Promise<void> {
    try {
      logger.info(`Adding ${userIds.length} users to Nextcloud group: ${groupId}`);
      
      if (userIds.length === 0) {
        logger.warn('No user IDs provided for group assignment');
        return;
      }

      await this.apiClient.addUsersToGroup(groupId, userIds);
      
      logger.info(`Successfully added users to Nextcloud group: ${groupId}`);
    } catch (error) {
      logger.error(`Error adding users to Nextcloud group ${groupId}:`, error);
      throw new Error(`Failed to add users to Nextcloud group: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async removeUsersFromGroup(groupId: string, userIds: string[]): Promise<void> {
    try {
      logger.info(`Removing ${userIds.length} users from Nextcloud group: ${groupId}`);
      
      if (userIds.length === 0) {
        logger.warn('No user IDs provided for group removal');
        return;
      }

      await this.apiClient.removeUsersFromGroup(groupId, userIds);
      
      logger.info(`Successfully removed users from Nextcloud group: ${groupId}`);
    } catch (error) {
      logger.error(`Error removing users from Nextcloud group ${groupId}:`, error);
      throw new Error(`Failed to remove users from Nextcloud group: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getGroup(groupId: string): Promise<NextcloudGroup> {
    try {
      logger.info(`Getting Nextcloud group: ${groupId}`);
      
      const response = await this.apiClient.getGroup(groupId);
      const group = NextcloudTransformers.transformGroupResponse(response);
      
      logger.info(`Successfully retrieved Nextcloud group: ${groupId}`);
      return group;
    } catch (error) {
      logger.error(`Error getting Nextcloud group ${groupId}:`, error);
      throw new Error(`Failed to get Nextcloud group: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get service health status
   */
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'unhealthy' | 'degraded';
    message: string;
    timestamp: Date;
    details?: any;
  }> {
    try {
      // Try to get a test group to verify connectivity
      const testGroupName = `health-check-${Date.now()}`;
      const testGroup = await this.createGroup(testGroupName);
      
      if (testGroup && testGroup.id) {
        // Clean up the test group
        await this.deleteGroup(testGroup.id);
        
        return {
          status: 'healthy',
          message: 'Nextcloud service is responding correctly',
          timestamp: new Date(),
          details: { authMethod: 'basic' }
        };
      }
      
      return {
        status: 'degraded',
        message: 'Nextcloud service is responding but with unexpected behavior',
        timestamp: new Date(),
        details: { authMethod: 'basic' }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Nextcloud service is not responding: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  /**
   * Get service configuration info (without sensitive data)
   */
  getServiceInfo(): {
    baseUrl: string;
    username: string;
    basePath: string;
    configured: boolean;
  } {
    // Store config in constructor for access
    return {
      baseUrl: this.baseUrl || 'Not available',
      username: this.username || 'Not available',
      basePath: this.basePath,
      configured: !!(this.baseUrl && this.username)
    };
  }
}
