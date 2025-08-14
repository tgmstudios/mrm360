import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { prisma } from '../models/prismaClient';
import { logger } from '../utils/logger';

export interface AuthenticatedRequest extends NextApiRequest {
  user: {
    id: string;
    email: string;
    username?: string;
    firstName: string;
    lastName: string;
    role: string;
    groups: string[];
  };
}

// Helper function to determine effective role based on OIDC groups
function getEffectiveRole(userRole: string, authentikGroups: string[]): string {
  // If user has tech-team group, elevate to admin regardless of base role
  if (authentikGroups.includes('tech-team')) {
    logger.info('User has tech-team group, elevating to admin role', {
      originalRole: userRole,
      authentikGroups
    });
    return 'ADMIN';
  }
  return userRole;
}

export function withAuth(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Get JWT token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        logger.warn('No valid authorization header', { path: req.url });
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'No valid token provided' 
        });
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Verify JWT token
      let decoded: any;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      } catch (error) {
        logger.warn('Invalid JWT token', { error, path: req.url });
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'Invalid token' 
        });
      }

      if (!decoded || !decoded.id) {
        logger.warn('Invalid token payload', { path: req.url });
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'Invalid token payload' 
        });
      }

      // Get fresh user data from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          role: true
        }
      });

      if (!user) {
        logger.warn('User not found', { userId: decoded.id, path: req.url });
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'User not found' 
        });
      }

      // Get user groups
      const userGroups = await prisma.userGroup.findMany({
        where: { userId: user.id },
        include: {
          group: {
            select: {
              name: true
            }
          }
        }
      });

      // Create authenticated request with user info
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = {
        id: user.id,
        email: user.email,
        username: user.username || undefined,
        firstName: user.firstName,
        lastName: user.lastName,
        role: getEffectiveRole(user.role, userGroups.map(ug => ug.group.name)),
        groups: userGroups.map(ug => ug.group.name)
      };

      logger.info('Authentication successful', { 
        userId: user.id, 
        userRole: authenticatedReq.user.role,
        path: req.url 
      });

      // Call the original handler
      await handler(authenticatedReq, res);
    } catch (error) {
      logger.error('Authentication middleware error', { error, path: req.url });
      return res.status(500).json({ 
        error: 'Internal server error',
        message: 'Authentication failed' 
      });
    }
  };
}
