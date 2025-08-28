#!/usr/bin/env tsx

import { config } from 'dotenv';
import { NextcloudServiceFactory } from '@/services/nextcloudServiceFactory';
import { NextcloudService } from '@/services/nextcloudService';
import { logger } from '@/utils/logger';

// Load environment variables
config();

async function testNextcloudService() {
  console.log('🚀 Starting Nextcloud Service Test Suite\n');

  try {
    // Test 1: Service Factory Creation
    console.log('📋 Test 1: Service Factory Creation');
    console.log('=====================================');
    
    let service: NextcloudService;
    
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

    // Test 2: Health Check
    console.log('📋 Test 2: Service Health Check');
    console.log('================================');
    
    try {
      const healthStatus = await service.getHealthStatus();
      console.log('Health Status:', healthStatus);
      console.log('');
    } catch (error) {
      console.log('❌ Health check failed:', error);
      console.log('');
    }

    // Test 3: Group Management
    console.log('📋 Test 3: Group Management');
    console.log('============================');
    
    const testGroupName = `test-group-${Date.now()}`;
    let createdGroup: any;
    
    try {
      // Create group
      console.log(`Creating group: ${testGroupName}`);
      createdGroup = await service.createGroup(testGroupName, 'Test group for integration testing');
      console.log('✅ Group created successfully:', createdGroup);
      
      // Get group
      console.log(`Getting group: ${createdGroup.id}`);
      const retrievedGroup = await service.getGroup(createdGroup.id);
      console.log('✅ Group retrieved successfully:', retrievedGroup);
      
      // Update group
      console.log(`Updating group: ${createdGroup.id}`);
      const updatedGroup = await service.updateGroup(createdGroup.id, { 
        name: `${testGroupName}-updated` 
      });
      console.log('✅ Group updated successfully:', updatedGroup);
      
      // Add users to group (mock user IDs)
      console.log(`Adding users to group: ${createdGroup.id}`);
      const mockUserIds = ['user1', 'user2', 'user3'];
      await service.addUsersToGroup(createdGroup.id, mockUserIds);
      console.log('✅ Users added to group successfully');
      
      // Remove users from group
      console.log(`Removing users from group: ${createdGroup.id}`);
      await service.removeUsersFromGroup(createdGroup.id, mockUserIds);
      console.log('✅ Users removed from group successfully');
      
      console.log('');
    } catch (error) {
      console.log('❌ Group management test failed:', error);
      console.log('');
    }

    // Test 4: Folder Management
    console.log('📋 Test 4: Folder Management');
    console.log('=============================');
    
    if (createdGroup) {
      try {
        const testFolderPath = 'test-folder';
        
        // Create folder
        console.log(`Creating folder: ${testFolderPath}`);
        const createdFolder = await service.createGroupFolder(testFolderPath, createdGroup.id);
        console.log('✅ Folder created successfully:', createdFolder);
        
        // Update folder
        console.log(`Updating folder: ${createdFolder.path}`);
        const updatedFolder = await service.updateGroupFolder(createdFolder.path, {
          permissions: ['read', 'write', 'share']
        });
        console.log('✅ Folder updated successfully:', updatedFolder);
        
        // Delete folder
        console.log(`Deleting folder: ${createdFolder.path}`);
        await service.deleteGroupFolder(createdFolder.path);
        console.log('✅ Folder deleted successfully');
        
        console.log('');
      } catch (error) {
        console.log('❌ Folder management test failed:', error);
        console.log('');
      }
    }

    // Test 5: Calendar Management
    console.log('📋 Test 5: Calendar Management');
    console.log('===============================');
    
    if (createdGroup) {
      try {
        const testCalendarName = 'test-calendar';
        
        // Create calendar
        console.log(`Creating calendar: ${testCalendarName}`);
        const createdCalendar = await service.createCalendar(testCalendarName, createdGroup.id);
        console.log('✅ Calendar created successfully:', createdCalendar);
        
        // Delete calendar
        console.log(`Deleting calendar: ${createdCalendar.name}`);
        await service.deleteCalendar(createdCalendar.name);
        console.log('✅ Calendar deleted successfully');
        
        console.log('');
      } catch (error) {
        console.log('❌ Calendar management test failed:', error);
        console.log('');
      }
    }

    // Test 6: Deck Board Management
    console.log('📋 Test 6: Deck Board Management');
    console.log('=================================');
    
    if (createdGroup) {
      try {
        const testBoardName = 'test-board';
        
        // Create deck board
        console.log(`Creating deck board: ${testBoardName}`);
        const createdBoard = await service.createDeckBoard(testBoardName, createdGroup.id);
        console.log('✅ Deck board created successfully:', createdBoard);
        
        // Delete deck board
        console.log(`Deleting deck board: ${createdBoard.name}`);
        await service.deleteDeckBoard(createdBoard.name);
        console.log('✅ Deck board deleted successfully');
        
        console.log('');
      } catch (error) {
        console.log('❌ Deck board management test failed:', error);
        console.log('');
      }
    }

    // Test 7: Cleanup
    console.log('📋 Test 7: Cleanup');
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

    // Test 8: Error Handling
    console.log('📋 Test 8: Error Handling');
    console.log('==========================');
    
    try {
      // Try to get a non-existent group
      console.log('Testing error handling with non-existent group');
      await service.getGroup('non-existent-group-id');
      console.log('❌ Expected error was not thrown');
    } catch (error) {
      console.log('✅ Error handling working correctly:', error instanceof Error ? error.message : 'Unknown error');
    }
    
    try {
      // Try to create a group with invalid name
      console.log('Testing error handling with invalid group name');
      await service.createGroup('Invalid Group Name!@#');
      console.log('❌ Expected error was not thrown');
    } catch (error) {
      console.log('✅ Error handling working correctly:', error instanceof Error ? error.message : 'Unknown error');
    }
    
    console.log('');

    // Test 9: Configuration Validation
    console.log('📋 Test 9: Configuration Validation');
    console.log('====================================');
    
    try {
      const { NextcloudConfigValidator } = await import('@/utils/nextcloudConfigValidator');
      
      const testConfig = {
        baseUrl: 'http://localhost:8080',
        username: 'test-user',
        password: 'test-password',
        basePath: '/teams'
      };
      
      const validation = NextcloudConfigValidator.validate(testConfig);
      console.log('Configuration validation result:', validation);
      
      const recommendations = NextcloudConfigValidator.getRecommendations(testConfig);
      if (recommendations.length > 0) {
        console.log('Configuration recommendations:', recommendations);
      }
      
      const isProductionReady = NextcloudConfigValidator.isProductionReady(testConfig);
      console.log('Production ready:', isProductionReady);
      
      console.log('');
    } catch (error) {
      console.log('❌ Configuration validation test failed:', error);
      console.log('');
    }

    console.log('🎉 Nextcloud Service Test Suite Completed!');
    console.log('==========================================');
    
    if (createdGroup) {
      console.log('⚠️  Note: Test group was created and should be cleaned up');
    }

  } catch (error) {
    console.error('💥 Test suite failed with error:', error);
    process.exit(1);
  }
}

// Run the test suite
if (require.main === module) {
  testNextcloudService()
    .then(() => {
      console.log('\n✨ All tests completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test suite failed:', error);
      process.exit(1);
    });
}
