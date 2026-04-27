import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/models/prismaClient';
import { logger } from '@/utils/logger';
import { withCORS } from '@/middleware/corsMiddleware';
import { verifyJWT } from '@/utils/jwt';
import { getDefguardService } from '@/services/defguardService';

export default withCORS(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const decoded = verifyJWT(authHeader.substring(7));
    if (!decoded || !decoded.id) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const requester = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { role: true },
    });

    if (!requester || requester.role !== 'ADMIN') {
      logger.warn('Non-admin attempted admin VPN config', { requesterId: decoded.id });
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, lastName: true, displayName: true },
    });

    if (!targetUser || !targetUser.email) {
      return res.status(404).json({ error: 'User not found or email not configured' });
    }

    const rawUsername = targetUser.displayName || `${targetUser.firstName}-${targetUser.lastName}`;
    const username = rawUsername.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^[^a-z]+/, 'u$&');
    const firstName = targetUser.firstName || username;
    const lastName = targetUser.lastName || '';

    logger.info('Admin starting VPN enrollment', {
      adminId: decoded.id,
      targetUserId: targetUser.id,
      username,
    });

    const result = await getDefguardService().requestEnrollment(
      username,
      targetUser.email,
      firstName,
      lastName,
      1,
    );

    if (!result.success) {
      logger.error('Failed to start VPN enrollment for user', {
        targetUserId: targetUser.id,
        error: result.error,
      });
      return res.status(400).json({ error: result.error || 'Failed to start VPN enrollment' });
    }

    logger.info('Admin VPN enrollment started', { adminId: decoded.id, targetUserId: targetUser.id });

    return res.status(200).json({
      success: true,
      enrollmentToken: result.enrollmentToken,
      enrollmentUrl: result.enrollmentUrl,
      isNew: result.isNew,
    });
  } catch (error) {
    logger.error('Admin VPN enrollment error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
});
