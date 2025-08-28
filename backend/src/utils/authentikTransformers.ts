import { AuthentikGroup, AuthentikUser } from '@/types';
import { AuthentikGroupResponse, AuthentikUserResponse } from './authentikApiClient';

export class AuthentikTransformers {
  /**
   * Transform Authentik API group response to internal AuthentikGroup type
   */
  static transformGroupResponse(response: AuthentikGroupResponse): AuthentikGroup {
    return {
      id: response.pk,
      name: response.name,
      description: response.description,
      parentGroupId: response.parent,
      users: response.users || []
    };
  }

  /**
   * Transform Authentik API user response to internal AuthentikUser type
   */
  static transformUserResponse(response: AuthentikUserResponse): AuthentikUser {
    return {
      id: response.pk,
      username: response.username,
      email: response.email,
      groups: response.groups || [],
      attributes: response.attributes || {}
    };
  }

  /**
   * Transform internal AuthentikGroup to API request format
   */
  static transformGroupToRequest(group: Partial<AuthentikGroup>): {
    name?: string;
    description?: string;
    parent?: string;
  } {
    return {
      name: group.name,
      description: group.description,
      parent: group.parentGroupId
    };
  }

  /**
   * Transform multiple group responses to internal types
   */
  static transformGroupResponses(responses: AuthentikGroupResponse[]): AuthentikGroup[] {
    return responses.map(response => this.transformGroupResponse(response));
  }

  /**
   * Transform multiple user responses to internal types
   */
  static transformUserResponses(responses: AuthentikUserResponse[]): AuthentikUser[] {
    return responses.map(response => this.transformUserResponse(response));
  }

  /**
   * Extract user IDs from a list of users
   */
  static extractUserIds(users: AuthentikUser[]): string[] {
    return users.map(user => user.id);
  }

  /**
   * Extract group IDs from a list of groups
   */
  static extractGroupIds(groups: AuthentikGroup[]): string[] {
    return groups.map(group => group.id);
  }

  /**
   * Filter groups by parent group ID
   */
  static filterGroupsByParent(groups: AuthentikGroup[], parentGroupId: string): AuthentikGroup[] {
    return groups.filter(group => group.parentGroupId === parentGroupId);
  }

  /**
   * Filter users by group membership
   */
  static filterUsersByGroup(users: AuthentikUser[], groupId: string): AuthentikUser[] {
    return users.filter(user => user.groups.includes(groupId));
  }

  /**
   * Check if a user is a member of a specific group
   */
  static isUserInGroup(user: AuthentikUser, groupId: string): boolean {
    return user.groups.includes(groupId);
  }

  /**
   * Check if a group has any users
   */
  static hasUsers(group: AuthentikGroup): boolean {
    return group.users.length > 0;
  }

  /**
   * Get the count of users in a group
   */
  static getUserCount(group: AuthentikGroup): number {
    return group.users.length;
  }

  /**
   * Validate group data before sending to API
   */
  static validateGroupData(group: Partial<AuthentikGroup>): string[] {
    const errors: string[] = [];

    if (!group.name || group.name.trim().length === 0) {
      errors.push('Group name is required');
    }

    if (group.name && group.name.length > 255) {
      errors.push('Group name must be less than 255 characters');
    }

    if (group.description && group.description.length > 1000) {
      errors.push('Group description must be less than 1000 characters');
    }

    return errors;
  }

  /**
   * Validate user data before sending to API
   */
  static validateUserData(user: Partial<AuthentikUser>): string[] {
    const errors: string[] = [];

    if (!user.username || user.username.trim().length === 0) {
      errors.push('Username is required');
    }

    if (!user.email || user.email.trim().length === 0) {
      errors.push('Email is required');
    }

    if (user.email && !this.isValidEmail(user.email)) {
      errors.push('Invalid email format');
    }

    if (user.username && user.username.length > 150) {
      errors.push('Username must be less than 150 characters');
    }

    return errors;
  }

  /**
   * Simple email validation
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
