import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/models/prismaClient';
import { logger } from '@/utils/logger';
import { withCORS } from '@/middleware/corsMiddleware';
import { verifyJWT } from '@/utils/jwt';

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

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate new QR code
    const newQRCode = `MRM360-${user.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Update user with new QR code
    await prisma.user.update({
      where: { id: decoded.id },
      data: { qrCode: newQRCode }
    });

    logger.info('QR code refreshed successfully', { userId: decoded.id });

    return res.status(200).json({
      success: true,
      message: 'QR code refreshed successfully',
      qrCode: newQRCode
    });

  } catch (error) {
    logger.error('QR code refresh error', { error });
    return res.status(500).json({ error: 'Internal server error' });
  }
});
