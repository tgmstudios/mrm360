import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '@/models/prismaClient';
import { EventManager } from '../../../../managers/eventManager';
import { withCORS } from '@/middleware/corsMiddleware';
import { withAuth } from '@/middleware/authMiddleware';
import { withPermissions } from '@/middleware/permissionMiddleware';
import { logger } from '@/utils/logger';

// Validation schemas
const checkInSchema = z.object({
  qrCode: z.string().min(1),
});

const manualCheckInSchema = z.object({
  userId: z.string().min(1),
});

/**
 * @swagger
 * /api/events/{id}/checkin:
 *   post:
 *     summary: Check in a user to an event using QR code
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
 *               qrCode:
 *                 type: string
 *                 description: QR code from user's profile
 *             required:
 *               - qrCode
 *     responses:
 *       200:
 *         description: Check-in successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *       400:
 *         description: Bad request - validation error or invalid QR code
 *       404:
 *         description: Event not found or user not RSVP'd
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
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
      // Check if this is a manual check-in request
      if (req.body.userId) {
        // Manual check-in - RESTRICTED: Only allow users to check themselves in
        const body = manualCheckInSchema.parse(req.body);
        const requestingUser = (req as any).user;
        
        // Only allow users to check themselves in
        if (body.userId !== requestingUser.id) {
          return res.status(403).json({ 
            success: false, 
            message: 'You can only check yourself in to events' 
          });
        }
        
        // Check if user exists
        const user = await prisma.user.findUnique({
          where: { id: body.userId },
        });

        if (!user) {
          return res.status(400).json({ 
            success: false, 
            message: 'User not found' 
          });
        }

        // Get event details for eligibility check
        const event = await prisma.event.findUnique({
          where: { id: eventId },
        });

        if (!event) {
          return res.status(404).json({ 
            success: false, 
            message: 'Event not found' 
          });
        }

        // RESTRICTED: Only allow check-in for SOFT attendance type
        if (event.attendanceType !== 'SOFT') {
          return res.status(403).json({ 
            success: false, 
            message: 'Check-in is only available for events with SOFT attendance type' 
          });
        }

        // Check if user is RSVP'd, auto-RSVP if not (but respect capacity and eligibility)
        let rsvp = await prisma.rSVP.findUnique({
          where: {
            userId_eventId: {
              userId: body.userId,
              eventId: eventId,
            },
          },
        });

        if (!rsvp) {
          // Check if user is eligible for auto-RSVP
          const canAutoRsvp = await eventManager.canUserAutoRsvp(body.userId, event);
          
          if (!canAutoRsvp.canRsvp) {
            logger.warn('User not eligible for auto-RSVP during manual check-in', { 
              userId: body.userId, 
              eventId, 
              reason: canAutoRsvp.reason 
            });
            return res.status(400).json({ 
              success: false, 
              message: canAutoRsvp.reason || 'You are not eligible to RSVP to this event. Please RSVP manually first.' 
            });
          }

          // Auto-RSVP user - check if event has attendance cap
          let autoRsvpStatus = 'CONFIRMED';
          
          if (event.attendanceCap) {
            const confirmedCount = await prisma.rSVP.count({
              where: { 
                eventId: eventId, 
                status: 'CONFIRMED' 
              }
            });
            
            if (confirmedCount >= event.attendanceCap) {
              // Don't allow check-in if user would be waitlisted or declined
              if (event.waitlistEnabled) {
                logger.warn('Manual check-in prevented - user would be waitlisted', { userId: body.userId, eventId });
                return res.status(400).json({ 
                  success: false, 
                  message: 'This event is full and you would be placed on the waitlist. Please RSVP manually first to join the waitlist.' 
                });
              } else {
                logger.warn('Manual check-in prevented - user would be declined due to capacity', { userId: body.userId, eventId });
                return res.status(400).json({ 
                  success: false, 
                  message: 'This event is full and has no waitlist. Please RSVP manually first.' 
                });
              }
            }
          }
          
          rsvp = await prisma.rSVP.create({
            data: {
              userId: body.userId,
              eventId: eventId,
              status: autoRsvpStatus,
            },
          });
          logger.info('Auto-RSVP created for manual check-in', { userId: body.userId, eventId, status: autoRsvpStatus });
        } else if (rsvp.status !== 'CONFIRMED') {
          // Check if we can confirm the existing RSVP
          if (event.attendanceCap) {
            const confirmedCount = await prisma.rSVP.count({
              where: { 
                eventId: eventId, 
                status: 'CONFIRMED' 
              }
            });
            
            if (confirmedCount >= event.attendanceCap) {
              // Don't allow check-in if user is waitlisted or declined
              if (rsvp.status === 'WAITLIST') {
                logger.warn('Manual check-in prevented - user is on waitlist', { userId: body.userId, eventId });
                return res.status(400).json({ 
                  success: false, 
                  message: 'You are on the waitlist for this event. Please wait for confirmation before checking in.' 
                });
              } else if (rsvp.status === 'DECLINED') {
                logger.warn('Manual check-in prevented - user RSVP is declined', { userId: body.userId, eventId });
                return res.status(400).json({ 
                  success: false, 
                  message: 'Your RSVP for this event is declined. Please RSVP again if you want to attend.' 
                });
              } else {
                logger.warn('Manual check-in prevented - user RSVP status prevents check-in', { userId: body.userId, eventId, status: rsvp.status });
                return res.status(400).json({ 
                  success: false, 
                  message: `Your RSVP status (${rsvp.status}) prevents check-in. Please update your RSVP first.` 
                });
              }
            }
          }
          
          // Update existing RSVP to CONFIRMED
          rsvp = await prisma.rSVP.update({
            where: {
              userId_eventId: {
                userId: body.userId,
                eventId: eventId,
              },
            },
            data: {
              status: 'CONFIRMED',
            },
          });
          logger.info('RSVP updated to CONFIRMED for manual check-in', { userId: body.userId, eventId, previousStatus: rsvp.status });
        }

        // Check if already checked in
        const existingCheckIn = await prisma.checkIn.findUnique({
          where: {
            userId_eventId: {
              userId: body.userId,
              eventId: eventId,
            },
          },
        });

        if (existingCheckIn) {
          return res.status(400).json({ 
            success: false, 
            message: 'User already checked in' 
          });
        }

        // Create check-in record
        await prisma.checkIn.create({
          data: {
            userId: body.userId,
            eventId: eventId,
            qrCode: user.qrCode || '',
            checkedInAt: new Date(),
          },
        });

        logger.info('Manual check-in successful', { userId: body.userId, eventId });

        return res.status(200).json({ 
          success: true, 
          message: 'Check-in successful', 
          user: {
            id: user.id,
            displayName: user.displayName,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
          }
        });
      } else {
        // QR code check-in - RESTRICTED: Only allow for SOFT attendance type
        const body = checkInSchema.parse(req.body);
        
        // Get event details to check attendance type
        const event = await prisma.event.findUnique({
          where: { id: eventId },
        });

        if (!event) {
          return res.status(404).json({ 
            success: false, 
            message: 'Event not found' 
          });
        }

        // RESTRICTED: Only allow QR check-in for SOFT attendance type
        if (event.attendanceType !== 'SOFT') {
          return res.status(403).json({ 
            success: false, 
            message: 'Check-in is only available for events with SOFT attendance type' 
          });
        }
        
        const result = await eventManager.checkInAttendance({
          qrCode: body.qrCode,
          eventId: eventId,
        });

        if (!result.success) {
          return res.status(400).json(result);
        }

        res.status(200).json(result);
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Validation error in check-in API', { errors: error.errors });
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    
    logger.error('Error in check-in API', { error, method: req.method, eventId });
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Apply middleware: CORS and authentication only (no permissions required for check-in)
export default withCORS(withAuth(handler));
