import { NextApiRequest, NextApiResponse } from 'next';
import { withCORS } from '@/middleware/corsMiddleware';
import { withAuth } from '@/middleware/authMiddleware';
import { logger } from '@/utils/logger';
import { WiretapServiceFactory } from '@/services/wiretapServiceFactory';
import { prisma } from '@/models/prismaClient';
import { BackgroundTaskManager } from '@/managers/backgroundTaskManager';

/**
 * @swagger
 * /api/events/{id}/teams/sync:
 *   post:
 *     summary: Sync team assignments with RSVP status
 *     tags: [Events]
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
 *               syncType:
 *                 type: string
 *                 enum: [auto_assign, remove_declined, sync_all]
 *                 description: Type of synchronization to perform
 *               membersPerTeam:
 *                 type: integer
 *                 default: 4
 *                 description: Number of members per team for auto assignment
 *     responses:
 *       200:
 *         description: Sync operation started successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id: eventId } = req.query;

  if (typeof eventId !== 'string') {
    return res.status(400).json({ error: 'Invalid event ID' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        eventTeams: {
          include: {
            members: {
              include: { user: true }
            }
          }
        },
        rsvps: {
          include: { user: true }
        }
      }
    } as any);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const { syncType, membersPerTeam = 4 } = req.body;

    if (!syncType || !['auto_assign', 'remove_declined', 'sync_all'].includes(syncType)) {
      return res.status(400).json({ error: 'Invalid sync type' });
    }

    // Create background task for sync operation
    const taskManager = new BackgroundTaskManager(prisma);
    const task = await taskManager.createTask({
      name: 'WIRETAP_SYNC',
      description: `Sync team assignments for event: ${event.title}`,
      entityType: 'EVENT',
      entityId: eventId,
      subtaskNames: [] // No subtasks needed - sync is performed as single operation
    });

    // Queue the sync job using the existing wiretap queue
    const { wiretapQueue } = require('@/tasks/queue');
    
    await wiretapQueue.add('sync-teams', {
      backgroundTaskId: task.id,
      action: 'sync_teams',
      payload: {
        eventId,
        syncType,
        membersPerTeam
      }
    });

    logger.info(`Started team sync operation for event ${eventId}`, { 
      syncType, 
      taskId: task.id 
    });

    return res.status(200).json({
      success: true,
      message: 'Team sync operation started',
      taskId: task.id
    });
  } catch (error) {
    logger.error('Error starting team sync operation', { 
      eventId, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}

export default withCORS(withAuth(handler));
