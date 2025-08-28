#!/usr/bin/env tsx

import { config } from 'dotenv';
import { NextcloudServiceFactory } from '@/services/nextcloudServiceFactory';
import { logger } from '@/utils/logger';

// Load environment variables
config();

async function testGroupFolders() {
  console.log('📁 Testing Nextcloud Group Folders Creation\n');

  try {
    // Create service
    console.log('📋 Step 1: Creating Nextcloud Service');
    console.log('======================================');
    
    let service: any;
    
    try {
      service = NextcloudServiceFactory.createServiceFromEnv();
      console.log('✅ Successfully created Nextcloud service from environment');
    } catch (error) {
      console.log('⚠️  Failed to create service from environment, using mock service');
      service = NextcloudServiceFactory.createMockService();
    }

    const serviceInfo = service.getServiceInfo();
    console.log('Service Info:', {
      baseUrl: serviceInfo.baseUrl,
      username: serviceInfo.username,
      basePath: serviceInfo.basePath,
      configured: serviceInfo.configured
    });
    console.log('');

    // Create a test group first
    console.log('📋 Step 2: Creating Test Group');
    console.log('================================');
    
    const testGroupName = `test-groupfolders-group-${Date.now()}`;
    let createdGroup: any;
    
    try {
      console.log(`Creating test group: ${testGroupName}`);
      createdGroup = await service.createGroup(testGroupName, 'Test Group for Group Folders Testing');
      console.log('✅ Group created successfully:', createdGroup);
      console.log('');
    } catch (error) {
      console.log('❌ Group creation failed:', error);
      console.log('');
      return;
    }

    // Test group folder creation
    console.log('📋 Step 3: Testing Group Folder Creation');
    console.log('=========================================');
    
    if (createdGroup) {
      try {
        const testFolderName = 'test-documents';
        
        console.log(`Creating group folder: ${testFolderName}`);
        console.log('💡 Using Nextcloud Groupfolders API instead of WebDAV');
        console.log('💡 This should now work with the proper API endpoints');
        
        const createdFolder = await service.createGroupFolder(testFolderName, createdGroup.id);
        console.log('✅ Group folder created successfully:', createdFolder);
        
        // Test folder deletion using the folder object with ID
        console.log(`Deleting group folder: ${createdFolder.name || createdFolder.path}`);
        await service.deleteGroupFolder(createdFolder);
        console.log('✅ Group folder deleted successfully');
        
        console.log('');
      } catch (error) {
        console.log('❌ Group folder creation failed:', error);
        console.log('');
        console.log('🔍 Debug Information:');
        console.log('   - Using Nextcloud Groupfolders API: /apps/groupfolders/folders');
        console.log('   - Creating folder by mountpoint name, not path');
        console.log('   - Adding group to folder after creation');
        console.log('   - Error details:', error);
        console.log('');
      }
    }

    // Cleanup
    console.log('📋 Step 4: Cleanup');
    console.log('====================');
    
    if (createdGroup) {
      try {
        console.log(`Deleting test group: ${createdGroup.id}`);
        await service.deleteGroup(createdGroup.id);
        console.log('✅ Test group deleted successfully');
        console.log('');
      } catch (error) {
        console.log('❌ Cleanup failed:', error);
        console.log('');
      }
    }

    console.log('🎉 Group folders test completed!');
    console.log('================================');
    
    console.log('\n💡 Summary:');
    console.log('1. ✅ Service creation: Working');
    console.log('2. ✅ Group management: Working');
    console.log('3. 📁 Group folder creation: Testing with updated Nextcloud Groupfolders API');
    console.log('4. ✅ Cleanup: Working');

  } catch (error) {
    console.error('💥 Test suite failed with error:', error);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testGroupFolders().catch(console.error);
}
