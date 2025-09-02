import jwt from 'jsonwebtoken';
import { logger } from './logger';

export interface JWTPayload {
  id: string;
  email: string;
  username?: string;
  role: string;
  iat?: number;
  exp?: number;
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as JWTPayload;
    
    if (!decoded || !decoded.id) {
      logger.warn('Invalid JWT token payload');
      return null;
    }
    
    return decoded;
  } catch (error) {
    logger.warn('JWT verification failed', { error });
    return null;
  }
}

export function generateJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: '24h'
  });
}
