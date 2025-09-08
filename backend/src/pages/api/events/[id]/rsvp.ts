import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '@/models/prismaClient';
import { EventManager } from '../../../../managers/eventManager';
import { withCORS } from '@/middleware/corsMiddleware';
import { withAuth } from '@/middleware/authMiddleware';
import { logger } from '@/utils/logger';

// Validation schema for RSVP request
const rsvpSchema = z.object({
  attending: z.boolean(),
});

/**
 * @swagger
 * /api/events/{id}/rsvp:
 *   post:
 *     summary: RSVP to an event
 *     tags: [Events]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               attending:
 *                 type: boolean
 *                 description: Whether the user is attending the event
 *             required:
 *               - attending
 *     responses:
 *       200:
 *         description: RSVP successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request - validation error
 *       404:
 *         description: Event not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const eventManager = new EventManager(prisma);
  const eventId = req.query.id as string;

  if (!eventId) {
    return res.status(400).json({ error: 'Event ID is required' });
  }

  try {
    if (req.method === 'POST') {
      // Validate request body
      const body = rsvpSchema.parse(req.body);
      
      // Get user ID from auth middleware (set by withAuth)
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Check if event exists
      const event = await eventManager.getEventById(eventId);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      // Convert attending boolean to RSVP status
      const status = body.attending ? 'CONFIRMED' : 'DECLINED';

      // Process RSVP
      const result = await eventManager.rsvpToEvent({
        userId,
        eventId,
        status,
      });

      res.status(200).json({ 
        success: result.success, 
        message: result.message,
        status: result.status 
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Validation error in RSVP API', { errors: error.errors });
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    
    logger.error('Error in RSVP API', { error, method: req.method, eventId });
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Apply middleware: CORS then authentication
export default withCORS(withAuth(handler));
