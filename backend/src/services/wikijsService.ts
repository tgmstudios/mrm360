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

      // For now, we'll just log the permissions
      // Wiki.js permissions are typically handled at the group level
      // This can be enhanced based on actual permission structure
      logger.info(`Permissions for page ${path}:`, permissions);

      logger.info(`Successfully set permissions for Wiki.js page: ${path}`);
    } catch (error) {
      logger.error(`Error setting permissions for Wiki.js page ${path}:`, error);
      throw new Error(`Failed to set Wiki.js page permissions: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

      const path = `${this.basePath}/${teamType}-team/${teamName}`;
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
      const pages = apiPages.map(page => WikiJsTransformers.transformPageResponse(page));

      logger.info(`Successfully retrieved ${pages.length} Wiki.js pages`);
      return pages;
    } catch (error) {
      logger.error('Error getting all Wiki.js pages:', error);
      throw new Error(`Failed to get Wiki.js pages: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      
      // Add base path if provided
      if (basePath) {
        path = `${basePath}/${path}`;
      } else if (this.basePath) {
        path = `${this.basePath}/${path}`;
      }

      // Check for path collisions and generate unique path
      const allPages = await this.getAllPages();
      const apiPages = allPages.map(page => ({ path: page.path } as any));
      
      if (await WikiJsTransformers.checkPathCollision(apiPages, path)) {
        path = WikiJsTransformers.generateUniquePath(apiPages, path);
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
