import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/middleware/authMiddleware';
import { prisma } from '@/models/prismaClient';
import { logger } from '@/utils/logger';
import { withCORS } from '@/middleware/corsMiddleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const now = new Date();
    
    // Get all counts in parallel for better performance
    const [
      totalMembers,
      totalTeams,
      paidMembers,
      unpaidMembers,
      upcomingEvents,
      activeEvents
    ] = await Promise.all([
      // Total members count
      prisma.user.count(),
      
      // Total teams count
      prisma.team.count(),
      
      // Paid members count
      prisma.user.count({
        where: {
          paidStatus: true
        }
      }),
      
      // Unpaid members count
      prisma.user.count({
        where: {
          paidStatus: false
        }
      }),
      
      // Upcoming events count
      prisma.event.count({
        where: {
          startTime: {
            gt: now
          }
        }
      }),
      
      // Active events count (events that are currently happening or upcoming)
      prisma.event.count({
        where: {
          startTime: {
            gt: now
          }
        }
      })
    ]);

    const stats = {
      totalMembers,
      totalTeams,
      paidMembers,
      unpaidMembers,
      upcomingEvents,
      activeEvents
    };
    
    logger.info('Dashboard stats retrieved', { stats });
    
    return res.status(200).json({ 
      success: true,
      data: stats 
    });
  } catch (error) {
    logger.error('Failed to get dashboard stats', { error });
    return res.status(500).json({ error: 'Failed to retrieve dashboard statistics' });
  }
}

export default withCORS(withAuth(handler));
