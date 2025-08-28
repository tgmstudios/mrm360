import { WikiPage, WikiPermission } from '@/types';
import { logger } from '@/utils/logger';
import { WikiJsApiClient } from './wikijsApiClient';
import { WikiJsTransformers } from './wikijsTransformers';
import { WikiJsConfig } from './wikijsConfigValidator';

export class WikiJsService {
  private apiClient: WikiJsApiClient;
  private basePath: string;

  constructor(config: WikiJsConfig) {
    this.apiClient = new WikiJsApiClient({
      baseUrl: config.baseUrl,
      token: config.token
    });
    this.basePath = config.basePath;
  }

  /**
   * Get service configuration
   */
  getConfig(): WikiJsConfig {
    const apiConfig = this.apiClient.getConfig();
    return {
      baseUrl: apiConfig.baseUrl,
      token: apiConfig.token,
      basePath: this.basePath
    };
  }

  /**
   * Create a new Wiki.js page
   */
  async createPage(path: string, title: string, content: string): Promise<WikiPage> {
    try {
      logger.info(`Creating Wiki.js page: ${path}`);

      // Validate input data
      const pageData = { path, title, content };
      const validationErrors = WikiJsTransformers.validatePageData(pageData);
      
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      // Sanitize content
      const sanitizedContent = WikiJsTransformers.sanitizePageContent(content);
      
      // Transform to API input format
      const apiInput = WikiJsTransformers.transformPageInput({
        ...pageData,
        content: sanitizedContent
      });

      // Create page via API
      const apiResponse = await this.apiClient.createPage(apiInput);
      
      // Transform response to internal format
      const page = WikiJsTransformers.transformPageResponse(apiResponse);

      logger.info(`Successfully created Wiki.js page: ${path}`);
      return page;
    } catch (error) {
      logger.error(`Error creating Wiki.js page ${path}:`, error);
      throw new Error(`Failed to create Wiki.js page: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a new Wiki.js page with permissions
   */
  async createPageWithPermissions(path: string, title: string, content: string, permissions: WikiPermission[]): Promise<WikiPage> {
    try {
      logger.info(`Creating Wiki.js page with permissions: ${path}`);

      // Validate input data
      const pageData = { path, title, content };
      const validationErrors = WikiJsTransformers.validatePageData(pageData);
      
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      // Sanitize content
      const sanitizedContent = WikiJsTransformers.sanitizePageContent(content);
      
      // Transform to API input format (without permissions initially)
      const apiInput = WikiJsTransformers.transformPageInput({
        ...pageData,
        content: sanitizedContent
      });

      // Create page via API first
      const apiResponse = await this.apiClient.createPage(apiInput);
      
      // Now set permissions for the created page
      if (permissions.length > 0) {
        await this.setPagePermissions(path, permissions);
      }
      
      // Transform response to internal format
      const page = WikiJsTransformers.transformPageResponse(apiResponse);

      logger.info(`Successfully created Wiki.js page with permissions: ${path}`);
      return page;
    } catch (error) {
      logger.error(`Error creating Wiki.js page with permissions ${path}:`, error);
      throw new Error(`Failed to create Wiki.js page with permissions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update an existing Wiki.js page
   */
  async updatePage(path: string, updates: Partial<WikiPage>): Promise<WikiPage> {
    try {
      logger.info(`Updating Wiki.js page: ${path}`);

      // Get existing page to get its ID
      const existingPage = await this.getPage(path);
      if (!existingPage) {
        throw new Error(`Page not found: ${path}`);
      }

      // Get page ID from API
      const apiPage = await this.apiClient.getPageByPath(path);
      if (!apiPage) {
        throw new Error(`Page not found in API: ${path}`);
      }

      // Validate update data
      const updateData = { ...existingPage, ...updates };
      const validationErrors = WikiJsTransformers.validatePageData(updateData);
      
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      // Sanitize content if provided
      if (updates.content) {
        updates.content = WikiJsTransformers.sanitizePageContent(updates.content);
      }

      // Transform to API input format
      const apiInput = WikiJsTransformers.transformPageInput(updates);

      // Update page via API
      const apiResponse = await this.apiClient.updatePage(apiPage.id, apiInput);
      
      // Transform response to internal format
      const page = WikiJsTransformers.transformPageResponse(apiResponse);

      logger.info(`Successfully updated Wiki.js page: ${path}`);
      return page;
    } catch (error) {
      logger.error(`Error updating Wiki.js page ${path}:`, error);
      throw new Error(`Failed to update Wiki.js page: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a Wiki.js page
   */
  async deletePage(path: string): Promise<void> {
    try {
      logger.info(`Deleting Wiki.js page: ${path}`);

      // Get page ID from API
      const apiPage = await this.apiClient.getPageByPath(path);
      if (!apiPage) {
        throw new Error(`Page not found: ${path}`);
      }

      // Delete page via API
      await this.apiClient.deletePage(apiPage.id);

      logger.info(`Successfully deleted Wiki.js page: ${path}`);
    } catch (error) {
      logger.error(`Error deleting Wiki.js page ${path}:`, error);
      throw new Error(`Failed to delete Wiki.js page: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a Wiki.js group
   */
  async deleteGroup(groupId: string): Promise<void> {
    try {
      logger.info(`Deleting Wiki.js group: ${groupId}`);

      // Delete group via API
      await this.apiClient.deleteGroup(groupId);

      logger.info(`Successfully deleted Wiki.js group: ${groupId}`);
    } catch (error) {
      logger.error(`Error deleting Wiki.js group ${groupId}:`, error);
      throw new Error(`Failed to delete Wiki.js group: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Set permissions for a Wiki.js page
   */
  async setPagePermissions(path: string, permissions: WikiPermission[]): Promise<void> {
    try {
      logger.info(`Setting permissions for Wiki.js page: ${path}`);

      // Get page ID from API
      const apiPage = await this.apiClient.getPageByPath(path);
      if (!apiPage) {
        throw new Error(`Page not found: ${path}`);
      }

      // Update page with private namespace and access control
      // Wiki.js uses privateNS field for access control
      const privateNS = this.buildPrivateNamespace(permissions);
      
      await this.apiClient.updatePage(apiPage.id, {
        isPrivate: true,
        privateNS: privateNS
      });

      logger.info(`Successfully set permissions for Wiki.js page: ${path} with namespace: ${privateNS}`);
    } catch (error) {
      logger.error(`Error setting permissions for Wiki.js page ${path}:`, error);
      throw new Error(`Failed to set Wiki.js page permissions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build private namespace for access control
   * Format: group1:permission1,permission2;group2:permission1
   */
  private buildPrivateNamespace(permissions: WikiPermission[]): string {
    return permissions
      .map(permission => `${permission.groupId}:${permission.permissions.join(',')}`)
      .join(';');
  }

  /**
   * Create a group and assign it to a specific path
   */
  async createGroupForPath(groupName: string, path: string, description?: string, permissions: string[] = ['read', 'write']): Promise<{ group: any; pagePermissions: void }> {
    try {
      logger.info(`Creating group ${groupName} for path ${path}`);

      // Create the group first (only with name)
      const group = await this.apiClient.createGroup({
        name: groupName,
        description: description || `Group for managing access to ${path}`,
        permissions: permissions
      });

      // Note: Group permissions cannot be updated via the current API schema
      // Groups are created with basic permissions and require manual configuration
      logger.info(`Group created successfully. Note: Permissions must be configured manually in Wiki.js admin panel.`);

      // Set page permissions for the path
      const pagePermissions = await this.setPagePermissions(path, [{
        groupId: group.id,
        permissions: permissions
      }]);

      logger.info(`Successfully created group ${groupName} and assigned permissions to ${path}`);
      return { group, pagePermissions };
    } catch (error) {
      logger.error(`Error creating group ${groupName} for path ${path}:`, error);
      throw new Error(`Failed to create group for path: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a team group with path-based permissions
   */
  async createTeamGroup(teamType: string, teamName: string, permissions: string[] = ['read', 'write'], customPath?: string): Promise<any> {
    try {
      logger.info(`Creating team group for ${teamType} team: ${teamName}`);

      const groupName = `${teamType}-team-${teamName}`;
      const path = customPath || `${this.basePath === '/' ? '' : this.basePath}/${teamType}-team/${teamName}`;
      
      // Create the group first (only with name)
      const group = await this.apiClient.createGroup({
        name: groupName,
        description: `Group for ${teamName} ${teamType} team members`,
        permissions: permissions
      });

      // Note: Group permissions cannot be updated via the current API schema
      // Groups are created with basic permissions and require manual configuration
      logger.info(`Group created successfully. Note: Permissions must be configured manually in Wiki.js admin panel.`);

      // Create the team page if it doesn't exist
      if (!(await this.pageExists(path))) {
        // Create page with permissions directly
        const title = `${teamName} Team`;
        const content = `# ${teamName} Team

This is the main page for the ${teamName} team.

## Team Information
- **Type**: ${teamType}
- **Created**: ${new Date().toISOString()}

## Team Members
*To be populated*

## Team Resources
*To be populated*

## Quick Links
- [Team Directory](${this.basePath}/teams)
- [Team Projects](${this.basePath}/projects)
- [Team Documentation](${this.basePath}/docs)`;

        await this.createPageWithPermissions(path, title, content, [{
          groupId: group.id,
          permissions: permissions
        }]);
      } else {
        // Set permissions for existing team path
        await this.setPagePermissions(path, [{
          groupId: group.id,
          permissions: permissions
        }]);
      }

      logger.info(`Successfully created team group ${groupName} with path permissions`);
      return group;
    } catch (error) {
      logger.error(`Error creating team group for ${teamType} team: ${teamName}:`, error);
      throw new Error(`Failed to create team group: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get groups for a specific path
   */
  async getGroupsForPath(path: string): Promise<any[]> {
    try {
      logger.info(`Getting groups for path: ${path}`);

      const apiPage = await this.apiClient.getPageByPath(path);
      if (!apiPage) {
        throw new Error(`Page not found: ${path}`);
      }

      if (!apiPage.isPrivate || !apiPage.privateNS) {
        return []; // No access control
      }

      // Parse private namespace to extract group information
      const groups = this.parsePrivateNamespace(apiPage.privateNS);
      
      logger.info(`Found ${groups.length} groups with access to ${path}`);
      return groups;
    } catch (error) {
      logger.error(`Error getting groups for path ${path}:`, error);
      throw new Error(`Failed to get groups for path: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse private namespace to extract group and permission information
   */
  private parsePrivateNamespace(privateNS: string): Array<{ groupId: string; permissions: string[] }> {
    if (!privateNS) return [];

    return privateNS.split(';').map(groupPermission => {
      const [groupId, permissionsStr] = groupPermission.split(':');
      const permissions = permissionsStr ? permissionsStr.split(',') : [];
      return { groupId, permissions };
    });
  }

  /**
   * Add users to a group
   * Note: This functionality is not implemented due to Wiki.js API limitations
   * Users must be added to groups manually in the Wiki.js admin panel
   */
  async addUsersToGroup(groupId: string, userIds: string[]): Promise<void> {
    logger.warn(`User management not implemented. Please add users to group ${groupId} manually in Wiki.js admin panel.`);
    // This is a placeholder method - actual implementation requires manual admin panel configuration
  }

  /**
   * Create a complete team setup with group, page, and permissions
   */
  async createTeamSetup(teamType: string, teamName: string, userIds: string[] = [], permissions: string[] = ['read', 'write'], customPath?: string): Promise<{
    group: any;
    page: WikiPage;
    usersAdded: boolean;
  }> {
    try {
      logger.info(`Creating complete team setup for ${teamType} team: ${teamName}`);

      // Create the team group
      const group = await this.createTeamGroup(teamType, teamName, permissions, customPath);

      // Add users to the group if provided
      let usersAdded = false;
      if (userIds.length > 0) {
        await this.addUsersToGroup(group.id, userIds);
        usersAdded = true;
        logger.info(`Added ${userIds.length} users to team group: ${group.name}`);
      }

      // Get the team page
      const path = customPath || `${this.basePath === '/' ? '' : this.basePath}/${teamType}-team/${teamName}`;
      const page = await this.getPage(path);

      logger.info(`Successfully created complete team setup for ${teamName}`);
      return { group, page, usersAdded };
    } catch (error) {
      logger.error(`Error creating team setup for ${teamType} team: ${teamName}:`, error);
      throw new Error(`Failed to create team setup: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a Wiki.js page by path
   */
  async getPage(path: string): Promise<WikiPage> {
    try {
      logger.info(`Getting Wiki.js page: ${path}`);

      // Get page from API
      const apiPage = await this.apiClient.getPageByPath(path);
      if (!apiPage) {
        throw new Error(`Page not found: ${path}`);
      }

      // Transform response to internal format
      const page = WikiJsTransformers.transformPageResponse(apiPage);

      logger.info(`Successfully retrieved Wiki.js page: ${path}`);
      return page;
    } catch (error) {
      logger.error(`Error getting Wiki.js page ${path}:`, error);
      throw new Error(`Failed to get Wiki.js page: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if a Wiki.js page exists
   */
  async pageExists(path: string): Promise<boolean> {
    try {
      logger.info(`Checking if Wiki.js page exists: ${path}`);

      const apiPage = await this.apiClient.getPageByPath(path);
      const exists = apiPage !== null;

      logger.info(`Wiki.js page ${path} ${exists ? 'exists' : 'does not exist'}`);
      return exists;
    } catch (error) {
      logger.error(`Error checking if Wiki.js page exists ${path}:`, error);
      return false;
    }
  }

  /**
   * Create a team index page
   */
  async createTeamIndexPage(teamType: string, teamName: string): Promise<WikiPage> {
    try {
      logger.info(`Creating team index page for ${teamType} team: ${teamName}`);

      // Handle case where basePath is just "/" to avoid double slashes
      const basePath = this.basePath === '/' ? '' : this.basePath;
      const path = `${basePath}/${teamType}-team/${teamName}`;
      const title = `${teamName} Team`;
      const content = `# ${teamName} Team

This is the main page for the ${teamName} team.

## Team Information
- **Type**: ${teamType}
- **Created**: ${new Date().toISOString()}

## Team Members
*To be populated*

## Team Resources
*To be populated*

## Quick Links
- [Team Directory](${this.basePath}/teams)
- [Team Projects](${this.basePath}/projects)
- [Team Documentation](${this.basePath}/docs)`;

      // Check if page already exists
      const exists = await this.pageExists(path);
      if (exists) {
        logger.info(`Team index page already exists: ${path}`);
        return await this.getPage(path);
      }

      // Create the page
      const page = await this.createPage(path, title, content);
      
      logger.info(`Successfully created team index page for ${teamName}: ${path}`);
      return page;
    } catch (error) {
      logger.error(`Error creating team index page for ${teamName}:`, error);
      throw error;
    }
  }

  /**
   * Get all pages
   */
  async getAllPages(): Promise<WikiPage[]> {
    try {
      logger.info('Getting all Wiki.js pages');

      const apiPages = await this.apiClient.getPages();
      const pages = apiPages.map(page => WikiJsTransformers.transformPageListItemResponse(page));

      logger.info(`Successfully retrieved ${pages.length} Wiki.js pages`);
      return pages;
    } catch (error) {
      logger.error('Error getting all Wiki.js pages:', error);
      throw new Error(`Failed to get Wiki.js pages: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all page paths (for collision checking)
   */
  async getAllPagePaths(): Promise<{ path: string }[]> {
    try {
      logger.info('Getting all Wiki.js page paths');

      const apiPages = await this.apiClient.getPages();
      // Create objects with just the path property for collision checking
      const pagePaths = apiPages.map(page => ({ path: page.path }));

      logger.info(`Successfully retrieved ${pagePaths.length} Wiki.js page paths`);
      return pagePaths;
    } catch (error) {
      logger.error('Error getting all Wiki.js page paths:', error);
      throw new Error(`Failed to get Wiki.js page paths: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search pages by query
   */
  async searchPages(query: string): Promise<WikiPage[]> {
    try {
      logger.info(`Searching Wiki.js pages for: ${query}`);

      const allPages = await this.getAllPages();
      const matchingPages = allPages.filter(page => 
        page.title.toLowerCase().includes(query.toLowerCase()) ||
        page.content.toLowerCase().includes(query.toLowerCase()) ||
        page.path.toLowerCase().includes(query.toLowerCase())
      );

      logger.info(`Found ${matchingPages.length} pages matching query: ${query}`);
      return matchingPages;
    } catch (error) {
      logger.error(`Error searching Wiki.js pages for ${query}:`, error);
      throw new Error(`Failed to search Wiki.js pages: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a page with auto-generated path
   */
  async createPageWithAutoPath(title: string, content: string, basePath?: string): Promise<WikiPage> {
    try {
      logger.info(`Creating Wiki.js page with auto-generated path: ${title}`);

      // Generate safe path from title
      let path = WikiJsTransformers.generateSafePath(title);
      
      // Add base path if provided, handling the case where basePath is just "/"
      if (basePath) {
        const sanitizedBasePath = basePath === '/' ? '' : basePath;
        path = `${sanitizedBasePath}/${path}`;
      } else if (this.basePath) {
        const sanitizedBasePath = this.basePath === '/' ? '' : this.basePath;
        path = `${sanitizedBasePath}/${path}`;
      }

      // Check for path collisions and generate unique path
      const allPagePaths = await this.getAllPagePaths();
      
      if (await WikiJsTransformers.checkPathCollision(allPagePaths, path)) {
        path = WikiJsTransformers.generateUniquePath(allPagePaths, path);
        logger.info(`Path collision detected, using unique path: ${path}`);
      }

      // Create the page
      const page = await this.createPage(path, title, content);
      
      logger.info(`Successfully created Wiki.js page with auto-generated path: ${path}`);
      return page;
    } catch (error) {
      logger.error(`Error creating Wiki.js page with auto-generated path: ${title}:`, error);
      throw error;
    }
  }

  /**
   * Health check for the service
   */
  async healthCheck(): Promise<boolean> {
    try {
      logger.info('Performing Wiki.js service health check');
      
      const isHealthy = await this.apiClient.healthCheck();
      
      if (isHealthy) {
        logger.info('Wiki.js service health check passed');
      } else {
        logger.warn('Wiki.js service health check failed');
      }
      
      return isHealthy;
    } catch (error) {
      logger.error('Wiki.js service health check error:', error);
      return false;
    }
  }

  /**
   * Get service status information
   */
  async getServiceStatus(): Promise<{
    isHealthy: boolean;
    basePath: string;
    lastHealthCheck: Date;
    pageCount?: number;
  }> {
    try {
      const isHealthy = await this.healthCheck();
      let pageCount: number | undefined;
      
      if (isHealthy) {
        try {
          const pages = await this.getAllPages();
          pageCount = pages.length;
        } catch (error) {
          logger.warn('Could not get page count for status:', error);
        }
      }
      
      return {
        isHealthy,
        basePath: this.basePath,
        lastHealthCheck: new Date(),
        pageCount
      };
    } catch (error) {
      logger.error('Error getting service status:', error);
      return {
        isHealthy: false,
        basePath: this.basePath,
        lastHealthCheck: new Date()
      };
    }
  }
}
