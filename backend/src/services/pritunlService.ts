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

  // Send profile email
  async sendProfileEmail(organizationId: string, userId: string, serverId: string): Promise<void> {
    return this.request<void>('POST', `/user/${organizationId}/${userId}/send_email`, {
      server_id: serverId,
    });
  }

  // Server methods
  async listServers(): Promise<PritunlServer[]> {
    return this.request<PritunlServer[]>('GET', '/server');
  }

  async getServer(serverId: string): Promise<PritunlServer> {
    return this.request<PritunlServer>('GET', `/server/${serverId}`);
  }

  /**
   * Create a new VPN user and send their profile via email
   */
  async requestVPNProfile(
    username: string,
    email: string,
    organizationName: string = 'CCSOMembers'
  ): Promise<{ success: boolean; userId?: string; error?: string }> {
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

      if (existingUser) {
        return {
          success: false,
          error: 'User with this email or username already exists',
        };
      }

      // Create the new user
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

      // Get the first server associated with this organization
      const servers = await this.listServers();
      const server = servers.find((srv) =>
        srv.organizations.includes(organization.id)
      );

      if (!server) {
        // User created but no server found
        return {
          success: true,
          userId: createdUser.id,
          error: 'User created but no server found to send profile from',
        };
      }

      // Note: Pritunl's send_email endpoint may not exist or require email configuration
      // Attempt to send profile email, but don't fail if it doesn't work
      try {
        await this.sendProfileEmail(organization.id, createdUser.id, server.id);
      } catch (emailError) {
        // Email sending failed, but user was created successfully
        console.log('Could not send profile email, but user created:', emailError);
      }

      return {
        success: true,
        userId: createdUser.id,
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
