import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/models/prismaClient';
import { sessionManager } from '@/utils/sessionManager';
import { logger } from '@/utils/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: 'unknown',
        redis: 'unknown',
        sessionManager: 'unknown'
      }
    };

    // Check database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      health.checks.database = 'healthy';
    } catch (error) {
      health.checks.database = 'unhealthy';
      health.status = 'degraded';
      logger.error('Database health check failed', { error });
    }

    // Check Redis connection
    try {
      await sessionManager['redis'].ping();
      health.checks.redis = 'healthy';
    } catch (error) {
      health.checks.redis = 'unhealthy';
      health.status = 'degraded';
      logger.error('Redis health check failed', { error });
    }

    // Check session manager
    try {
      // Simple test to ensure session manager is working
      const testSession = await sessionManager.validateSession('test-session');
      health.checks.sessionManager = 'healthy';
    } catch (error) {
      health.checks.sessionManager = 'unhealthy';
      health.status = 'degraded';
      logger.error('Session manager health check failed', { error });
    }

    // Determine overall status
    const unhealthyChecks = Object.values(health.checks).filter(check => check === 'unhealthy').length;
    
    if (unhealthyChecks === 0) {
      health.status = 'healthy';
      res.status(200);
    } else if (unhealthyChecks < Object.keys(health.checks).length) {
      health.status = 'degraded';
      res.status(200);
    } else {
      health.status = 'unhealthy';
      res.status(503);
    }

    logger.info('Health check completed', { status: health.status, checks: health.checks });
    res.json(health);

  } catch (error) {
    logger.error('Health check failed', { error });
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      message: 'Internal server error during health check'
    });
  }
}
