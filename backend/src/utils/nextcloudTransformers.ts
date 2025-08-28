import { NextcloudGroup, NextcloudFolder, NextcloudCalendar, NextcloudDeckBoard } from '@/types';
import { 
  NextcloudGroupResponse, 
  NextcloudFolderResponse, 
  NextcloudCalendarResponse, 
  NextcloudDeckBoardResponse 
} from './nextcloudApiClient';

export class NextcloudTransformers {
  /**
   * Transform Nextcloud API group response to internal type
   */
  static transformGroupResponse(response: NextcloudGroupResponse): NextcloudGroup {
    return {
      id: response.id,
      name: response.name,
      members: response.members || []
    };
  }

  /**
   * Transform Nextcloud API folder response to internal type
   */
  static transformFolderResponse(response: NextcloudFolderResponse): NextcloudFolder {
    return {
      path: response.path,
      permissions: response.permissions || ['read', 'write'],
      groupId: response.groupId,
      folderId: response.folderId
    };
  }

  /**
   * Transform Nextcloud API calendar response to internal type
   */
  static transformCalendarResponse(response: NextcloudCalendarResponse): NextcloudCalendar {
    return {
      name: response.name,
      groupId: response.groupId
    };
  }

  /**
   * Transform Nextcloud API deck board response to internal type
   */
  static transformDeckBoardResponse(response: NextcloudDeckBoardResponse): NextcloudDeckBoard {
    return {
      name: response.name,
      groupId: response.groupId,
      boardId: response.boardId
    };
  }

  /**
   * Validate group data before creation/update
   */
  static validateGroupData(group: Partial<NextcloudGroup>): string[] {
    const errors: string[] = [];

    if (!group.name || group.name.trim().length === 0) {
      errors.push('Group name is required');
    }

    if (group.name && group.name.length > 64) {
      errors.push('Group name must be 64 characters or less');
    }

    // Nextcloud group names should be lowercase and contain only alphanumeric characters, hyphens, and underscores
    if (group.name && !/^[a-z0-9_-]+$/.test(group.name)) {
      errors.push('Group name must contain only lowercase letters, numbers, hyphens, and underscores');
    }

    return errors;
  }

  /**
   * Validate folder data before creation/update
   */
  static validateFolderData(folder: Partial<NextcloudFolder>): string[] {
    const errors: string[] = [];

    if (!folder.path || folder.path.trim().length === 0) {
      errors.push('Folder path is required');
    }

    if (folder.path && !folder.path.startsWith('/')) {
      errors.push('Folder path must start with /');
    }

    if (folder.path && folder.path.includes('..')) {
      errors.push('Folder path cannot contain directory traversal sequences');
    }

    if (!folder.groupId || folder.groupId.trim().length === 0) {
      errors.push('Group ID is required');
    }

    if (folder.permissions) {
      const validPermissions = ['read', 'write', 'delete', 'share'];
      const invalidPermissions = folder.permissions.filter(p => !validPermissions.includes(p));
      if (invalidPermissions.length > 0) {
        errors.push(`Invalid permissions: ${invalidPermissions.join(', ')}. Valid permissions are: ${validPermissions.join(', ')}`);
      }
    }

    return errors;
  }

  /**
   * Validate calendar data before creation/update
   */
  static validateCalendarData(calendar: Partial<NextcloudCalendar>): string[] {
    const errors: string[] = [];

    if (!calendar.name || calendar.name.trim().length === 0) {
      errors.push('Calendar name is required');
    }

    if (calendar.name && calendar.name.length > 128) {
      errors.push('Calendar name must be 128 characters or less');
    }

    if (!calendar.groupId || calendar.groupId.trim().length === 0) {
      errors.push('Group ID is required');
    }

    // Validate color format if provided
    if (calendar.color && !/^#[0-9A-Fa-f]{6}$/.test(calendar.color)) {
      errors.push('Color must be a valid 6-character hex color (e.g., #FF0000)');
    }

    return errors;
  }

  /**
   * Validate deck board data before creation/update
   */
  static validateDeckBoardData(board: Partial<NextcloudDeckBoard>): string[] {
    const errors: string[] = [];

    if (!board.name || board.name.trim().length === 0) {
      errors.push('Board name is required');
    }

    if (board.name && board.name.length > 128) {
      errors.push('Board name must be 128 characters or less');
    }

    if (!board.groupId || board.groupId.trim().length === 0) {
      errors.push('Group ID is required');
    }

    // Validate color format if provided
    if (board.color && !/^#[0-9A-Fa-f]{6}$/.test(board.color)) {
      errors.push('Color must be a valid 6-character hex color (e.g., #FF0000)');
    }

    return errors;
  }

  /**
   * Sanitize group name for Nextcloud compatibility
   */
  static sanitizeGroupName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Sanitize folder path for Nextcloud compatibility
   */
  static sanitizeFolderPath(path: string): string {
    return path
      .replace(/\/+/g, '/') // Remove multiple consecutive slashes
      .replace(/\.\./g, '') // Remove directory traversal
      .replace(/[<>:"|?*]/g, '_') // Replace invalid characters
      .replace(/\/$/, '') // Remove trailing slash
      .replace(/^\//, '/'); // Ensure starts with single slash
  }

  /**
   * Sanitize calendar name for Nextcloud compatibility
   */
  static sanitizeCalendarName(name: string): string {
    return name
      .replace(/[<>:"|?*]/g, '_') // Replace invalid characters
      .trim();
  }

  /**
   * Sanitize deck board name for Nextcloud compatibility
   */
  static sanitizeDeckBoardName(name: string): string {
    return name
      .replace(/[<>:"|?*]/g, '_') // Replace invalid characters
      .trim();
  }

  /**
   * Build folder path for group
   */
  static buildGroupFolderPath(basePath: string, groupName: string, subPath?: string): string {
    const sanitizedGroupName = this.sanitizeGroupName(groupName);
    const sanitizedBasePath = this.sanitizeFolderPath(basePath);
    
    let path = `${sanitizedBasePath}/${sanitizedGroupName}`;
    
    if (subPath) {
      const sanitizedSubPath = this.sanitizeFolderPath(subPath);
      path += `/${sanitizedSubPath}`;
    }
    
    return path;
  }

  /**
   * Build calendar name for group
   */
  static buildGroupCalendarName(groupName: string, calendarName?: string): string {
    const sanitizedGroupName = this.sanitizeGroupName(groupName);
    
    if (calendarName) {
      const sanitizedCalendarName = this.sanitizeCalendarName(calendarName);
      return `${sanitizedGroupName}-${sanitizedCalendarName}`;
    }
    
    return `${sanitizedGroupName}-calendar`;
  }

  /**
   * Build deck board name for group
   */
  static buildGroupDeckBoardName(groupName: string, boardName?: string): string {
    const sanitizedGroupName = this.sanitizeGroupName(groupName);
    
    if (boardName) {
      const sanitizedBoardName = this.sanitizeDeckBoardName(boardName);
      return `${sanitizedGroupName}-${sanitizedBoardName}`;
    }
    
    return `${sanitizedGroupName}-board`;
  }
}
