#!/usr/bin/env tsx

// Load environment variables from .env file
import dotenv from 'dotenv';
import path from 'path';

// Load .env file from the backend directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import { WikiJsServiceFactory } from '@/services/wikijsServiceFactory';
import { logger } from '@/utils/logger';

/**
 * Cleanup script to delete Wiki.js groups with IDs 6-55
 * This removes test groups that were created during testing
 */

async function cleanupWikiJsGroups() {
  console.log('🧹 Cleaning up Wiki.js groups 6-55...\n');

  try {
    // Create Wiki.js service
    console.log('1️⃣ Creating Wiki.js service...');
    const service = WikiJsServiceFactory.createServiceFromEnv();
    console.log('✅ Wiki.js service created successfully\n');

    // Get all groups first to see what we're working with
    console.log('2️⃣ Getting current groups...');
    const allGroups = await service.apiClient.getGroups();
    console.log(`✅ Found ${allGroups.length} groups total\n`);

    // Filter groups with IDs 6-55
    const groupsToDelete = allGroups.filter(group => {
      const groupId = parseInt(group.id);
      return groupId >= 6 && groupId <= 55;
    });

    console.log(`3️⃣ Found ${groupsToDelete.length} groups to delete (IDs 6-55):`);
    groupsToDelete.forEach(group => {
      console.log(`   - ID: ${group.id}, Name: ${group.name}, System: ${group.isSystem}`);
    });
    console.log('');

    if (groupsToDelete.length === 0) {
      console.log('✅ No groups found in the specified range to delete');
      return;
    }

    // Delete each group
    console.log('4️⃣ Deleting groups...');
    let deletedCount = 0;
    let failedCount = 0;

    for (const group of groupsToDelete) {
      try {
        // Skip system groups
        if (group.isSystem) {
          console.log(`   ⏭️  Skipping system group: ${group.name} (ID: ${group.id})`);
          continue;
        }

        console.log(`   🗑️  Deleting group: ${group.name} (ID: ${group.id})`);
        
        // Actually delete the group
        await service.deleteGroup(group.id);
        console.log(`   ✅ Successfully deleted group: ${group.name} (ID: ${group.id})`);
        deletedCount++;
        
        // Add a small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.log(`   ❌ Failed to delete group ${group.name} (ID: ${group.id}):`, error instanceof Error ? error.message : 'Unknown error');
        failedCount++;
      }
    }

    console.log('\n5️⃣ Cleanup Summary:');
    console.log(`   ✅ Groups processed: ${groupsToDelete.length}`);
    console.log(`   🗑️  Groups marked for deletion: ${deletedCount}`);
    console.log(`   ❌ Failed deletions: ${failedCount}`);
    console.log(`   ⏭️  System groups skipped: ${groupsToDelete.filter(g => g.isSystem).length}`);

    console.log('\n✅ Note: Groups have been successfully deleted using the deleteGroup method.');

  } catch (error) {
    console.error('\n💥 Cleanup failed with error:', error);
    process.exit(1);
  }
}

// Run the cleanup if this script is executed directly
if (require.main === module) {
  cleanupWikiJsGroups()
    .then(() => {
      console.log('\n✨ Cleanup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Cleanup failed:', error);
      process.exit(1);
    });
}
