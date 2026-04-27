export interface DefguardConfig {
  baseUrl: string;
  apiToken: string;
}

interface DefguardEnrollment {
  enrollment_token: string;
  enrollment_url: string;
}

export class DefguardService {
  private baseUrl: string;
  private apiToken: string;

  constructor(config: DefguardConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.apiToken = config.apiToken;
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const text = await response.text();
      let msg = text;
      try {
        const json = JSON.parse(text);
        if (json.msg) msg = json.msg;
      } catch {}
      throw new Error(msg);
    }

    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
  }

  private async isUsernameAvailable(username: string): Promise<boolean> {
    try {
      await this.request('POST', '/api/v1/user/available', { username });
      return true;
    } catch {
      return false;
    }
  }

  private async createUser(
    username: string,
    email: string,
    firstName: string,
    lastName: string,
  ): Promise<void> {
    await this.request('POST', '/api/v1/user', {
      username,
      email,
      first_name: firstName,
      last_name: lastName,
    });
  }

  private async startEnrollment(username: string): Promise<DefguardEnrollment> {
    return this.request<DefguardEnrollment>(
      'POST',
      `/api/v1/user/${username}/start_enrollment`,
      { send_enrollment_notification: false, username },
    );
  }

  private async startDesktop(username: string): Promise<DefguardEnrollment> {
    return this.request<DefguardEnrollment>(
      'POST',
      `/api/v1/user/${username}/start_desktop`,
      { send_enrollment_notification: false, username },
    );
  }

  private async addToGroup(groupId: number, username: string): Promise<void> {
    await this.request('POST', `/api/v1/group/${groupId}`, { username });
  }

  async requestEnrollment(
    username: string,
    email: string,
    firstName: string,
    lastName: string,
    groupId?: number,
  ): Promise<{
    success: boolean;
    enrollmentToken?: string;
    enrollmentUrl?: string;
    isNew?: boolean;
    error?: string;
  }> {
    try {
      const isNew = await this.isUsernameAvailable(username);
      if (isNew) {
        await this.createUser(username, email, firstName, lastName);
      }

      let enrollment: DefguardEnrollment;
      try {
        enrollment = await this.startEnrollment(username);
      } catch (err: any) {
        if (err.message?.includes('already activated')) {
          enrollment = await this.startDesktop(username);
        } else {
          throw err;
        }
      }

      if (groupId !== undefined) {
        await this.addToGroup(groupId, username);
      }

      const { enrollment_token, enrollment_url } = enrollment;

      return {
        success: true,
        enrollmentToken: enrollment_token,
        enrollmentUrl: enrollment_url,
        isNew,
      };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error' };
    }
  }
}

let instance: DefguardService | null = null;

export function getDefguardService(): DefguardService {
  if (!instance) {
    const baseUrl = process.env.DEFGUARD_BASE_URL;
    const apiToken = process.env.DEFGUARD_API_TOKEN;

    if (!baseUrl || !apiToken) {
      throw new Error('Defguard not configured. Set DEFGUARD_BASE_URL and DEFGUARD_API_TOKEN.');
    }

    instance = new DefguardService({ baseUrl, apiToken });
  }
  return instance;
}
