import { HttpClient, HttpClientConfig } from './httpClient';
import { logger } from './logger';

export interface ListMonkApiConfig {
  baseUrl: string;
  username: string;
  password: string;
  timeout?: number;
}

export interface ListMonkSubscriberResponse {
  id: number;
  uuid: string;
  email: string;
  name: string;
  attribs: Record<string, any>;
  status: 'enabled' | 'disabled' | 'blocklisted';
  lists: Array<{
    id: number;
    uuid: string;
    name: string;
    type: string;
    optin: string;
    tags: string[];
    description: string;
    created_at: string;
    updated_at: string;
    subscription_status: string;
    subscription_created_at: string;
    subscription_updated_at: string;
    subscription_meta: Record<string, any>;
  }>;
  created_at: string;
  updated_at: string;
}

export interface ListMonkListResponse {
  id: number;
  name: string;
  description: string;
  type: 'public' | 'private' | 'optin' | 'optout';
  optin: 'single' | 'double';
  tags: string[];
  subscriber_count: number;
  created_at: string;
  updated_at: string;
}

export interface ListMonkCampaignResponse {
  id: number;
  name: string;
  subject: string;
  body: string;
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'finished';
  lists: number[];
  template_id?: number;
  created_at: string;
  updated_at: string;
  started_at?: string;
  finished_at?: string;
}

export interface CreateSubscriberRequest {
  email: string;
  name?: string;
  status?: 'enabled' | 'disabled' | 'blocklisted';
  lists: number[];
  attribs?: Record<string, any>;
}

export interface UpdateSubscriberRequest {
  email?: string;
  name?: string;
  status?: 'enabled' | 'disabled' | 'blocklisted';
  lists?: number[];
  attribs?: Record<string, any>;
}

export interface CreateListRequest {
  name: string;
  description?: string;
  type?: 'public' | 'private' | 'optin' | 'optout';
  optin?: 'single' | 'double';
  tags?: string[];
}

export interface UpdateListRequest {
  name?: string;
  description?: string;
  type?: 'public' | 'private' | 'optin' | 'optout';
  optin?: 'single' | 'double';
  tags?: string[];
}

export interface CreateCampaignRequest {
  name: string;
  subject: string;
  body: string;
  lists: number[];
  template_id?: number;
  status?: 'draft' | 'scheduled';
}

export interface UpdateCampaignRequest {
  name?: string;
  subject?: string;
  body?: string;
  lists?: number[];
  template_id?: number;
  status?: 'draft' | 'scheduled' | 'running' | 'paused' | 'finished';
}

export class ListMonkApiClient {
  private httpClient: HttpClient;
  private username: string;
  private password: string;

  constructor(config: ListMonkApiConfig) {
    const httpConfig: HttpClientConfig = {
      baseUrl: config.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `token ${config.username}:${config.password}`
      }
    };

    this.httpClient = new HttpClient(httpConfig);
    this.username = config.username;
    this.password = config.password;
  }

  private validateCredentials(): void {
    if (!this.username || !this.password) {
      throw new Error('ListMonk username and password are required');
    }
  }

  // Subscriber Management
  async createSubscriber(data: CreateSubscriberRequest): Promise<ListMonkSubscriberResponse> {
    try {
      this.validateCredentials();
      logger.info('Creating ListMonk subscriber', { email: data.email });
      
      const response = await this.httpClient.post('/api/subscribers', data);
      
      logger.info('Successfully created ListMonk subscriber', { email: data.email, id: response.data.data?.id });
      return response.data.data;
    } catch (error) {
      logger.error('Failed to create ListMonk subscriber', { email: data.email, error });
      throw new Error(`Failed to create subscriber: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateSubscriber(subscriberId: string, data: UpdateSubscriberRequest): Promise<ListMonkSubscriberResponse> {
    try {
      this.validateCredentials();
      logger.info('Updating ListMonk subscriber', { id: subscriberId });
      
      const response = await this.httpClient.put(`/api/subscribers/${subscriberId}`, data);
      
      logger.info('Successfully updated ListMonk subscriber', { id: subscriberId });
      return response.data.data;
    } catch (error) {
      logger.error('Failed to update ListMonk subscriber', { id: subscriberId, error });
      throw new Error(`Failed to update subscriber: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteSubscriber(subscriberId: string): Promise<void> {
    try {
      this.validateCredentials();
      logger.info('Deleting ListMonk subscriber', { id: subscriberId });
      
      await this.httpClient.delete(`/api/subscribers/${subscriberId}`);
      
      logger.info('Successfully deleted ListMonk subscriber', { id: subscriberId });
    } catch (error) {
      logger.error('Failed to delete ListMonk subscriber', { id: subscriberId, error });
      throw new Error(`Failed to delete subscriber: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getSubscriber(subscriberId: string): Promise<ListMonkSubscriberResponse> {
    try {
      this.validateCredentials();
      logger.info('Getting ListMonk subscriber', { id: subscriberId });
      
      const response = await this.httpClient.get(`/api/subscribers/${subscriberId}`);
      
      logger.info('Successfully retrieved ListMonk subscriber', { id: subscriberId });
      return response.data.data;
    } catch (error) {
      logger.error('Failed to get ListMonk subscriber', { id: subscriberId, error });
      throw new Error(`Failed to get subscriber: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getSubscriberByEmail(email: string): Promise<ListMonkSubscriberResponse | null> {
    try {
      this.validateCredentials();
      logger.info('Getting ListMonk subscriber by email', { email });
      
      // First, try using SQL query to find the subscriber directly
      logger.debug('Trying SQL query search for email', { email });
      try {
        const queryResponse = await this.httpClient.get('/api/subscribers', { 
          query: `email = '${email}'`
        });
        
        // Handle different response structures
        let subscribers: any[] = [];
        if (queryResponse.data?.data) {
          if (Array.isArray(queryResponse.data.data)) {
            subscribers = queryResponse.data.data;
          } else if (queryResponse.data.data.results && Array.isArray(queryResponse.data.data.results)) {
            subscribers = queryResponse.data.data.results;
          } else if (queryResponse.data.data.data && Array.isArray(queryResponse.data.data.data)) {
            subscribers = queryResponse.data.data.data;
          } else {
            logger.warn('Unexpected ListMonk subscribers response structure', { data: queryResponse.data });
            subscribers = [];
          }
        }
        
        if (subscribers.length > 0) {
          const subscriber = subscribers.find((sub: any) => sub.email === email);
          if (subscriber) {
            logger.info('Successfully retrieved ListMonk subscriber by email using SQL query', { email, id: subscriber.id });
            return subscriber;
          }
        }
      } catch (queryError) {
        logger.debug('SQL query search failed, falling back to pagination', { email, error: queryError });
      }
      
      // Fallback: Use pagination to search through all subscribers
      logger.debug('Using pagination to search for subscriber', { email });
      let page = 1;
      const perPage = 100; // Use larger page size
      const maxPages = 50; // Safety limit to prevent infinite loops
      
      while (page <= maxPages) {
        logger.debug(`Searching subscribers page ${page}`, { email });
        
        const response = await this.httpClient.get('/api/subscribers', { 
          page: page.toString(),
          per_page: perPage.toString()
        });
        
        // Handle different response structures
        let subscribers: any[] = [];
        if (response.data?.data) {
          if (Array.isArray(response.data.data)) {
            subscribers = response.data.data;
          } else if (response.data.data.results && Array.isArray(response.data.data.results)) {
            subscribers = response.data.data.results;
          } else if (response.data.data.data && Array.isArray(response.data.data.data)) {
            subscribers = response.data.data.data;
          } else {
            logger.warn('Unexpected ListMonk subscribers response structure', { data: response.data });
            subscribers = [];
          }
        }
        
                 // Handle different response structures
         let pageSubscribers: any[] = [];
         if (response.data?.data) {
           if (Array.isArray(response.data.data)) {
             pageSubscribers = response.data.data;
           } else if (response.data.data.results && Array.isArray(response.data.data.results)) {
             pageSubscribers = response.data.data.results;
           } else if (response.data.data.data && Array.isArray(response.data.data.data)) {
             pageSubscribers = response.data.data.data;
           } else {
             logger.warn('Unexpected ListMonk subscribers response structure', { data: response.data });
             pageSubscribers = [];
           }
         }
         
         // If no subscribers returned, we've reached the end
         if (pageSubscribers.length === 0) {
           logger.debug('No more subscribers found, reached end of list', { email, page });
           break;
         }
         
         // Search for the email in this page
         const subscriber = pageSubscribers.find((sub: any) => sub.email === email);
         if (subscriber) {
           logger.info('Successfully retrieved ListMonk subscriber by email', { email, id: subscriber.id, page });
           return subscriber;
         }
         
         // Move to next page
         page++;
       }
      
      logger.info('Subscriber not found by email after searching all pages', { email, pagesSearched: page });
      return null;
    } catch (error) {
      logger.error('Failed to get ListMonk subscriber by email', { email, error });
      
      // Provide more detailed error information for debugging
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          logger.error('Network error when connecting to ListMonk', { email, error: error.message });
        } else if (error.message.includes('timeout')) {
          logger.error('Request timeout when connecting to ListMonk', { email, error: error.message });
        } else if (error.message.includes('401') || error.message.includes('403')) {
          logger.error('Authentication error when connecting to ListMonk', { email, error: error.message });
        } else if (error.message.includes('500')) {
          logger.error('Server error from ListMonk', { email, error: error.message });
        }
      }
      
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
  }): Promise<ListMonkSubscriberResponse[]> {
    try {
      this.validateCredentials();
      logger.info('Listing ListMonk subscribers', { params });
      
      // Convert parameters to strings for HTTP client
      const stringParams: Record<string, string> = {};
      if (params?.query) stringParams.query = params.query;
      if (params?.list_id) {
        if (Array.isArray(params.list_id)) {
          // Multiple list IDs
          params.list_id.forEach((id, index) => {
            stringParams[`list_id`] = id.toString();
          });
        } else {
          stringParams.list_id = params.list_id.toString();
        }
      }
      if (params?.per_page) stringParams.per_page = params.per_page.toString();
      if (params?.page) stringParams.page = params.page.toString();
      if (params?.order_by) stringParams.order_by = params.order_by;
      if (params?.order) stringParams.order = params.order;
      if (params?.subscription_status) stringParams.subscription_status = params.subscription_status;
      
      const response = await this.httpClient.get('/api/subscribers', stringParams);
      
      // Log response structure for debugging
      logger.debug('ListMonk subscribers response structure', {
        hasData: !!response.data,
        hasDataData: !!response.data?.data,
        dataType: typeof response.data?.data,
        isArray: Array.isArray(response.data?.data),
        dataLength: Array.isArray(response.data?.data) ? response.data.data.length : 'not array',
        responseKeys: response.data ? Object.keys(response.data) : []
      });
      
      // Handle different response structures
      let subscribers: any[] = [];
      if (response.data?.data) {
        if (Array.isArray(response.data.data)) {
          subscribers = response.data.data;
        } else if (response.data.data.results && Array.isArray(response.data.data.results)) {
          subscribers = response.data.data.results;
        } else if (response.data.data.data && Array.isArray(response.data.data.data)) {
          subscribers = response.data.data.data;
        } else {
          logger.warn('Unexpected ListMonk subscribers response structure', { data: response.data });
          subscribers = [];
        }
      }
      
      logger.info('Successfully retrieved ListMonk subscribers', { count: subscribers.length });
      return subscribers;
    } catch (error) {
      logger.error('Failed to list ListMonk subscribers', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        errorObject: error,
        params 
      });
      throw new Error(`Failed to list subscribers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async addSubscriberToList(subscriberId: string, listId: number): Promise<void> {
    try {
      this.validateCredentials();
      logger.info('Adding subscriber to ListMonk list', { subscriberId, listId });
      
      const subscriber = await this.getSubscriber(subscriberId);
      const currentListIds = subscriber.lists.map(list => list.id);
      const updatedListIds = [...new Set([...currentListIds, listId])];
      
      await this.updateSubscriber(subscriberId, { 
        email: subscriber.email,
        lists: updatedListIds 
      });
      
      logger.info('Successfully added subscriber to ListMonk list', { subscriberId, listId });
    } catch (error) {
      logger.error('Failed to add subscriber to ListMonk list', { subscriberId, listId, error });
      throw new Error(`Failed to add subscriber to list: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async removeSubscriberFromList(subscriberId: string, listId: number): Promise<void> {
    try {
      this.validateCredentials();
      logger.info('Removing subscriber from ListMonk list', { subscriberId, listId });
      
      const subscriber = await this.getSubscriber(subscriberId);
      const updatedListIds = subscriber.lists.map(list => list.id).filter(id => id !== listId);
      
      await this.updateSubscriber(subscriberId, { 
        email: subscriber.email,
        lists: updatedListIds 
      });
      
      logger.info('Successfully removed subscriber from ListMonk list', { subscriberId, listId });
    } catch (error) {
      logger.error('Failed to remove subscriber from ListMonk list', { subscriberId, listId, error });
      throw new Error(`Failed to remove subscriber from list: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // List Management
  async createList(data: CreateListRequest): Promise<ListMonkListResponse> {
    try {
      this.validateCredentials();
      logger.info('Creating ListMonk list', { name: data.name });
      
      const response = await this.httpClient.post('/api/lists', data);
      
      logger.info('Successfully created ListMonk list', { name: data.name, id: response.data.data?.id });
      return response.data.data;
    } catch (error) {
      logger.error('Failed to create ListMonk list', { name: data.name, error });
      throw new Error(`Failed to create list: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateList(listId: number, data: UpdateListRequest): Promise<ListMonkListResponse> {
    try {
      this.validateCredentials();
      logger.info('Updating ListMonk list', { id: listId });
      
      const response = await this.httpClient.put(`/api/lists/${listId}`, data);
      
      logger.info('Successfully updated ListMonk list', { id: listId });
      return response.data.data;
    } catch (error) {
      logger.error('Failed to update ListMonk list', { id: listId, error });
      throw new Error(`Failed to update list: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteList(listId: number): Promise<void> {
    try {
      this.validateCredentials();
      logger.info('Deleting ListMonk list', { id: listId });
      
      await this.httpClient.delete(`/api/lists/${listId}`);
      
      logger.info('Successfully deleted ListMonk list', { id: listId });
    } catch (error) {
      logger.error('Failed to delete ListMonk list', { id: listId, error });
      throw new Error(`Failed to delete list: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getList(listId: number): Promise<ListMonkListResponse> {
    try {
      this.validateCredentials();
      logger.info('Getting ListMonk list', { id: listId });
      
      const response = await this.httpClient.get(`/api/lists/${listId}`);
      
      logger.info('Successfully retrieved ListMonk list', { id: listId });
      return response.data.data;
    } catch (error) {
      logger.error('Failed to get ListMonk list', { id: listId, error });
      throw new Error(`Failed to get list: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async listLists(params?: { query?: string; limit?: number; offset?: number }): Promise<ListMonkListResponse[]> {
    try {
      this.validateCredentials();
      logger.info('Listing ListMonk lists', { params });
      
      // Convert number parameters to strings for HTTP client
      const stringParams: Record<string, string> = {};
      if (params?.query) stringParams.query = params.query;
      if (params?.limit) stringParams.limit = params.limit.toString();
      if (params?.offset) stringParams.offset = params.offset.toString();
      
      const response = await this.httpClient.get('/api/lists', stringParams);
      
      // Log response structure for debugging
      logger.debug('ListMonk lists response structure', {
        hasData: !!response.data,
        hasDataData: !!response.data?.data,
        dataType: typeof response.data?.data,
        isArray: Array.isArray(response.data?.data),
        dataLength: Array.isArray(response.data?.data) ? response.data.data.length : 'not array',
        responseKeys: response.data ? Object.keys(response.data) : []
      });
      
      // Handle different response structures
      let lists: any[] = [];
      if (response.data?.data) {
        if (Array.isArray(response.data.data)) {
          lists = response.data.data;
        } else if (response.data.data.results && Array.isArray(response.data.data.results)) {
          lists = response.data.data.results;
        } else if (response.data.data.data && Array.isArray(response.data.data.data)) {
          lists = response.data.data.data;
        } else {
          logger.warn('Unexpected ListMonk lists response structure', { data: response.data });
          lists = [];
        }
      }
      
      logger.info('Successfully retrieved ListMonk lists', { count: lists.length });
      return lists;
    } catch (error) {
      logger.error('Failed to list ListMonk lists', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        errorObject: error,
        params 
      });
      throw new Error(`Failed to list lists: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Campaign Management
  async createCampaign(data: CreateCampaignRequest): Promise<ListMonkCampaignResponse> {
    try {
      this.validateCredentials();
      logger.info('Creating ListMonk campaign', { name: data.name });
      
      const response = await this.httpClient.post('/api/campaigns', data);
      
      logger.info('Successfully created ListMonk campaign', { name: data.name, id: response.data.data?.id });
      return response.data.data;
    } catch (error) {
      logger.error('Failed to create ListMonk campaign', { name: data.name, error });
      throw new Error(`Failed to create campaign: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateCampaign(campaignId: number, data: UpdateCampaignRequest): Promise<ListMonkCampaignResponse> {
    try {
      this.validateCredentials();
      logger.info('Updating ListMonk campaign', { id: campaignId });
      
      const response = await this.httpClient.put(`/api/campaigns/${campaignId}`, data);
      
      logger.info('Successfully updated ListMonk campaign', { id: campaignId });
      return response.data.data;
    } catch (error) {
      logger.error('Failed to update ListMonk campaign', { id: campaignId, error });
      throw new Error(`Failed to update campaign: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteCampaign(campaignId: number): Promise<void> {
    try {
      this.validateCredentials();
      logger.info('Deleting ListMonk campaign', { id: campaignId });
      
      await this.httpClient.delete(`/api/campaigns/${campaignId}`);
      
      logger.info('Successfully deleted ListMonk campaign', { id: campaignId });
    } catch (error) {
      logger.error('Failed to delete ListMonk campaign', { id: campaignId, error });
      throw new Error(`Failed to delete campaign: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getCampaign(campaignId: number): Promise<ListMonkCampaignResponse> {
    try {
      this.validateCredentials();
      logger.info('Getting ListMonk campaign', { id: campaignId });
      
      const response = await this.httpClient.get(`/api/campaigns/${campaignId}`);
      
      logger.info('Successfully retrieved ListMonk campaign', { id: campaignId });
      return response.data.data;
    } catch (error) {
      logger.error('Failed to get ListMonk campaign', { id: campaignId, error });
      throw new Error(`Failed to get campaign: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async listCampaigns(params?: { query?: string; status?: string; limit?: number; offset?: number }): Promise<ListMonkCampaignResponse[]> {
    try {
      this.validateCredentials();
      logger.info('Listing ListMonk campaigns', { params });
      
      // Convert number parameters to strings for HTTP client
      const stringParams: Record<string, string> = {};
      if (params?.query) stringParams.query = params.query;
      if (params?.status) stringParams.status = params.status;
      if (params?.limit) stringParams.limit = params.limit.toString();
      if (params?.offset) stringParams.offset = params.offset.toString();
      
      const response = await this.httpClient.get('/api/campaigns', stringParams);
      
      logger.info('Successfully retrieved ListMonk campaigns', { count: response.data.data?.length || 0 });
      return response.data.data || [];
    } catch (error) {
      logger.error('Failed to list ListMonk campaigns', { error });
      throw new Error(`Failed to list campaigns: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async startCampaign(campaignId: number): Promise<void> {
    try {
      this.validateCredentials();
      logger.info('Starting ListMonk campaign', { id: campaignId });
      
      await this.httpClient.post(`/api/campaigns/${campaignId}/start`, {});
      
      logger.info('Successfully started ListMonk campaign', { id: campaignId });
    } catch (error) {
      logger.error('Failed to start ListMonk campaign', { id: campaignId, error });
      throw new Error(`Failed to start campaign: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async pauseCampaign(campaignId: number): Promise<void> {
    try {
      this.validateCredentials();
      logger.info('Pausing ListMonk campaign', { id: campaignId });
      
      await this.httpClient.post(`/api/campaigns/${campaignId}/pause`, {});
      
      logger.info('Successfully paused ListMonk campaign', { id: campaignId });
    } catch (error) {
      logger.error('Failed to pause ListMonk campaign', { id: campaignId, error });
      throw new Error(`Failed to pause campaign: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Health Check
  async healthCheck(): Promise<boolean> {
    try {
      logger.info('Performing ListMonk health check');
      
      // Try to get lists endpoint as a health check
      await this.httpClient.get('/api/lists', { limit: '1' });
      
      logger.info('ListMonk health check passed');
      return true;
    } catch (error) {
      logger.error('ListMonk health check failed:', error);
      return false;
    }
  }
}
