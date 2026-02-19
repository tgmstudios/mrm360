import crypto from 'crypto';
import https from 'https';

export interface PritunlConfig {
  baseUrl: string;
  apiToken: string;
  apiSecret: string;
}

export interface PritunlUser {
  id?: string;
  organization_id: string;
  name: string;
  email: string;
  groups?: string[];
  disabled?: boolean;
  pin?: string;
}

export interface PritunlOrganization {
  id: string;
  name: string;
}

export interface PritunlServer {
  id: string;
  name: string;
  organizations: string[];
}

export class PritunlService {
  private baseUrl: string;
  private apiToken: string;
  private apiSecret: string;

  constructor(config: PritunlConfig) {
    this.baseUrl = config.baseUrl;
    this.apiToken = config.apiToken;
    this.apiSecret = config.apiSecret;
  }

  private generateAuthHeaders(method: string, path: string): Record<string, string> {
    const authTimestamp = Math.floor(Date.now() / 1000).toString();
    const authNonce = crypto.randomBytes(16).toString('hex');
    
    // Pritunl authentication string format
    const authString = [
      this.apiToken,
      authTimestamp,
      authNonce,
      method,
      path,
    ].join('&');

    // Generate HMAC-SHA256 signature
    const authSignature = crypto
      .createHmac('sha256', this.apiSecret)
      .update(authString)
      .digest('base64');

    return {
      'Auth-Token': this.apiToken,
      'Auth-Timestamp': authTimestamp,
      'Auth-Nonce': authNonce,
      'Auth-Signature': authSignature,
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(method: string, path: string, body?: any): Promise<T> {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const headers = this.generateAuthHeaders(method, path);

      const options = {
        method,
        headers,
        // Allow self-signed certificates (for development)
        rejectUnauthorized: false,
      };

      const req = https.request(url, options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const parsed = data ? JSON.parse(data) : null;
              resolve(parsed as T);
            } catch (err) {
              resolve(data as any);
            }
          } else {
            reject(new Error(`Pritunl API error: ${res.statusCode} - ${data}`));
          }
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      if (body) {
        req.write(JSON.stringify(body));
      }

      req.end();
    });
  }

  // Organization methods
  async listOrganizations(): Promise<PritunlOrganization[]> {
    return this.request<PritunlOrganization[]>('GET', '/organization');
  }

  async getOrganization(orgId: string): Promise<PritunlOrganization> {
    return this.request<PritunlOrganization>('GET', `/organization/${orgId}`);
  }

  // User methods
  async listUsers(organizationId: string): Promise<PritunlUser[]> {
    return this.request<PritunlUser[]>('GET', `/user/${organizationId}`);
  }

  async createUser(user: PritunlUser): Promise<PritunlUser> {
    // Pritunl returns an array with the created user
    const response = await this.request<PritunlUser[]>('POST', `/user/${user.organization_id}`, user);
    // Return the first user from the array
    return response[0];
  }

  async getUser(organizationId: string, userId: string): Promise<PritunlUser> {
    return this.request<PritunlUser>('GET', `/user/${organizationId}/${userId}`);
  }

  async updateUser(organizationId: string, userId: string, updates: Partial<PritunlUser>): Promise<PritunlUser> {
    return this.request<PritunlUser>('PUT', `/user/${organizationId}/${userId}`, updates);
  }

  async deleteUser(organizationId: string, userId: string): Promise<void> {
    return this.request<void>('DELETE', `/user/${organizationId}/${userId}`);
  }

  // Send profile email by updating user with send_key_email flag
  async sendProfileEmail(organizationId: string, userId: string): Promise<PritunlUser> {
    // Get current user data
    const user = await this.getUser(organizationId, userId);
    
    // PUT to user endpoint with send_key_email: true
    return this.request<PritunlUser>('PUT', `/user/${organizationId}/${userId}`, {
      ...user,
      send_key_email: true,
    });
  }

  // Server methods
  async listServers(): Promise<PritunlServer[]> {
    return this.request<PritunlServer[]>('GET', '/server');
  }

  async getServer(serverId: string): Promise<PritunlServer> {
    return this.request<PritunlServer>('GET', `/server/${serverId}`);
  }

  async getServerOrganizations(serverId: string): Promise<Array<{id: string; name: string; server: string}>> {
    return this.request('GET', `/server/${serverId}/organization`);
  }

  // Find server for organization by checking all servers
  async findServerForOrganization(organizationId: string): Promise<string | null> {
    const servers = await this.listServers();
    
    for (const server of servers) {
      const orgs = await this.getServerOrganizations(server.id);
      if (orgs.some(org => org.id === organizationId)) {
        return server.id;
      }
    }
    
    return null;
  }

  /**
   * Generate web UI link for user to download profile
   * Note: Pritunl API doesn't expose temporary download URLs
   * Users must either:
   * 1. Use the link sent via email (when send_key_email: true)
   * 2. Log into Pritunl web UI to download
   */
  getWebUIDownloadUrl(baseUrl: string): string {
    return `${baseUrl}/#users`;
  }

  /**
   * Create a new VPN user or get existing user's profile URL
   */
  async requestVPNProfile(
    username: string,
    email: string,
    organizationName: string = 'CCSOMembers'
  ): Promise<{ success: boolean; userId?: string; profileUrl?: string; error?: string; isExisting?: boolean }> {
    try {
      // Find the organization by name
      const organizations = await this.listOrganizations();
      const organization = organizations.find(
        (org) => org.name.toLowerCase() === organizationName.toLowerCase()
      );

      if (!organization) {
        return {
          success: false,
          error: `Organization '${organizationName}' not found`,
        };
      }

      // Check if user already exists
      const existingUsers = await this.listUsers(organization.id);
      const existingUser = existingUsers.find(
        (user) => user.email === email || user.name === username
      );

      let userId: string;
      let isExisting = false;

      if (existingUser && existingUser.id) {
        // User already exists, get their profile URL
        userId = existingUser.id;
        isExisting = true;
      } else {
        // Create new user
        const newUser: PritunlUser = {
          organization_id: organization.id,
          name: username,
          email: email,
          disabled: false,
        };

        const createdUser = await this.createUser(newUser);

        if (!createdUser.id) {
          return {
            success: false,
            error: 'Failed to create user - no user ID returned',
          };
        }

        userId = createdUser.id;
      }

      // Find server for this organization
      const serverId = await this.findServerForOrganization(organization.id);
      
      if (!serverId) {
        return {
          success: false,
          userId,
          error: 'No server found for this organization. Please attach organization to a server in Pritunl.',
        };
      }

      // Send profile email with download link
      try {
        await this.sendProfileEmail(organization.id, userId);
      } catch (emailError) {
        console.error('Failed to send profile email:', emailError);
        return {
          success: false,
          userId,
          error: 'User created but failed to send email. Please contact support.',
        };
      }

      // Pritunl API doesn't expose temporary download URLs via API
      // The download link is sent via email
      const message = isExisting 
        ? 'VPN profile email sent! Check your inbox for the download link.'
        : 'VPN profile created and email sent! Check your inbox for the download link.';

      return {
        success: true,
        userId,
        profileUrl: undefined, // Email contains the actual download link
        message,
        isExisting,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Unknown error occurred',
      };
    }
  }
}

// Singleton instance
let pritunlServiceInstance: PritunlService | null = null;

export function getPritunlService(): PritunlService {
  if (!pritunlServiceInstance) {
    const config: PritunlConfig = {
      baseUrl: process.env.PRITUNL_BASE_URL || 'https://pritunl.psuccso.org',
      apiToken: process.env.PRITUNL_API_TOKEN || '',
      apiSecret: process.env.PRITUNL_API_SECRET || '',
    };

    if (!config.apiToken || !config.apiSecret) {
      throw new Error('Pritunl credentials not configured. Set PRITUNL_API_TOKEN and PRITUNL_API_SECRET in environment variables.');
    }

    pritunlServiceInstance = new PritunlService(config);
  }

  return pritunlServiceInstance;
}
