import { logger } from './logger';

export interface HttpClientConfig {
  baseUrl: string;
  token?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export class HttpClient {
  private config: HttpClientConfig;

  constructor(config: HttpClientConfig) {
    this.config = {
      timeout: 30000, // 30 seconds default
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      ...config
    };

    // Add authorization header if token is provided
    if (this.config.token) {
      this.config.headers = {
        ...this.config.headers,
        'Authorization': `Bearer ${this.config.token}`
      };
    }
  }

  async get<T = any>(endpoint: string, params?: Record<string, string>, customHeaders?: Record<string, string>): Promise<HttpResponse<T>> {
    const url = this.buildUrl(endpoint, params);
    logger.debug(`Making GET request to: ${url}`);

    const headers = { ...this.config.headers, ...customHeaders };

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(this.config.timeout!)
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorBody = await response.text();
          if (errorBody) {
            errorMessage += ` - ${errorBody}`;
          }
        } catch (e) {
          // Ignore error body parsing errors
        }
        
        throw new Error(errorMessage);
      }

      let data: T;
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else if (contentType.includes('text/html') || contentType.includes('text/plain')) {
        data = await response.text() as T;
      } else {
        data = await response.text() as T;
      }
      
      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: this.parseHeaders(response.headers)
      };
    } catch (error) {
      logger.error(`GET request failed for ${url}:`, error);
      throw error;
    }
  }

  async post<T = any>(endpoint: string, data?: any, customHeaders?: Record<string, string>): Promise<HttpResponse<T>> {
    const url = this.buildUrl(endpoint);
    logger.debug(`Making POST request to: ${url}`);

    const headers = { ...this.config.headers, ...customHeaders };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: data ? JSON.stringify(data) : undefined,
        signal: AbortSignal.timeout(this.config.timeout!)
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorBody = await response.text();
          if (errorBody) {
            errorMessage += ` - ${errorBody}`;
          }
        } catch (e) {
          // Ignore error body parsing errors
        }
        
        throw new Error(errorMessage);
      }

      let responseData: T;
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        responseData = await response.json();
      } else if (contentType.includes('text/html') || contentType.includes('text/plain')) {
        responseData = await response.text() as T;
      } else {
        responseData = await response.text() as T;
      }
      
      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: this.parseHeaders(response.headers)
      };
    } catch (error) {
      logger.error(`POST request failed for ${url}:`, error);
      throw error;
    }
  }

  async put<T = any>(endpoint: string, data?: any, customHeaders?: Record<string, string>): Promise<HttpResponse<T>> {
    const url = this.buildUrl(endpoint);
    logger.debug(`Making PUT request to: ${url}`);

    const headers = { ...this.config.headers, ...customHeaders };

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: data ? JSON.stringify(data) : undefined,
        signal: AbortSignal.timeout(this.config.timeout!)
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorBody = await response.text();
          if (errorBody) {
            errorMessage += ` - ${errorBody}`;
          }
        } catch (e) {
          // Ignore error body parsing errors
        }
        
        throw new Error(errorMessage);
      }

      let responseData: T;
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        responseData = await response.json();
      } else if (contentType.includes('text/html') || contentType.includes('text/plain')) {
        responseData = await response.text() as T;
      } else {
        responseData = await response.text() as T;
      }
      
      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: this.parseHeaders(response.headers)
      };
    } catch (error) {
      logger.error(`PUT request failed for ${url}:`, error);
      throw error;
    }
  }

  async delete<T = any>(endpoint: string, customHeaders?: Record<string, string>): Promise<HttpResponse<T>> {
    const url = this.buildUrl(endpoint);
    logger.debug(`Making DELETE request to: ${url}`);

    const headers = { ...this.config.headers, ...customHeaders };

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers,
        signal: AbortSignal.timeout(this.config.timeout!)
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorBody = await response.text();
          if (errorBody) {
            errorMessage += ` - ${errorBody}`;
          }
        } catch (e) {
          // Ignore error body parsing errors
        }
        
        throw new Error(errorMessage);
      }

      // Handle empty responses (common with DELETE operations)
      let data: T;
      try {
        data = await response.json();
      } catch (e) {
        // If no JSON response, create empty data
        data = {} as T;
      }
      
      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: this.parseHeaders(response.headers)
      };
    } catch (error) {
      logger.error(`DELETE request failed for ${url}:`, error);
      throw error;
    }
  }

  // WebDAV MKCOL method for creating directories
  async mkcol<T = any>(endpoint: string, customHeaders?: Record<string, string>, data?: string): Promise<HttpResponse<T>> {
    const url = this.buildUrl(endpoint);
    logger.debug(`Making MKCOL request to: ${url}`);

    const headers = { ...this.config.headers, ...customHeaders };

    try {
      const requestOptions: RequestInit = {
        method: 'MKCOL',
        headers,
        signal: AbortSignal.timeout(this.config.timeout!)
      };

      // Add body if data is provided (for calendar creation)
      if (data) {
        requestOptions.body = data;
      }

      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorBody = await response.text();
          if (errorBody) {
            errorMessage += ` - ${errorBody}`;
          }
        } catch (e) {
          // Ignore error body parsing errors
        }
        
        throw new Error(errorMessage);
      }

      // MKCOL typically returns no content
      let responseData: T;
      try {
        responseData = await response.json();
      } catch (e) {
        // If no JSON response, create empty data
        responseData = {} as T;
      }
      
      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: this.parseHeaders(response.headers)
      };
    } catch (error) {
      logger.error(`MKCOL request failed for ${url}:`, error);
      throw error;
    }
  }

  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(endpoint, this.config.baseUrl);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    
    return url.toString();
  }

  private parseHeaders(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }
}
