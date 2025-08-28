import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest } from './authMiddleware';
import { logger } from '../utils/logger';

export interface PermissionRequest extends AuthenticatedRequest {
  // Extends AuthenticatedRequest with user info
}

export function withPermissions(
  handler: (req: PermissionRequest, res: NextApiResponse) => Promise<void>,
  requiredPermissions: string[] | ((req: NextApiRequest) => string[])
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Cast to PermissionRequest since this middleware should be used after withAuth
      const permissionReq = req as PermissionRequest;

      if (!permissionReq.user) {
        logger.warn('Permission check attempted without authentication', { 
          path: req.url, 
          method: req.method 
        });
        
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'Authentication required' 
        });
      }

      // Get required permissions (either static array or dynamic function)
      const permissions = typeof requiredPermissions === 'function' 
        ? requiredPermissions(req) 
        : requiredPermissions;

      // Check if user has required permissions
      const hasPermission = await checkPermissions(permissionReq.user, permissions);
      
      if (!hasPermission) {
        logger.warn('Insufficient permissions', { 
          userId: permissionReq.user.id, 
          userRole: permissionReq.user.role,
          requiredPermissions: permissions,
          path: req.url 
        });
        
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'Insufficient permissions for this operation' 
        });
      }

      logger.info('Permission check passed', { 
        userId: permissionReq.user.id, 
        requiredPermissions: permissions,
        path: req.url 
      });

      // Call the original handler
      await handler(permissionReq, res);
    } catch (error) {
      logger.error('Permission middleware error', { error, path: req.url });
      return res.status(500).json({ 
        error: 'Internal server error',
        message: 'Permission check failed' 
      });
    }
  };
}

async function checkPermissions(user: any, requiredPermissions: string[]): Promise<boolean> {
  // For now, implement a simple role-based permission system
  // This can be enhanced later with a more sophisticated permission system
  
  const rolePermissions: Record<string, string[]> = {
    'ADMIN': [
      'users:read', 'users:create', 'users:update', 'users:delete',
      'groups:read', 'groups:create', 'groups:update', 'groups:delete',
      'events:read', 'events:create', 'events:update', 'events:delete',
      'teams:read', 'teams:write', 'teams:create', 'teams:update', 'teams:delete',
      'tasks:read', 'tasks:create', 'tasks:update', 'tasks:delete', 'tasks:enqueue'
    ],
    'EXEC_BOARD': [
      'users:read', 'users:create', 'users:update',
      'groups:read', 'groups:create', 'groups:update',
      'events:read', 'events:create', 'events:update',
      'teams:read', 'teams:write', 'teams:create', 'teams:update',
      'tasks:read', 'tasks:create', 'tasks:update'
    ],
    'MEMBER': [
      'users:read',
      'groups:read',
      'events:read',
      'teams:read',
      'tasks:read'
    ]
  };

  // Check if user has tech-team group in authentikGroups (OIDC groups)
  // If they do, give them admin permissions regardless of their role
  let effectiveRole = user.role;
  if (user.authentikGroups && Array.isArray(user.authentikGroups)) {
    if (user.authentikGroups.includes('tech-team')) {
      effectiveRole = 'ADMIN';
      logger.info('User has tech-team group, elevating to admin permissions', {
        userId: user.id,
        originalRole: user.role,
        authentikGroups: user.authentikGroups
      });
    }
  }

  const userPermissions = rolePermissions[effectiveRole] || [];
  
  // Check if user has all required permissions
  return requiredPermissions.every(permission => userPermissions.includes(permission));
}
