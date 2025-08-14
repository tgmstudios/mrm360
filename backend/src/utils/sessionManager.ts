import Redis from 'ioredis';
import { logger } from './logger';
import { SessionUser } from '../managers/authManager';

export class SessionManager {
  private redis: Redis;
  private readonly SESSION_PREFIX = 'session:';
  private readonly SESSION_TTL = 24 * 60 * 60; // 24 hours in seconds

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    
    this.redis.on('error', (error) => {
      logger.error('Redis connection error', { error });
    });
    
    this.redis.on('connect', () => {
      logger.info('Redis connected successfully');
    });
  }

  async createSession(user: SessionUser): Promise<string> {
    try {
      const sessionId = this.generateSessionId();
      const sessionKey = this.SESSION_PREFIX + sessionId;
      
      // Store session data in Redis
      await this.redis.setex(
        sessionKey,
        this.SESSION_TTL,
        JSON.stringify({
          userId: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          groups: user.groups,
          paidStatus: user.paidStatus,
          qrCode: user.qrCode,
          createdAt: new Date().toISOString(),
          lastAccessed: new Date().toISOString(),
        })
      );

      logger.info('Session created successfully', { 
        sessionId: sessionId.substring(0, 8) + '...',
        userId: user.id 
      });

      return sessionId;
    } catch (error) {
      logger.error('Failed to create session', { error, userId: user.id });
      throw error;
    }
  }

  async getSession(sessionId: string): Promise<SessionUser | null> {
    try {
      const sessionKey = this.SESSION_PREFIX + sessionId;
      const sessionData = await this.redis.get(sessionKey);
      
      if (!sessionData) {
        return null;
      }

      const session = JSON.parse(sessionData);
      
      // Update last accessed time
      await this.redis.setex(
        sessionKey,
        this.SESSION_TTL,
        JSON.stringify({
          ...session,
          lastAccessed: new Date().toISOString(),
        })
      );

      // Return session user object
      return {
        id: session.userId,
        email: session.email,
        name: session.name,
        role: session.role,
        groups: session.groups,
        paidStatus: session.paidStatus,
        qrCode: session.qrCode,
      };
    } catch (error) {
      logger.error('Failed to get session', { error, sessionId: sessionId.substring(0, 8) + '...' });
      return null;
    }
  }

  async validateSession(sessionId: string): Promise<boolean> {
    try {
      const sessionKey = this.SESSION_PREFIX + sessionId;
      const exists = await this.redis.exists(sessionKey);
      return exists === 1;
    } catch (error) {
      logger.error('Failed to validate session', { error, sessionId: sessionId.substring(0, 8) + '...' });
      return false;
    }
  }

  async refreshSession(sessionId: string): Promise<boolean> {
    try {
      const sessionKey = this.SESSION_PREFIX + sessionId;
      const sessionData = await this.redis.get(sessionKey);
      
      if (!sessionData) {
        return false;
      }

      // Extend session TTL
      await this.redis.setex(sessionKey, this.SESSION_TTL, sessionData);
      
      logger.info('Session refreshed successfully', { 
        sessionId: sessionId.substring(0, 8) + '...' 
      });
      
      return true;
    } catch (error) {
      logger.error('Failed to refresh session', { error, sessionId: sessionId.substring(0, 8) + '...' });
      return false;
    }
  }

  async destroySession(sessionId: string): Promise<boolean> {
    try {
      const sessionKey = this.SESSION_PREFIX + sessionId;
      const deleted = await this.redis.del(sessionKey);
      
      if (deleted > 0) {
        logger.info('Session destroyed successfully', { 
          sessionId: sessionId.substring(0, 8) + '...' 
        });
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Failed to destroy session', { error, sessionId: sessionId.substring(0, 8) + '...' });
      return false;
    }
  }

  async getUserSessions(userId: string): Promise<string[]> {
    try {
      const pattern = this.SESSION_PREFIX + '*';
      const keys = await this.redis.keys(pattern);
      const sessions: string[] = [];
      
      for (const key of keys) {
        const sessionData = await this.redis.get(key);
        if (sessionData) {
          const session = JSON.parse(sessionData);
          if (session.userId === userId) {
            const sessionId = key.replace(this.SESSION_PREFIX, '');
            sessions.push(sessionId);
          }
        }
      }
      
      return sessions;
    } catch (error) {
      logger.error('Failed to get user sessions', { error, userId });
      return [];
    }
  }

  async destroyUserSessions(userId: string): Promise<number> {
    try {
      const sessions = await this.getUserSessions(userId);
      let destroyedCount = 0;
      
      for (const sessionId of sessions) {
        const destroyed = await this.destroySession(sessionId);
        if (destroyed) {
          destroyedCount++;
        }
      }
      
      logger.info('User sessions destroyed', { userId, count: destroyedCount });
      return destroyedCount;
    } catch (error) {
      logger.error('Failed to destroy user sessions', { error, userId });
      return 0;
    }
  }

  async cleanupExpiredSessions(): Promise<number> {
    try {
      // Redis automatically handles expiration, but we can add cleanup logic here
      // For now, just return 0 as Redis handles TTL automatically
      return 0;
    } catch (error) {
      logger.error('Failed to cleanup expired sessions', { error });
      return 0;
    }
  }

  private generateSessionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const hash = this.simpleHash(timestamp + random);
    return `sess_${hash}_${timestamp}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36).substring(0, 12);
  }

  async close(): Promise<void> {
    try {
      await this.redis.quit();
      logger.info('Session manager closed successfully');
    } catch (error) {
      logger.error('Failed to close session manager', { error });
    }
  }
}

// Export singleton instance
export const sessionManager = new SessionManager();
