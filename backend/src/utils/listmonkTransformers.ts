import { ListMonkSubscriber, ListMonkList, ListMonkCampaign } from '@/types';
import { ListMonkSubscriberResponse, ListMonkListResponse, ListMonkCampaignResponse } from './listmonkApiClient';

export class ListMonkTransformers {
  /**
   * Transform ListMonk API subscriber response to internal ListMonkSubscriber type
   */
  static transformSubscriberResponse(response: ListMonkSubscriberResponse): ListMonkSubscriber {
    return {
      id: response.id.toString(),
      email: response.email,
      firstName: response.attribs?.first_name || '',
      lastName: response.attribs?.last_name || '',
      displayName: response.name,
      status: response.status,
      lists: response.lists.map(list => list.id),
      attributes: response.attribs || {},
      createdAt: response.created_at ? new Date(response.created_at) : undefined,
      updatedAt: response.updated_at ? new Date(response.updated_at) : undefined
    };
  }

  /**
   * Transform ListMonk API list response to internal ListMonkList type
   */
  static transformListResponse(response: ListMonkListResponse): ListMonkList {
    return {
      id: response.id,
      name: response.name,
      description: response.description,
      type: response.type,
      optin: response.optin,
      tags: response.tags || [],
      subscriberCount: response.subscriber_count,
      createdAt: response.created_at ? new Date(response.created_at) : undefined,
      updatedAt: response.updated_at ? new Date(response.updated_at) : undefined
    };
  }

  /**
   * Transform ListMonk API campaign response to internal ListMonkCampaign type
   */
  static transformCampaignResponse(response: ListMonkCampaignResponse): ListMonkCampaign {
    return {
      id: response.id,
      name: response.name,
      subject: response.subject,
      body: response.body,
      status: response.status,
      lists: response.lists,
      templateId: response.template_id,
      createdAt: response.created_at ? new Date(response.created_at) : undefined,
      updatedAt: response.updated_at ? new Date(response.updated_at) : undefined,
      startedAt: response.started_at ? new Date(response.started_at) : undefined,
      finishedAt: response.finished_at ? new Date(response.finished_at) : undefined
    };
  }

  /**
   * Transform internal ListMonkSubscriber to API request format
   */
  static transformSubscriberToRequest(subscriber: Partial<ListMonkSubscriber>): {
    email?: string;
    name?: string;
    status?: 'enabled' | 'disabled' | 'blocklisted';
    lists?: number[];
    attribs?: Record<string, any>;
  } {
    return {
      email: subscriber.email,
      name: subscriber.displayName || `${subscriber.firstName || ''} ${subscriber.lastName || ''}`.trim(),
      status: subscriber.status,
      lists: subscriber.lists,
      attribs: {
        first_name: subscriber.firstName || '',
        last_name: subscriber.lastName || '',
        display_name: subscriber.displayName || '',
        ...subscriber.attributes
      }
    };
  }

  /**
   * Transform internal ListMonkList to API request format
   */
  static transformListToRequest(list: Partial<ListMonkList>): {
    name?: string;
    description?: string;
    type?: 'public' | 'private' | 'optin' | 'optout';
    optin?: 'single' | 'double';
    tags?: string[];
  } {
    return {
      name: list.name,
      description: list.description,
      type: list.type,
      optin: list.optin,
      tags: list.tags
    };
  }

  /**
   * Transform internal ListMonkCampaign to API request format
   */
  static transformCampaignToRequest(campaign: Partial<ListMonkCampaign>): {
    name?: string;
    subject?: string;
    body?: string;
    lists?: number[];
    template_id?: number;
    status?: 'draft' | 'scheduled' | 'running' | 'paused' | 'finished';
  } {
    return {
      name: campaign.name,
      subject: campaign.subject,
      body: campaign.body,
      lists: campaign.lists,
      template_id: campaign.templateId,
      status: campaign.status
    };
  }

  /**
   * Transform multiple subscriber responses to internal types
   */
  static transformSubscriberResponses(responses: ListMonkSubscriberResponse[]): ListMonkSubscriber[] {
    return responses.map(response => this.transformSubscriberResponse(response));
  }

  /**
   * Transform multiple list responses to internal types
   */
  static transformListResponses(responses: ListMonkListResponse[]): ListMonkList[] {
    return responses.map(response => this.transformListResponse(response));
  }

  /**
   * Transform multiple campaign responses to internal types
   */
  static transformCampaignResponses(responses: ListMonkCampaignResponse[]): ListMonkCampaign[] {
    return responses.map(response => this.transformCampaignResponse(response));
  }

  /**
   * Extract subscriber IDs from a list of subscribers
   */
  static extractSubscriberIds(subscribers: ListMonkSubscriber[]): string[] {
    return subscribers.map(subscriber => subscriber.id!).filter(id => id);
  }

  /**
   * Extract list IDs from a list of lists
   */
  static extractListIds(lists: ListMonkList[]): number[] {
    return lists.map(list => list.id);
  }

  /**
   * Extract campaign IDs from a list of campaigns
   */
  static extractCampaignIds(campaigns: ListMonkCampaign[]): number[] {
    return campaigns.map(campaign => campaign.id);
  }

  /**
   * Filter subscribers by list membership
   */
  static filterSubscribersByList(subscribers: ListMonkSubscriber[], listId: number): ListMonkSubscriber[] {
    return subscribers.filter(subscriber => subscriber.lists.includes(listId));
  }

  /**
   * Filter subscribers by status
   */
  static filterSubscribersByStatus(subscribers: ListMonkSubscriber[], status: 'enabled' | 'disabled' | 'blocklisted'): ListMonkSubscriber[] {
    return subscribers.filter(subscriber => subscriber.status === status);
  }

  /**
   * Filter campaigns by status
   */
  static filterCampaignsByStatus(campaigns: ListMonkCampaign[], status: 'draft' | 'scheduled' | 'running' | 'paused' | 'finished'): ListMonkCampaign[] {
    return campaigns.filter(campaign => campaign.status === status);
  }

  /**
   * Check if a subscriber is a member of a specific list
   */
  static isSubscriberInList(subscriber: ListMonkSubscriber, listId: number): boolean {
    return subscriber.lists.includes(listId);
  }

  /**
   * Check if a list has any subscribers
   */
  static hasSubscribers(list: ListMonkList): boolean {
    return (list.subscriberCount || 0) > 0;
  }

  /**
   * Get the count of subscribers in a list
   */
  static getSubscriberCount(list: ListMonkList): number {
    return list.subscriberCount || 0;
  }

  /**
   * Validate subscriber data before sending to API
   */
  static validateSubscriberData(subscriber: Partial<ListMonkSubscriber>): string[] {
    const errors: string[] = [];

    if (!subscriber.email || subscriber.email.trim().length === 0) {
      errors.push('Email is required');
    }

    if (subscriber.email && !this.isValidEmail(subscriber.email)) {
      errors.push('Invalid email format');
    }

    if (subscriber.email && subscriber.email.length > 254) {
      errors.push('Email must be less than 254 characters');
    }

    if (subscriber.displayName && subscriber.displayName.length > 100) {
      errors.push('Display name must be less than 100 characters');
    }

    if (subscriber.firstName && subscriber.firstName.length > 50) {
      errors.push('First name must be less than 50 characters');
    }

    if (subscriber.lastName && subscriber.lastName.length > 50) {
      errors.push('Last name must be less than 50 characters');
    }

    return errors;
  }

  /**
   * Validate list data before sending to API
   */
  static validateListData(list: Partial<ListMonkList>): string[] {
    const errors: string[] = [];

    if (!list.name || list.name.trim().length === 0) {
      errors.push('List name is required');
    }

    if (list.name && list.name.length > 100) {
      errors.push('List name must be less than 100 characters');
    }

    if (list.description && list.description.length > 500) {
      errors.push('List description must be less than 500 characters');
    }

    return errors;
  }

  /**
   * Validate campaign data before sending to API
   */
  static validateCampaignData(campaign: Partial<ListMonkCampaign>): string[] {
    const errors: string[] = [];

    if (!campaign.name || campaign.name.trim().length === 0) {
      errors.push('Campaign name is required');
    }

    if (!campaign.subject || campaign.subject.trim().length === 0) {
      errors.push('Campaign subject is required');
    }

    if (!campaign.body || campaign.body.trim().length === 0) {
      errors.push('Campaign body is required');
    }

    if (campaign.name && campaign.name.length > 100) {
      errors.push('Campaign name must be less than 100 characters');
    }

    if (campaign.subject && campaign.subject.length > 200) {
      errors.push('Campaign subject must be less than 200 characters');
    }

    if (campaign.lists && campaign.lists.length === 0) {
      errors.push('Campaign must have at least one list');
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

  /**
   * Format subscriber name from first and last name
   */
  static formatSubscriberName(firstName?: string, lastName?: string, displayName?: string): string {
    if (displayName) {
      return displayName;
    }
    
    const parts = [firstName, lastName].filter(part => part && part.trim().length > 0);
    return parts.length > 0 ? parts.join(' ') : '';
  }

  /**
   * Parse subscriber name into first and last name
   */
  static parseSubscriberName(name: string): { firstName: string; lastName: string } {
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return { firstName: parts[0], lastName: '' };
    }
    
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ');
    return { firstName, lastName };
  }
}
