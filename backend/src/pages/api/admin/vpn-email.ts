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
    const decoded = verifyJWT(token);
    
    if (!decoded || !decoded.id) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if requester is admin
    const requester = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { role: true }
    });

    if (!requester || requester.role !== 'ADMIN') {
      logger.warn('Non-admin attempted to send VPN email', { requesterId: decoded.id });
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get target user and organization from request
    const { userId, organization = 'CCSOMembers' } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Get target user from database
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        displayName: true,
      }
    });

    if (!targetUser || !targetUser.email) {
      logger.warn('Target user not found or email missing', { userId });
      return res.status(404).json({ error: 'User not found or email not configured' });
    }

    // Generate username from display name or name
    const username = targetUser.displayName || `${targetUser.firstName}.${targetUser.lastName}`.toLowerCase().replace(/\s+/g, '.');

    logger.info('Admin sending VPN email', { 
      adminId: decoded.id,
      targetUserId: targetUser.id,
      username,
      email: targetUser.email,
      organization
    });

    // Use Pritunl service to find/create user and send email
    const pritunlService = getPritunlService();
    
    // First ensure user exists in Pritunl
    const vpnResult = await pritunlService.requestVPNProfile(username, targetUser.email, organization);
    
    if (!vpnResult.success || !vpnResult.userId) {
      logger.error('Failed to create/find Pritunl user', { 
        targetUserId: targetUser.id,
        error: vpnResult.error 
      });
      return res.status(400).json({ 
        error: vpnResult.error || 'Failed to create VPN profile' 
      });
    }

    // Find organization ID
    const organizations = await pritunlService.listOrganizations();
    const org = organizations.find(o => o.name.toLowerCase() === organization.toLowerCase());
    
    if (!org) {
      return res.status(400).json({ error: `Organization '${organization}' not found` });
    }

    // Now send the email
    try {
      await pritunlService.sendProfileEmail(org.id, vpnResult.userId);
      
      logger.info('VPN profile email sent successfully', { 
        adminId: decoded.id,
        targetUserId: targetUser.id,
        pritunlUserId: vpnResult.userId 
      });

      return res.status(200).json({
        success: true,
        message: `VPN profile emailed to ${targetUser.email}`
      });
    } catch (emailError) {
      logger.error('Failed to send VPN email', {
        targetUserId: targetUser.id,
        error: emailError instanceof Error ? emailError.message : String(emailError)
      });
      
      return res.status(500).json({
        success: false,
        error: 'User exists in VPN system but failed to send email'
      });
    }

  } catch (error) {
    logger.error('VPN email request error', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
});
