import { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '@/utils/logger';
import { getEffectiveSystemRole, hasAdminGroups } from '@/utils/roleUtils';

export interface PermissionRequest extends NextApiRequest {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    groups: string[];
  };
}

export function withPermissions(
  handler: (req: PermissionRequest, res: NextApiResponse) => Promise<void>,
  requiredPermissions: string[] | ((req: NextApiRequest) => string[])
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Get the required permissions
      const permissions = typeof requiredPermissions === 'function' 
        ? requiredPermissions(req) 
        : requiredPermissions;

      // Get user from request (should be set by auth middleware)
      const user = (req as any).user;
      
      if (!user) {
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'User not authenticated' 
        });
      }

      // Check permissions
      const hasPermission = await checkPermissions(user, permissions);
      
      if (!hasPermission) {
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'Permission check failed' 
        });
      }

      // Call the handler
      await handler(req as PermissionRequest, res);
      
    } catch (error) {
      logger.error('Permission middleware error:', error);
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

  // Check if user has admin groups in authentikGroups (OIDC groups)
  // If they do, give them admin permissions regardless of their role
  let effectiveRole = getEffectiveSystemRole(user.role);
  if (user.authentikGroups && Array.isArray(user.authentikGroups)) {
    if (hasAdminGroups(user.authentikGroups)) {
      effectiveRole = 'ADMIN';
      logger.info('User has admin groups, elevating to admin permissions', {
        userId: user.id,
        originalRole: user.role,
        effectiveRole,
        authentikGroups: user.authentikGroups
      });
    }
  }

  const userPermissions = rolePermissions[effectiveRole] || [];
  
  // Check if user has all required permissions
  return requiredPermissions.every(permission => userPermissions.includes(permission));
}
