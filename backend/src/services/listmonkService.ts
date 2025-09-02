import { ListMonkSubscriber, ListMonkList, ListMonkCampaign, ListMonkConfig } from '@/types';
import { logger } from '@/utils/logger';
import { ListMonkApiClient } from '@/utils/listmonkApiClient';
import { ListMonkTransformers } from '@/utils/listmonkTransformers';
import { ListMonkQueueService } from './listmonkQueueService';

export class ListMonkService {
  private apiClient: ListMonkApiClient;

  constructor(config: ListMonkConfig) {
    this.apiClient = new ListMonkApiClient({
      baseUrl: config.baseUrl,
      username: config.username,
      password: config.password,
      timeout: config.timeout
    });
  }

  // Subscriber Management
  async createSubscriber(subscriber: Partial<ListMonkSubscriber>): Promise<ListMonkSubscriber> {
    try {
      logger.info(`Creating ListMonk subscriber: ${subscriber.email}`);
      
      // Validate subscriber data
      const validationErrors = ListMonkTransformers.validateSubscriberData(subscriber);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      const requestData = ListMonkTransformers.transformSubscriberToRequest(subscriber);
      
      // Ensure required fields are present
      if (!requestData.email) {
        throw new Error('Email is required for creating subscriber');
      }
      
      const response = await this.apiClient.createSubscriber(requestData as any);
      const createdSubscriber = ListMonkTransformers.transformSubscriberResponse(response);
      
      logger.info(`Successfully created ListMonk subscriber: ${subscriber.email} with ID: ${createdSubscriber.id}`);
      return createdSubscriber;
    } catch (error) {
      logger.error(`Error creating ListMonk subscriber ${subscriber.email}:`, error);
      throw new Error(`Failed to create ListMonk subscriber: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateSubscriber(subscriberId: string, updates: Partial<ListMonkSubscriber>): Promise<ListMonkSubscriber> {
    try {
      logger.info(`Updating ListMonk subscriber: ${subscriberId}`);
      
      const requestData = ListMonkTransformers.transformSubscriberToRequest(updates);
      const response = await this.apiClient.updateSubscriber(subscriberId, requestData);
      const updatedSubscriber = ListMonkTransformers.transformSubscriberResponse(response);
      
      logger.info(`Successfully updated ListMonk subscriber: ${subscriberId}`);
      return updatedSubscriber;
    } catch (error) {
      logger.error(`Error updating ListMonk subscriber ${subscriberId}:`, error);
      throw new Error(`Failed to update ListMonk subscriber: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteSubscriber(subscriberId: string): Promise<void> {
    try {
      logger.info(`Deleting ListMonk subscriber: ${subscriberId}`);
      
      await this.apiClient.deleteSubscriber(subscriberId);
      
      logger.info(`Successfully deleted ListMonk subscriber: ${subscriberId}`);
    } catch (error) {
      logger.error(`Error deleting ListMonk subscriber ${subscriberId}:`, error);
      throw new Error(`Failed to delete ListMonk subscriber: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getSubscriber(subscriberId: string): Promise<ListMonkSubscriber> {
    try {
      logger.info(`Getting ListMonk subscriber: ${subscriberId}`);
      
      const response = await this.apiClient.getSubscriber(subscriberId);
      const subscriber = ListMonkTransformers.transformSubscriberResponse(response);
      
      logger.info(`Successfully retrieved ListMonk subscriber: ${subscriberId}`);
      return subscriber;
    } catch (error) {
      logger.error(`Error getting ListMonk subscriber ${subscriberId}:`, error);
      throw new Error(`Failed to get ListMonk subscriber: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getSubscriberByEmail(email: string): Promise<ListMonkSubscriber | null> {
    try {
      logger.info(`Getting ListMonk subscriber by email: ${email}`);
      
      const response = await this.apiClient.getSubscriberByEmail(email);
      
      if (!response) {
        logger.info(`Subscriber not found with email: ${email}`);
        return null;
      }

      const subscriber = ListMonkTransformers.transformSubscriberResponse(response);
      logger.info(`Successfully retrieved ListMonk subscriber by email: ${email}`);
      
      return subscriber;
    } catch (error) {
      logger.error(`Error getting ListMonk subscriber by email ${email}:`, error);
      
      // Log additional context for debugging
      const configInfo = this.getConfigurationInfo();
      logger.error('ListMonk configuration context:', {
        baseUrl: configInfo.baseUrl,
        username: configInfo.username,
        hasPassword: configInfo.hasPassword,
        email
      });
      
      return null;
    }
  }

  async listSubscribers(params?: { 
    query?: string; 
    list_id?: number | number[]; 
    per_page?: number | string; 
    page?: number;
    order_by?: string;
    order?: 'ASC' | 'DESC';
    subscription_status?: string;
  }): Promise<ListMonkSubscriber[]> {
    try {
      logger.info('Listing ListMonk subscribers', { params });
      
      const responses = await this.apiClient.listSubscribers(params);
      const subscribers = ListMonkTransformers.transformSubscriberResponses(responses);
      
      logger.info(`Successfully retrieved ${subscribers.length} ListMonk subscribers`);
      return subscribers;
    } catch (error) {
      logger.error('Error listing ListMonk subscribers:', error);
      throw new Error(`Failed to list ListMonk subscribers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async addSubscriberToList(subscriberId: string, listId: number): Promise<void> {
    try {
      logger.info(`Adding subscriber ${subscriberId} to ListMonk list: ${listId}`);
      
      await this.apiClient.addSubscriberToList(subscriberId, listId);
      
      logger.info(`Successfully added subscriber ${subscriberId} to ListMonk list: ${listId}`);
    } catch (error) {
      logger.error(`Error adding subscriber ${subscriberId} to ListMonk list ${listId}:`, error);
      throw new Error(`Failed to add subscriber to ListMonk list: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async removeSubscriberFromList(subscriberId: string, listId: number): Promise<void> {
    try {
      logger.info(`Removing subscriber ${subscriberId} from ListMonk list: ${listId}`);
      
      await this.apiClient.removeSubscriberFromList(subscriberId, listId);
      
      logger.info(`Successfully removed subscriber ${subscriberId} from ListMonk list: ${listId}`);
    } catch (error) {
      logger.error(`Error removing subscriber ${subscriberId} from ListMonk list ${listId}:`, error);
      throw new Error(`Failed to remove subscriber from ListMonk list: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // List Management
  async createList(list: Partial<ListMonkList>): Promise<ListMonkList> {
    try {
      logger.info(`Creating ListMonk list: ${list.name}`);
      
      // Validate list data
      const validationErrors = ListMonkTransformers.validateListData(list);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      const requestData = ListMonkTransformers.transformListToRequest(list);
      
      // Ensure required fields are present
      if (!requestData.name) {
        throw new Error('Name is required for creating list');
      }
      
      const response = await this.apiClient.createList(requestData as any);
      const createdList = ListMonkTransformers.transformListResponse(response);
      
      logger.info(`Successfully created ListMonk list: ${list.name} with ID: ${createdList.id}`);
      return createdList;
    } catch (error) {
      logger.error(`Error creating ListMonk list ${list.name}:`, error);
      throw new Error(`Failed to create ListMonk list: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateList(listId: number, updates: Partial<ListMonkList>): Promise<ListMonkList> {
    try {
      logger.info(`Updating ListMonk list: ${listId}`);
      
      const requestData = ListMonkTransformers.transformListToRequest(updates);
      const response = await this.apiClient.updateList(listId, requestData);
      const updatedList = ListMonkTransformers.transformListResponse(response);
      
      logger.info(`Successfully updated ListMonk list: ${listId}`);
      return updatedList;
    } catch (error) {
      logger.error(`Error updating ListMonk list ${listId}:`, error);
      throw new Error(`Failed to update ListMonk list: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteList(listId: number): Promise<void> {
    try {
      logger.info(`Deleting ListMonk list: ${listId}`);
      
      await this.apiClient.deleteList(listId);
      
      logger.info(`Successfully deleted ListMonk list: ${listId}`);
    } catch (error) {
      logger.error(`Error deleting ListMonk list ${listId}:`, error);
      throw new Error(`Failed to delete ListMonk list: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getList(listId: number): Promise<ListMonkList> {
    try {
      logger.info(`Getting ListMonk list: ${listId}`);
      
      const response = await this.apiClient.getList(listId);
      const list = ListMonkTransformers.transformListResponse(response);
      
      logger.info(`Successfully retrieved ListMonk list: ${listId}`);
      return list;
    } catch (error) {
      logger.error(`Error getting ListMonk list ${listId}:`, error);
      throw new Error(`Failed to get ListMonk list: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async listLists(params?: { query?: string; limit?: number; offset?: number }): Promise<ListMonkList[]> {
    try {
      logger.info('Listing ListMonk lists', { params });
      
      const responses = await this.apiClient.listLists(params);
      
      // Log the responses for debugging
      logger.debug('ListMonk API responses', {
        responsesType: typeof responses,
        isArray: Array.isArray(responses),
        length: Array.isArray(responses) ? responses.length : 'not array',
        sampleResponse: Array.isArray(responses) && responses.length > 0 ? responses[0] : 'no responses'
      });
      
      const lists = ListMonkTransformers.transformListResponses(responses);
      
      logger.info(`Successfully retrieved ${lists.length} ListMonk lists`);
      return lists;
    } catch (error) {
      logger.error('Error listing ListMonk lists:', error);
      throw new Error(`Failed to list ListMonk lists: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Campaign Management
  async createCampaign(campaign: Partial<ListMonkCampaign>): Promise<ListMonkCampaign> {
    try {
      logger.info(`Creating ListMonk campaign: ${campaign.name}`);
      
      // Validate campaign data
      const validationErrors = ListMonkTransformers.validateCampaignData(campaign);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      const requestData = ListMonkTransformers.transformCampaignToRequest(campaign);
      
      // Ensure required fields are present
      if (!requestData.name || !requestData.subject || !requestData.body) {
        throw new Error('Name, subject, and body are required for creating campaign');
      }
      
      const response = await this.apiClient.createCampaign(requestData as any);
      const createdCampaign = ListMonkTransformers.transformCampaignResponse(response);
      
      logger.info(`Successfully created ListMonk campaign: ${campaign.name} with ID: ${createdCampaign.id}`);
      return createdCampaign;
    } catch (error) {
      logger.error(`Error creating ListMonk campaign ${campaign.name}:`, error);
      throw new Error(`Failed to create ListMonk campaign: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateCampaign(campaignId: number, updates: Partial<ListMonkCampaign>): Promise<ListMonkCampaign> {
    try {
      logger.info(`Updating ListMonk campaign: ${campaignId}`);
      
      const requestData = ListMonkTransformers.transformCampaignToRequest(updates);
      const response = await this.apiClient.updateCampaign(campaignId, requestData);
      const updatedCampaign = ListMonkTransformers.transformCampaignResponse(response);
      
      logger.info(`Successfully updated ListMonk campaign: ${campaignId}`);
      return updatedCampaign;
    } catch (error) {
      logger.error(`Error updating ListMonk campaign ${campaignId}:`, error);
      throw new Error(`Failed to update ListMonk campaign: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteCampaign(campaignId: number): Promise<void> {
    try {
      logger.info(`Deleting ListMonk campaign: ${campaignId}`);
      
      await this.apiClient.deleteCampaign(campaignId);
      
      logger.info(`Successfully deleted ListMonk campaign: ${campaignId}`);
    } catch (error) {
      logger.error(`Error deleting ListMonk campaign ${campaignId}:`, error);
      throw new Error(`Failed to delete ListMonk campaign: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getCampaign(campaignId: number): Promise<ListMonkCampaign> {
    try {
      logger.info(`Getting ListMonk campaign: ${campaignId}`);
      
      const response = await this.apiClient.getCampaign(campaignId);
      const campaign = ListMonkTransformers.transformCampaignResponse(response);
      
      logger.info(`Successfully retrieved ListMonk campaign: ${campaignId}`);
      return campaign;
    } catch (error) {
      logger.error(`Error getting ListMonk campaign ${campaignId}:`, error);
      throw new Error(`Failed to get ListMonk campaign: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async listCampaigns(params?: { query?: string; status?: string; limit?: number; offset?: number }): Promise<ListMonkCampaign[]> {
    try {
      logger.info('Listing ListMonk campaigns', { params });
      
      const responses = await this.apiClient.listCampaigns(params);
      const campaigns = ListMonkTransformers.transformCampaignResponses(responses);
      
      logger.info(`Successfully retrieved ${campaigns.length} ListMonk campaigns`);
      return campaigns;
    } catch (error) {
      logger.error('Error listing ListMonk campaigns:', error);
      throw new Error(`Failed to list ListMonk campaigns: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async startCampaign(campaignId: number): Promise<void> {
    try {
      logger.info(`Starting ListMonk campaign: ${campaignId}`);
      
      await this.apiClient.startCampaign(campaignId);
      
      logger.info(`Successfully started ListMonk campaign: ${campaignId}`);
    } catch (error) {
      logger.error(`Error starting ListMonk campaign ${campaignId}:`, error);
      throw new Error(`Failed to start ListMonk campaign: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async pauseCampaign(campaignId: number): Promise<void> {
    try {
      logger.info(`Pausing ListMonk campaign: ${campaignId}`);
      
      await this.apiClient.pauseCampaign(campaignId);
      
      logger.info(`Successfully paused ListMonk campaign: ${campaignId}`);
    } catch (error) {
      logger.error(`Error pausing ListMonk campaign ${campaignId}:`, error);
      throw new Error(`Failed to pause ListMonk campaign: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Newsletter-specific methods (for backward compatibility)
  async subscribeToList(listId: string, email: string, subscriber: Partial<ListMonkSubscriber>): Promise<void> {
    try {
      logger.info(`Subscribing ${email} to ListMonk list: ${listId}`);
      
      // Check if subscriber already exists
      let existingSubscriber = await this.getSubscriberByEmail(email);
      
      if (existingSubscriber) {
        // Update existing subscriber to add to the list
        const updatedLists = [...new Set([...existingSubscriber.lists, parseInt(listId)])];
        await this.updateSubscriber(existingSubscriber.id!, { 
          email: existingSubscriber.email,
          lists: updatedLists 
        });
        logger.info(`Updated existing subscriber ${email} to include list: ${listId}`);
      } else {
        // Create new subscriber
        const newSubscriber: Partial<ListMonkSubscriber> = {
          email,
          firstName: subscriber.firstName,
          lastName: subscriber.lastName,
          displayName: subscriber.displayName,
          status: 'enabled',
          lists: [parseInt(listId)],
          attributes: {
            first_name: subscriber.firstName || '',
            last_name: subscriber.lastName || '',
            display_name: subscriber.displayName || '',
            ...subscriber.attributes
          }
        };
        
        await this.createSubscriber(newSubscriber);
        logger.info(`Created new subscriber ${email} and added to list: ${listId}`);
      }
      
      logger.info(`Successfully subscribed ${email} to ListMonk list: ${listId}`);
    } catch (error) {
      logger.error(`Error subscribing ${email} to ListMonk list ${listId}:`, error);
      throw new Error(`Failed to subscribe to newsletter: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async unsubscribeFromList(listId: string, email: string): Promise<void> {
    try {
      logger.info(`Unsubscribing ${email} from ListMonk list: ${listId}`);
      
      const subscriber = await this.getSubscriberByEmail(email);
      
      if (!subscriber) {
        logger.warn(`Subscriber not found for unsubscribe: ${email}`);
        return;
      }

      const updatedLists = subscriber.lists.filter(id => id !== parseInt(listId));
      await this.updateSubscriber(subscriber.id!, { 
        email: subscriber.email,
        lists: updatedLists 
      });
      
      logger.info(`Successfully unsubscribed ${email} from ListMonk list: ${listId}`);
    } catch (error) {
      logger.error(`Error unsubscribing ${email} from ListMonk list ${listId}:`, error);
      throw new Error(`Failed to unsubscribe from newsletter: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getLists(): Promise<ListMonkList[]> {
    try {
      logger.info('Getting ListMonk lists');
      
      const lists = await this.listLists();
      
      logger.info(`Successfully retrieved ${lists.length} ListMonk lists`);
      return lists;
    } catch (error) {
      logger.error('Error getting ListMonk lists:', error);
      throw new Error(`Failed to get lists: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getSubscribers(listId: string): Promise<ListMonkSubscriber[]> {
    try {
      logger.info(`Getting ListMonk subscribers for list: ${listId}`);
      
      const subscribers = await this.listSubscribers({ list_id: parseInt(listId) });
      
      logger.info(`Successfully retrieved ${subscribers.length} ListMonk subscribers for list: ${listId}`);
      return subscribers;
    } catch (error) {
      logger.error(`Error getting ListMonk subscribers for list ${listId}:`, error);
      throw new Error(`Failed to get subscribers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Health Check
  async healthCheck(): Promise<boolean> {
    try {
      logger.info('Performing ListMonk health check');
      
      const isHealthy = await this.apiClient.healthCheck();
      
      if (isHealthy) {
        logger.info('ListMonk health check passed');
      } else {
        logger.warn('ListMonk health check failed');
      }
      
      return isHealthy;
    } catch (error) {
      logger.error('ListMonk health check error:', error);
      return false;
    }
  }

  // Debug method to check configuration
  getConfigurationInfo(): { baseUrl: string; username: string; hasPassword: boolean } {
    return {
      baseUrl: this.apiClient['httpClient']['config'].baseUrl,
      username: this.apiClient['username'],
      hasPassword: !!this.apiClient['password']
    };
  }

  // Utility methods
  async findListByName(name: string): Promise<ListMonkList | null> {
    try {
      logger.info(`Finding ListMonk list by name: ${name}`);
      
      const lists = await this.listLists({ query: name });
      const foundList = lists.find(list => list.name === name);
      
      if (!foundList) {
        logger.info(`List not found with name: ${name}`);
        return null;
      }

      logger.info(`Successfully found ListMonk list by name: ${name}`);
      return foundList;
    } catch (error) {
      logger.error(`Error finding ListMonk list by name ${name}:`, error);
      return null;
    }
  }

  async findCampaignByName(name: string): Promise<ListMonkCampaign | null> {
    try {
      logger.info(`Finding ListMonk campaign by name: ${name}`);
      
      const campaigns = await this.listCampaigns({ query: name });
      const foundCampaign = campaigns.find(campaign => campaign.name === name);
      
      if (!foundCampaign) {
        logger.info(`Campaign not found with name: ${name}`);
        return null;
      }

      logger.info(`Successfully found ListMonk campaign by name: ${name}`);
      return foundCampaign;
    } catch (error) {
      logger.error(`Error finding ListMonk campaign by name ${name}:`, error);
      return null;
    }
  }

  // Queue-based methods for background processing
  async subscribeToListAsync(
    listId: string,
    email: string,
    subscriber?: Partial<ListMonkSubscriber>,
    options?: {
      delay?: number;
      priority?: 'low' | 'normal' | 'high';
      retryOnFailure?: boolean;
      notifyOnFailure?: boolean;
    }
  ): Promise<any> {
    logger.info(`Adding subscribe to list job to queue: ${email} -> ${listId}`);
    return await ListMonkQueueService.subscribeToList(listId, email, subscriber, {
      delay: options?.delay,
      priority: options?.priority === 'high' ? 1 : 0,
      retryOnFailure: options?.retryOnFailure,
      notifyOnFailure: options?.notifyOnFailure
    });
  }

  async unsubscribeFromListAsync(
    listId: string,
    email: string,
    options?: {
      delay?: number;
      priority?: 'low' | 'normal' | 'high';
      retryOnFailure?: boolean;
      notifyOnFailure?: boolean;
    }
  ): Promise<any> {
    logger.info(`Adding unsubscribe from list job to queue: ${email} -> ${listId}`);
    return await ListMonkQueueService.unsubscribeFromList(listId, email, {
      delay: options?.delay,
      priority: options?.priority === 'high' ? 1 : 0,
      retryOnFailure: options?.retryOnFailure,
      notifyOnFailure: options?.notifyOnFailure
    });
  }

  async updateSubscriberAsync(
    subscriberId: string,
    updates: Partial<ListMonkSubscriber>,
    options?: {
      delay?: number;
      priority?: 'low' | 'normal' | 'high';
      retryOnFailure?: boolean;
      notifyOnFailure?: boolean;
    }
  ): Promise<any> {
    logger.info(`Adding update subscriber job to queue: ${subscriberId}`);
    return await ListMonkQueueService.updateSubscriber(subscriberId, updates, {
      delay: options?.delay,
      priority: options?.priority === 'high' ? 1 : 0,
      retryOnFailure: options?.retryOnFailure,
      notifyOnFailure: options?.notifyOnFailure
    });
  }

  async createSubscriberAsync(
    subscriber: Partial<ListMonkSubscriber>,
    options?: {
      delay?: number;
      priority?: 'low' | 'normal' | 'high';
      retryOnFailure?: boolean;
      notifyOnFailure?: boolean;
    }
  ): Promise<any> {
    logger.info(`Adding create subscriber job to queue: ${subscriber.email}`);
    return await ListMonkQueueService.createSubscriber(subscriber, {
      delay: options?.delay,
      priority: options?.priority === 'high' ? 1 : 0,
      retryOnFailure: options?.retryOnFailure,
      notifyOnFailure: options?.notifyOnFailure
    });
  }

  async deleteSubscriberAsync(
    subscriberId: string,
    options?: {
      delay?: number;
      priority?: 'low' | 'normal' | 'high';
      retryOnFailure?: boolean;
      notifyOnFailure?: boolean;
    }
  ): Promise<any> {
    logger.info(`Adding delete subscriber job to queue: ${subscriberId}`);
    return await ListMonkQueueService.deleteSubscriber(subscriberId, {
      delay: options?.delay,
      priority: options?.priority === 'high' ? 1 : 0,
      retryOnFailure: options?.retryOnFailure,
      notifyOnFailure: options?.notifyOnFailure
    });
  }

  async syncAsync(
    data?: any,
    options?: {
      delay?: number;
      priority?: 'low' | 'normal' | 'high';
      retryOnFailure?: boolean;
      notifyOnFailure?: boolean;
    }
  ): Promise<any> {
    logger.info('Adding sync job to queue');
    return await ListMonkQueueService.sync(data, {
      delay: options?.delay,
      priority: options?.priority === 'high' ? 1 : 0,
      retryOnFailure: options?.retryOnFailure,
      notifyOnFailure: options?.notifyOnFailure
    });
  }
}

