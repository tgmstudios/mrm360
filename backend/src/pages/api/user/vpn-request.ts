import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/models/prismaClient';
import { logger } from '@/utils/logger';
import { withCORS } from '@/middleware/corsMiddleware';
import { verifyJWT } from '@/utils/jwt';
import { getPritunlService } from '@/services/pritunlService';

export default withCORS(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify JWT token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7);
    logger.info('Attempting to verify JWT token for VPN request', { tokenLength: token.length });
    
    const decoded = verifyJWT(token);
    
    if (!decoded || !decoded.id) {
      logger.warn('JWT verification failed or invalid payload', { decoded });
      return res.status(401).json({ error: 'Invalid token' });
    }

    logger.info('JWT verified successfully for VPN request', { userId: decoded.id });

    // Get organization from request body (default to CCSOMembers)
    const { organization = 'CCSOMembers' } = req.body || {};

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        displayName: true,
        role: true,
      }
    });

    if (!user || !user.email) {
      logger.warn('User not found or email missing', { userId: decoded.id });
      return res.status(404).json({ error: 'User not found or email not configured' });
    }

    // Check permissions for admin VPN
    if (organization === 'CCSOAdmins' && user.role !== 'ADMIN') {
      logger.warn('Non-admin user attempted to request admin VPN', { userId: user.id, role: user.role });
      return res.status(403).json({ error: 'Admin access required for CCSOAdmins VPN' });
    }

    // Generate username from display name or name
    const username = user.displayName || `${user.firstName}.${user.lastName}`.toLowerCase().replace(/\s+/g, '.');

    logger.info('Requesting VPN profile via Pritunl', { 
      userId: user.id, 
      username,
      email: user.email,
      organization
    });

    // Request VPN profile using Pritunl service
    const pritunlService = getPritunlService();
    const result = await pritunlService.requestVPNProfile(username, user.email, organization);

    if (!result.success) {
      logger.error('Pritunl VPN profile request failed', { 
        userId: user.id,
        error: result.error 
      });
      return res.status(400).json({ 
        error: result.error || 'Failed to request VPN profile' 
      });
    }

    const message = result.isExisting 
      ? 'VPN profile already exists' 
      : 'VPN profile created successfully';

    logger.info(message, { 
      userId: user.id,
      pritunlUserId: result.userId,
      isExisting: result.isExisting
    });

    return res.status(200).json({
      success: true,
      message,
      pritunlUserId: result.userId,
      profileUrl: result.profileUrl,
      isExisting: result.isExisting
    });

  } catch (error) {
    logger.error('VPN request error', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown'
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
});
