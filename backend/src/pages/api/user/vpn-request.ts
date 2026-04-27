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

    const { organization = 'CCSOMembers' } = req.body || {};

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, firstName: true, lastName: true, displayName: true, role: true },
    });

    if (!user || !user.email) {
      return res.status(404).json({ error: 'User not found or email not configured' });
    }

    if (organization === 'CCSOAdmins' && user.role !== 'ADMIN') {
      logger.warn('Non-admin attempted admin VPN request', { userId: user.id });
      return res.status(403).json({ error: 'Admin access required for CCSOAdmins VPN' });
    }

    const username = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^[^a-z]+/, 'u$&');
    const firstName = user.firstName || username;
    const lastName = user.lastName || '';

    logger.info('Requesting Defguard enrollment', { userId: user.id, username });

    const groupId = organization === 'CCSOAdmins' ? 1 : 2;

    const result = await getDefguardService().requestEnrollment(
      username,
      user.email,
      firstName,
      lastName,
      groupId,
    );

    if (!result.success) {
      logger.error('Defguard enrollment request failed', { userId: user.id, error: result.error });
      return res.status(400).json({ error: result.error || 'Failed to start VPN enrollment' });
    }

    logger.info('Defguard enrollment started', { userId: user.id, isNew: result.isNew });

    return res.status(200).json({
      success: true,
      enrollmentToken: result.enrollmentToken,
      enrollmentUrl: result.enrollmentUrl,
      isNew: result.isNew,
    });
  } catch (error) {
    logger.error('VPN request error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
});
