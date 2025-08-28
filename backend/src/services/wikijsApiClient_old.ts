import { HttpClient, HttpResponse } from '@/utils/httpClient';
import { logger } from '@/utils/logger';

// Wiki.js GraphQL types
export interface WikiJsPage {
  id: string;
  path: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  locale: string;
  isPublished: boolean;
  isPrivate: boolean;
  privateNS?: string;
  tags: string[];
  description?: string;
  isHomePage: boolean;
  isTemplate: boolean;
  templateId?: string;
  scriptCss?: string;
  scriptJs?: string;
  metadata?: Record<string, any>;
}

export interface WikiJsUser {
  id: string;
  name: string;
  email: string;
  providerKey: string;
  isActive: boolean;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  groups: WikiJsGroup[];
}

export interface WikiJsGroup {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WikiJsPageInput {
  path: string;
  title: string;
  content: string;
  description: string;
  editor: string;
  isPublished: boolean;
  isPrivate: boolean;
  locale: string;
  tags: string[];
}

export interface WikiJsUserInput {
  email: string;
  name: string;
  passwordRaw: string;
  providerKey: string;
  groups?: number[];
  mustChangePassword?: boolean;
  sendWelcomeEmail?: boolean;
}

export interface WikiJsGroupInput {
  name: string;
  description?: string;
  permissions: string[];
}

export interface WikiJsResponseResult {
  succeeded: boolean;
  errorCode: number;
  slug: string;
  message?: string;
}

export interface WikiJsGraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
}

export class WikiJsApiClient {
  private httpClient: HttpClient;
  private graphqlEndpoint: string;

  constructor(config: { baseUrl: string; token: string }) {
    this.httpClient = new HttpClient({
      baseUrl: config.baseUrl,
      token: config.token,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    this.graphqlEndpoint = '/graphql';
  }

  private async executeGraphQL<T>(query: string, variables?: Record<string, any>): Promise<T> {
    try {
      const response = await this.httpClient.post<WikiJsGraphQLResponse<T>>(
        this.graphqlEndpoint,
        {
          query,
          variables
        }
      );

      if (response.data.errors && response.data.errors.length > 0) {
        const errorMessage = response.data.errors.map(e => e.message).join('; ');
        throw new Error(`GraphQL errors: ${errorMessage}`);
      }

      if (!response.data.data) {
        throw new Error('No data returned from GraphQL query');
      }

      return response.data.data;
    } catch (error) {
      logger.error('GraphQL execution failed:', error);
      throw error;
    }
  }

  // Page operations
  async getPages(orderBy: string = 'TITLE'): Promise<WikiJsPage[]> {
    const query = `
      query GetPages($orderBy: PageOrderBy) {
        pages {
          list(orderBy: $orderBy) {
            id
            path
            title
            description
            contentType
            isPublished
            isPrivate
            privateNS
            createdAt
            updatedAt
            locale
            tags
          }
        }
      }
    `;

    const result = await this.executeGraphQL<{ pages: { list: WikiJsPage[] } }>(query, { orderBy });
    return result.pages.list;
  }

  async getPage(id: string): Promise<WikiJsPage> {
    const query = `
      query GetPage($id: Int!) {
        pages {
          single(id: $id) {
            id
            path
            title
            description
            content
            contentType
            isPublished
            isPrivate
            privateNS
            createdAt
            updatedAt
            locale
            tags
            hash
            publishStartDate
            publishEndDate
            render
            toc
          }
        }
      }
    `;

    const result = await this.executeGraphQL<{ pages: { single: WikiJsPage } }>(query, { id: parseInt(id) });
    return result.pages.single;
  }

  async getPageByPath(path: string): Promise<WikiJsPage | null> {
    try {
      const pages = await this.getPages();
      return pages.find(page => page.path === path) || null;
    } catch (error) {
      logger.error(`Failed to get page by path ${path}:`, error);
      return null;
    }
  }

  async createPage(pageData: WikiJsPageInput): Promise<WikiJsPage> {
    const query = `
      mutation CreatePage($pageData: PageInput!) {
        pages {
          create(page: $pageData) {
            responseResult {
              succeeded
              errorCode
              slug
              message
            }
            page {
              id
              path
              title
              content
              createdAt
              updatedAt
              locale
              isPublished
              isPrivate
              privateNS
              tags
              description
              isHomePage
              isTemplate
              templateId
              scriptCss
              scriptJs
              metadata
            }
          }
        }
      }
    `;

    const result = await this.executeGraphQL<{
      pages: {
        create: {
          responseResult: WikiJsResponseResult;
          page: WikiJsPage;
        };
      };
    }>(query, { pageData });

    if (!result.pages.create.responseResult.succeeded) {
      throw new Error(`Failed to create page: ${result.pages.create.responseResult.message || 'Unknown error'}`);
    }

    return result.pages.create.page;
  }

  async updatePage(id: string, pageData: Partial<WikiJsPageInput>): Promise<WikiJsPage> {
    const query = `
      mutation UpdatePage($id: Int!, $pageData: PageInput!) {
        pages {
          update(id: $id, page: $pageData) {
            responseResult {
              succeeded
              errorCode
              slug
              message
            }
            page {
              id
              path
              title
              content
              createdAt
              updatedAt
              locale
              isPublished
              isPrivate
              privateNS
              tags
              description
              isHomePage
              isTemplate
              templateId
              scriptCss
              scriptJs
              metadata
            }
          }
        }
      }
    `;

    const result = await this.executeGraphQL<{
      pages: {
        update: {
          responseResult: WikiJsResponseResult;
          page: WikiJsPage;
        };
      };
    }>(query, { id: parseInt(id), pageData });

    if (!result.pages.update.responseResult.succeeded) {
      throw new Error(`Failed to update page: ${result.pages.update.responseResult.message || 'Unknown error'}`);
    }

    return result.pages.update.page;
  }

  async deletePage(id: string): Promise<void> {
    const query = `
      mutation DeletePage($id: Int!) {
        pages {
          delete(id: $id) {
            responseResult {
              succeeded
              errorCode
              slug
              message
            }
          }
        }
      }
    `;

    const result = await this.executeGraphQL<{
      pages: {
        delete: {
          responseResult: WikiJsResponseResult;
        };
      };
    }>(query, { id: parseInt(id) });

    if (!result.pages.delete.responseResult.succeeded) {
      throw new Error(`Failed to delete page: ${result.pages.delete.responseResult.message || 'Unknown error'}`);
    }
  }

  // User operations
  async getUsers(): Promise<WikiJsUser[]> {
    const query = `
      query GetUsers {
        users {
          list {
            id
            name
            email
            providerKey
            isActive
            isSystem
            createdAt
            updatedAt
            groups {
              id
              name
              description
              permissions
              createdAt
              updatedAt
            }
          }
        }
      }
    `;

    const result = await this.executeGraphQL<{ users: { list: WikiJsUser[] } }>(query);
    return result.users.list;
  }

  async searchUsers(query: string): Promise<WikiJsUser[]> {
    const graphqlQuery = `
      query SearchUsers($query: String!) {
        users {
          search(query: $query) {
            id
            name
            email
            providerKey
            isActive
            isSystem
            createdAt
            updatedAt
            groups {
              id
              name
              description
              permissions
              createdAt
              updatedAt
            }
          }
        }
      }
    `;

    const result = await this.executeGraphQL<{ users: { search: WikiJsUser[] } }>(graphqlQuery, { query });
    return result.users.search;
  }

  async createUser(userData: WikiJsUserInput): Promise<WikiJsUser> {
    const query = `
      mutation CreateUser($userData: UserInput!) {
        users {
          create(user: $userData) {
            responseResult {
              succeeded
              errorCode
              slug
              message
            }
            user {
              id
              name
              email
              providerKey
              isActive
              isSystem
              createdAt
              updatedAt
              groups {
                id
                name
                description
                permissions
                createdAt
                updatedAt
              }
            }
          }
        }
      }
    `;

    const result = await this.executeGraphQL<{
      users: {
        create: {
          responseResult: WikiJsResponseResult;
          user: WikiJsUser;
        };
      };
    }>(query, { userData });

    if (!result.users.create.responseResult.succeeded) {
      throw new Error(`Failed to create user: ${result.users.create.responseResult.message || 'Unknown error'}`);
    }

    return result.users.create.user;
  }

  // Group operations
  async getGroups(): Promise<WikiJsGroup[]> {
    const query = `
      query GetGroups {
        groups {
          list {
            id
            name
            description
            permissions
            createdAt
            updatedAt
          }
        }
      }
    `;

    const result = await this.executeGraphQL<{ groups: { list: WikiJsGroup[] } }>(query);
    return result.groups.list;
  }

  async createGroup(groupData: WikiJsGroupInput): Promise<WikiJsGroup> {
    const query = `
      mutation CreateGroup($groupData: GroupInput!) {
        groups {
          create(group: $groupData) {
            responseResult {
              succeeded
              errorCode
              slug
              message
            }
            group {
              id
              name
              description
              permissions
              createdAt
              updatedAt
            }
          }
        }
      }
    `;

    const result = await this.executeGraphQL<{
      groups: {
        create: {
          responseResult: WikiJsResponseResult;
          group: WikiJsGroup;
        };
      };
    }>(query, { groupData });

    if (!result.groups.create.responseResult.succeeded) {
      throw new Error(`Failed to create group: ${result.groups.create.responseResult.message || 'Unknown error'}`);
    }

    return result.groups.create.group;
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.getPages();
      return true;
    } catch (error) {
      logger.error('Wiki.js health check failed:', error);
      return false;
    }
  }

  /**
   * Get API client configuration
   */
  getConfig(): { baseUrl: string; token: string } {
    return {
      baseUrl: this.httpClient['config']['baseUrl'],
      token: this.httpClient['config']['token'] || ''
    };
  }
}
