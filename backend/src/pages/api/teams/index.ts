import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '../../../models/prismaClient';
import { TeamManager } from '../../../managers/teamManager';
import { TaskManager } from '@/managers/taskManager';
import { withCORS } from '../../../middleware/corsMiddleware';
import { withAuth } from '../../../middleware/authMiddleware';
import { withPermissions } from '../../../middleware/permissionMiddleware';
import { logger } from '../../../utils/logger';

// Validation schemas
const createTeamSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  teamType: z.enum(['COMPETITION', 'DEVELOPMENT']),
  competitionSubtype: z.enum(['BLUE', 'RED', 'CTF']).optional(),
  groupId: z.string().optional(),
  memberIds: z.array(z.string()).optional(),
  parentTeamId: z.string().optional(),
});

const listTeamsSchema = z.object({
  page: z.string().optional().transform(val => parseInt(val || '1')),
  limit: z.string().optional().transform(val => parseInt(val || '20')),
  search: z.string().optional(),
  teamType: z.enum(['COMPETITION', 'DEVELOPMENT']).optional(),
  competitionSubtype: z.enum(['BLUE', 'RED', 'CTF']).optional(),
  groupId: z.string().optional(),
  parentTeamId: z.string().optional(),
});

/**
 * @swagger
 * /api/teams:
 *   get:
 *     summary: List teams with filtering and pagination
 *     tags: [Teams]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of teams per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for team name
 *       - in: query
 *         name: teamType
 *         schema:
 *           type: string
 *           enum: [COMPETITION, DEVELOPMENT]
 *         description: Filter by team type
 *       - in: query
 *         name: competitionSubtype
 *         schema:
 *           type: string
 *           enum: [BLUE, RED, CTF]
 *         description: Filter by competition subtype
 *       - in: query
 *         name: groupId
 *         schema:
 *           type: string
 *         description: Filter by group
 *       - in: query
 *         name: parentTeamId
 *         schema:
 *           type: string
 *         description: Filter by parent team
 *     responses:
 *       200:
 *         description: List of teams
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 teams:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Team'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Create a new team
 *     tags: [Teams]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - teamType
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               description:
 *                 type: string
 *               teamType:
 *                 type: string
 *                 enum: [COMPETITION, DEVELOPMENT]
 *               competitionSubtype:
 *                 type: string
 *                 enum: [BLUE, RED, CTF]
 *               groupId:
 *                 type: string
 *               memberIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               parentTeamId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Team created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const teamManager = new TeamManager();
  const taskManager = new TaskManager();

  try {
    if (req.method === 'GET') {
      // List teams
      const queryParams = listTeamsSchema.parse(req.query);
      
      const result = await teamManager.getTeams({
        page: queryParams.page,
        limit: queryParams.limit,
        search: queryParams.search,
        type: queryParams.teamType as any,
        groupId: queryParams.groupId,
      } as any);

      res.status(200).json(result);
    } else if (req.method === 'POST') {
      // Create team
      const body = createTeamSchema.parse(req.body);
      
      // map fields to expected types
      const team = await teamManager.createTeam({
        name: body.name,
        description: body.description,
        type: body.teamType as any,
        subtype: body.competitionSubtype as any,
        parentTeamId: body.parentTeamId,
        groupId: body.groupId
      });

      // Enqueue simulated provisioning task with subtasks linked to this team
      const subtaskNames = [
        'Validate inputs and member eligibility',
        'Create internal records',
        'Setup Wiki (simulated)',
        'Setup GitHub (simulated)',
        'Setup Nextcloud (simulated)',
        'Create Discord channel (simulated)',
        'Sync Authentik groups (simulated)'
      ];
      await taskManager.enqueueProvisionTask({
        provisionType: 'TEAM',
        name: `Provision resources for team ${team.name}`,
        description: 'Simulated external resource setup',
        entityType: 'TEAM',
        entityId: team.id,
        subtaskNames,
        payload: { teamId: team.id }
      });

      res.status(201).json({ success: true, data: team });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Validation error in teams API', { errors: error.errors });
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    
    logger.error('Error in teams API', { error, method: req.method });
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Apply middleware: CORS, authentication then permissions
export default withCORS(
  withAuth(
    withPermissions(
      handler,
      ['teams:read', 'teams:create']
    )
  )
);
