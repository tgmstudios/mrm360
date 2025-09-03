#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client';
import { updateAllUserRolesFromGroups } from '../src/utils/roleUtils';
import { logger } from '../src/utils/logger';

const prisma = new PrismaClient();

async function main() {
  try {
    logger.info('Starting user role fix script');
    
    const result = await updateAllUserRolesFromGroups();
    
    logger.info('User role fix completed', result);
    
    console.log('✅ User roles updated successfully!');
    console.log(`📊 Results: ${result.updated} users updated, ${result.errors} errors`);
    
  } catch (error) {
    logger.error('Failed to fix user roles', { error });
    console.error('❌ Failed to fix user roles:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
