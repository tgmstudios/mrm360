import { WikiPage, WikiPermission } from '@/types';
import { WikiJsPage, WikiJsUser, WikiJsGroup, WikiJsPageInput, WikiJsPageListItem } from './wikijsApiClient';

export class WikiJsTransformers {
  /**
   * Transform Wiki.js API page response to internal WikiPage type
   */
  static transformPageResponse(response: WikiJsPage): WikiPage {
    return {
      id: response.id,
      path: response.path,
      title: response.title,
      description: response.description,
      content: response.content,
      isPublished: response.isPublished,
      isPrivate: response.isPrivate,
      tags: response.tags.map(tag => tag.tag),
      createdAt: new Date(response.createdAt),
      updatedAt: new Date(response.updatedAt),
      permissions: this.transformPermissions(response)
    };
  }

  /**
   * Transform Wiki.js API page list item to internal WikiPage type
   */
  static transformPageListItemResponse(response: WikiJsPageListItem): WikiPage {
    return {
      id: response.id,
      path: response.path,
      title: response.title,
      description: response.description,
      content: response.content || '',
      isPublished: response.isPublished,
      isPrivate: response.isPrivate,
      tags: response.tags,
      createdAt: new Date(response.createdAt),
      updatedAt: new Date(response.updatedAt),
      permissions: []
    };
  }

  /**
   * Transform internal WikiPage to Wiki.js API input
   */
  static transformPageInput(page: Partial<WikiPage>): WikiJsPageInput {
    return {
      path: page.path || '',
      title: page.title || '',
      content: page.content || '',
      locale: 'en',
      isPublished: true,
      isPrivate: false,
      tags: ['general'], // Provide a default tag instead of empty array
      description: page.title || '',
      editor: 'markdown' // Default to markdown editor
    };
  }

  /**
   * Transform Wiki.js API user response to internal user type
   */
  static transformUserResponse(response: WikiJsUser): any {
    return {
      id: response.id,
      name: response.name,
      email: response.email,
      providerKey: response.providerKey,
      isActive: response.isActive,
      isSystem: response.isSystem,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
      groups: response.groups.map(group => this.transformGroupResponse(group))
    };
  }

  /**
   * Transform Wiki.js API group response to internal group type
   */
  static transformGroupResponse(response: WikiJsGroup): any {
    return {
      id: response.id,
      name: response.name,
      description: response.description,
      permissions: response.permissions,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt
    };
  }

  /**
   * Transform permissions from Wiki.js format to internal format
   */
  private static transformPermissions(page: WikiJsPage): WikiPermission[] {
    // For now, return empty permissions array
    // This can be enhanced based on actual permission structure
    return [];
  }

  /**
   * Validate page data before sending to API
   */
  static validatePageData(page: Partial<WikiPage>): string[] {
    const errors: string[] = [];

    if (!page.path) {
      errors.push('Page path is required');
    }

    if (!page.title) {
      errors.push('Page title is required');
    }

    if (!page.content) {
      errors.push('Page content is required');
    }

    // Validate path format (no spaces, valid characters)
    if (page.path && !/^[a-zA-Z0-9\/\-_]+$/.test(page.path)) {
      errors.push('Page path contains invalid characters. Use only letters, numbers, hyphens, underscores, and forward slashes');
    }

    return errors;
  }

  /**
   * Validate user data before sending to API
   */
  static validateUserData(user: any): string[] {
    const errors: string[] = [];

    if (!user.email) {
      errors.push('User email is required');
    }

    if (!user.name) {
      errors.push('User name is required');
    }

    if (!user.passwordRaw) {
      errors.push('User password is required');
    }

    // Validate email format
    if (user.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      errors.push('Invalid email format');
    }

    return errors;
  }

  /**
   * Validate group data before sending to API
   */
  static validateGroupData(group: any): string[] {
    const errors: string[] = [];

    if (!group.name) {
      errors.push('Group name is required');
    }

    if (group.name && group.name.length < 2) {
      errors.push('Group name must be at least 2 characters long');
    }

    if (group.name && group.name.length > 50) {
      errors.push('Group name must be less than 50 characters long');
    }

    return errors;
  }

  /**
   * Sanitize page content for Wiki.js
   */
  static sanitizePageContent(content: string): string {
    // Remove any potentially dangerous HTML/script tags
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  /**
   * Generate a safe page path from title
   */
  static generateSafePath(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s\-_]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Check if a page path already exists
   */
  static async checkPathCollision(pages: { path: string }[], path: string): Promise<boolean> {
    return pages.some(page => page.path === path);
  }

  /**
   * Generate unique page path
   */
  static generateUniquePath(pages: { path: string }[], basePath: string): string {
    let counter = 1;
    let path = basePath;
    
    while (pages.some(page => page.path === path)) {
      path = `${basePath}-${counter}`;
      counter++;
    }
    
    return path;
  }
}
