#!/usr/bin/env tsx

import { config } from 'dotenv';
import { NextcloudServiceFactory } from '@/services/nextcloudServiceFactory';

// Load environment variables
config();

async function testNextcloudBasePath() {
  console.log('🔧 Testing Nextcloud Base Path Configuration\n');

  try {
    // Test with different base paths
    const basePaths = [
      '/mrm360/teams',
      '/mrm360',
      '/shared/teams',
      '/organizations/psuccso/teams'
    ];

    for (const basePath of basePaths) {
      console.log(`\n📁 Testing base path: ${basePath}`);
      console.log('='.repeat(50));
      
      try {
        // Create service with custom base path
        const service = NextcloudServiceFactory.createService({
          baseUrl: process.env.NEXTCLOUD_BASE_URL || 'https://nextcloud.psuccso.org',
          username: process.env.NEXTCLOUD_USERNAME || 'mrm360',
          password: process.env.NEXTCLOUD_PASSWORD || '2qRcRkPWQYE9hNSMLw9kz',
          basePath: basePath
        });

        // Test folder creation
        const testGroupName = `test-group-${Date.now()}`;
        console.log(`Creating test group: ${testGroupName}`);
        
        const createdGroup = await service.createGroup(testGroupName, 'Test Group');
        console.log('✅ Group created successfully');
        
        // Test folder creation
        try {
          console.log('Testing folder creation...');
          const folder = await service.createGroupFolder('test-docs', createdGroup.id);
          console.log('✅ Folder created successfully:', folder.path);
          
          // Clean up folder
          await service.deleteGroupFolder(folder.path);
          console.log('✅ Folder deleted successfully');
          
        } catch (folderError) {
          console.log('❌ Folder creation failed:', folderError instanceof Error ? folderError.message : 'Unknown error');
        }
        
        // Clean up group
        await service.deleteGroup(createdGroup.id);
        console.log('✅ Group deleted successfully');
        
        console.log(`✅ Base path ${basePath} is working correctly!`);
        
      } catch (error) {
        console.log(`❌ Base path ${basePath} failed:`, error instanceof Error ? error.message : 'Unknown error');
      }
    }

    console.log('\n🎉 Base path testing completed!');
    console.log('================================');
    
    console.log('\n💡 Recommendations:');
    console.log('1. Use a user-specific path like /mrm360/teams');
    console.log('2. Ensure the user has write access to the chosen path');
    console.log('3. Avoid using root directory (/) for security reasons');
    console.log('4. Test the chosen path before deploying to production');

  } catch (error) {
    console.error('💥 Test failed with error:', error);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testNextcloudBasePath().catch(console.error);
}
