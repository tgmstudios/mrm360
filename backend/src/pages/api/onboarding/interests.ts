import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../models/prismaClient';
import { logger } from '../../../utils/logger';
import { withCORS } from '../../../middleware/corsMiddleware';
import { verifyJWT } from '../../../utils/jwt';
import { DiscordRoleManager } from '../../../utils/discordRoleManager';
import { ListMonkServiceFactory } from '../../../services/listmonkServiceFactory';

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

    const { classRank, interests, subscribeNewsletter } = req.body;

    // Validate input
    if (!classRank || !interests || !Array.isArray(interests) || interests.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Store class rank in the new UserClassRank table
    await prisma.userClassRank.upsert({
      where: { userId: decoded.id },
      update: { classRank: classRank },
      create: {
        userId: decoded.id,
        classRank: classRank
      }
    });

    // Clear existing interests and add new ones
    await prisma.userInterest.deleteMany({
      where: { userId: decoded.id }
    });

    await prisma.userInterest.createMany({
      data: interests.map((interest: string) => ({
        userId: decoded.id,
        interest: interest
      }))
    });

    // Get user's Discord account if linked
    const discordAccount = await prisma.discordAccount.findUnique({
      where: { userId: decoded.id }
    });

    // Assign Discord roles if account is linked
    if (discordAccount) {
      await assignDiscordRoles(decoded.id, classRank, interests);
    }

    // Subscribe to newsletter if requested
    if (subscribeNewsletter) {
      await subscribeToNewsletter(decoded.id);
    }

    logger.info('User onboarding completed successfully', { 
      userId: decoded.id, 
      classRank, 
      interests,
      hasDiscord: !!discordAccount,
      subscribeNewsletter
    });

    return res.status(200).json({
      success: true,
      message: 'Onboarding completed successfully'
    });

  } catch (error) {
    logger.error('Onboarding interests error', { error });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

async function assignDiscordRoles(userId: string, classRank: string, interests: string[]) {
  await DiscordRoleManager.updateRolesEfficiently(userId, classRank, interests);
}

async function subscribeToNewsletter(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      logger.warn('User not found for newsletter subscription', { userId });
      return;
    }

    const listmonkService = ListMonkServiceFactory.createServiceFromEnv();
    const newsletterListId = process.env.LISTMONK_NEWSLETTER_LIST_ID;

    if (!newsletterListId) {
      logger.warn('Newsletter list ID not configured');
      return;
    }

    await listmonkService.subscribeToList(newsletterListId, user.email, {
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName
    });

    logger.info('User subscribed to newsletter successfully', { userId, email: user.email });
  } catch (error) {
    logger.error('Failed to subscribe user to newsletter', { error, userId });
    // Don't fail the onboarding process if newsletter subscription fails
  }
}
