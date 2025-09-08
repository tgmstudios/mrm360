import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/models/prismaClient';
import { withCORS } from '@/middleware/corsMiddleware';
import { withAuth } from '@/middleware/authMiddleware';
import { logger } from '@/utils/logger';

/**
 * @swagger
 * /api/events/checkin/{code}:
 *   get:
 *     summary: Get event by check-in code
 *     tags: [Events]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Event check-in code
 *     responses:
 *       200:
 *         description: Event found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *       404:
 *         description: Event not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const checkInCode = req.query.code as string;

  if (!checkInCode) {
    return res.status(400).json({ error: 'Check-in code is required' });
  }

  try {
    if (req.method === 'GET') {
      const event = await prisma.event.findUnique({
        where: { checkInCode },
        include: {
          linkedTeam: true,
          rsvps: {
            include: {
              user: {
                select: {
                  id: true,
                  displayName: true,
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          },
          checkIns: {
            include: {
              user: {
                select: {
                  id: true,
                  displayName: true,
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          }
        }
      });

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      logger.info('Event retrieved by check-in code', { 
        eventId: event.id, 
        checkInCode,
        title: event.title 
      });

      return res.status(200).json({ data: event });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    logger.error('Error in get event by check-in code API', { error, checkInCode });
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Apply middleware: CORS only (no authentication required for public check-in)
export default withCORS(handler);
