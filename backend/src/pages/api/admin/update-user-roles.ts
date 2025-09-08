import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/middleware/authMiddleware';
import { withPermissions } from '@/middleware/permissionMiddleware';
import { updateAllUserRolesFromGroups } from '@/utils/roleUtils';
import { logger } from '@/utils/logger';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    logger.info('Starting bulk user role update process');
    
    const result = await updateAllUserRolesFromGroups();
    
    logger.info('Bulk user role update completed', result);
    
    return res.status(200).json({
      success: true,
      message: 'User roles updated successfully',
      result
    });
  } catch (error) {
    logger.error('Failed to update user roles', { error });
    return res.status(500).json({
      error: 'Failed to update user roles',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Require admin permissions to run this operation
export default withAuth(
  withPermissions(handler, ['users:update'])
);
