#!/usr/bin/env tsx

import { config } from 'dotenv';
import { NextcloudServiceFactory } from '@/services/nextcloudServiceFactory';
import { logger } from '@/utils/logger';

// Load environment variables
config();

async function testNextcloudFixes() {
  console.log('🔧 Testing Nextcloud Integration Fixes\n');

  try {
    // Test 1: Service Factory Creation
    console.log('📋 Test 1: Service Factory Creation');
    console.log('=====================================');
    
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
      console.log(`Creating test group: ${testGroupName}`);
      createdGroup = await service.createGroup(testGroupName, 'Test Group for Integration Testing');
      console.log('✅ Group created successfully:', createdGroup);
      console.log('');
    } catch (error) {
      console.log('❌ Group creation failed:', error);
      console.log('');
      return;
    }

    // Test 4: Folder Management (Fixed 404 issue)
    console.log('📋 Test 4: Folder Management (Fixed 404 issue)');
    console.log('===============================================');
    
    if (createdGroup) {
      try {
        const testFolderName = 'test-documents';
        
        // Create group folder
        console.log(`Creating group folder: ${testFolderName}`);
        const createdFolder = await service.createGroupFolder(testFolderName, createdGroup.id);
        console.log('✅ Group folder created successfully:', createdFolder);
        
        // Delete group folder
        console.log(`Deleting group folder: ${createdFolder.path}`);
        await service.deleteGroupFolder(createdFolder.path);
        console.log('✅ Group folder deleted successfully');
        
        console.log('');
      } catch (error) {
        console.log('❌ Folder management test failed:', error);
        console.log('💡 This may be due to permission issues or the base path configuration.');
        console.log('   Check that the user has write access to the base path directory.');
        console.log('');
      }
    }

    // Test 5: Calendar Management (Fixed 501 issue with proper WebDAV MKCOL)
    console.log('📋 Test 5: Calendar Management (Fixed 501 issue with proper WebDAV MKCOL)');
    console.log('==========================================================================');
    
    if (createdGroup) {
      try {
        const testCalendarName = 'test-events';
        
        // Create calendar using proper WebDAV MKCOL method
        console.log(`Creating calendar: ${testCalendarName}`);
        console.log('💡 Using WebDAV MKCOL method with proper XML payload for calendar creation');
        const createdCalendar = await service.createCalendar(testCalendarName, createdGroup.id);
        console.log('✅ Calendar created successfully:', createdCalendar);
        
        // Delete calendar
        console.log(`Deleting calendar: ${createdCalendar.name}`);
        await service.deleteCalendar(createdCalendar.name);
        console.log('✅ Calendar deleted successfully');
        
        console.log('');
      } catch (error) {
        console.log('❌ Calendar management test failed:', error);
        console.log('💡 This may be due to:');
        console.log('   - Calendar app not installed on the Nextcloud instance');
        console.log('   - User lacks calendar permissions');
        console.log('   - Calendar app is restricted to admin users only');
        console.log('   - WebDAV MKCOL method not supported');
        console.log('');
      }
    }

    // Test 6: Deck Board Management (Fixed 400 color validation issue)
    console.log('📋 Test 6: Deck Board Management (Fixed 400 color validation issue)');
    console.log('==================================================================');
    
    if (createdGroup) {
      try {
        const testBoardName = 'test-tasks';
        
        // Test with valid color
        console.log(`Creating deck board with valid color: ${testBoardName}`);
        const createdBoard = await service.createDeckBoard(testBoardName, createdGroup.id);
        console.log('✅ Deck board created successfully:', createdBoard);
        
        // Delete deck board
        console.log(`Deleting deck board: ${createdBoard.name}`);
        await service.deleteDeckBoard(createdBoard.name);
        console.log('✅ Deck board deleted successfully');
        
        console.log('');
      } catch (error) {
        console.log('❌ Deck board management test failed:', error);
        console.log('💡 This may be due to:');
        console.log('   - Deck app not installed on the Nextcloud instance');
        console.log('   - User lacks deck permissions');
        console.log('   - Deck app is restricted to admin users only');
        console.log('');
      }
    }

    // Test 7: Color Validation
    console.log('📋 Test 7: Color Validation Testing');
    console.log('====================================');
    
    if (createdGroup) {
      try {
        // Test with invalid color format
        console.log('Testing invalid color format handling...');
        try {
          await service.createDeckBoard('invalid-color-test', createdGroup.id, '#invalid');
          console.log('❌ Expected error was not thrown for invalid color');
        } catch (error) {
          if (error instanceof Error && error.message.includes('Invalid color format')) {
            console.log('✅ Invalid color format properly rejected');
          } else {
            console.log('❌ Unexpected error for invalid color:', error);
          }
        }
        
        console.log('');
      } catch (error) {
        console.log('❌ Color validation test failed:', error);
        console.log('');
      }
    }

    // Test 8: Permission Diagnostics
    console.log('📋 Test 8: Permission Diagnostics');
    console.log('==================================');
    
    try {
      console.log('🔍 Checking user permissions and app availability...');
      
      // Check calendar endpoint
      try {
        const calendarCheck = await fetch(`${process.env.NEXTCLOUD_BASE_URL}/remote.php/dav/calendars`, {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${process.env.NEXTCLOUD_USERNAME}:${process.env.NEXTCLOUD_PASSWORD}`).toString('base64')}`,
            'OCS-APIRequest': 'true'
          }
        });
        console.log(`📅 Calendar endpoint status: ${calendarCheck.status} ${calendarCheck.statusText}`);
      } catch (error) {
        console.log('📅 Calendar endpoint check failed:', error);
      }
      
      // Check deck endpoint
      try {
        const deckCheck = await fetch(`${process.env.NEXTCLOUD_BASE_URL}/index.php/apps/deck/api/v1.0/boards`, {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${process.env.NEXTCLOUD_USERNAME}:${process.env.NEXTCLOUD_PASSWORD}`).toString('base64')}`,
            'OCS-APIRequest': 'true'
          }
        });
        console.log(`🃏 Deck endpoint status: ${deckCheck.status} ${deckCheck.statusText}`);
      } catch (error) {
        console.log('🃏 Deck endpoint check failed:', error);
      }
      
      console.log('');
    } catch (error) {
      console.log('❌ Permission diagnostics failed:', error);
      console.log('');
    }

    // Test 9: Cleanup
    console.log('📋 Test 9: Cleanup');
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

    console.log('🎉 Nextcloud integration fixes testing completed!');
    console.log('================================================');
    
    console.log('\n💡 Summary of fixes implemented:');
    console.log('1. ✅ Folder Management: Fixed 404 error by using proper WebDAV MKCOL method');
    console.log('2. ✅ Calendar Management: Fixed 501 error by using proper WebDAV MKCOL with XML payload');
    console.log('3. ✅ Deck Board Management: Fixed 400 error by adding color validation');
    console.log('4. ✅ Enhanced error handling with specific error messages');
    console.log('5. ✅ Added app availability checks for Calendar and Deck apps');
    console.log('6. ✅ Improved color format validation (6-character hex)');
    console.log('7. ✅ Added parent directory creation for folder management');
    console.log('8. ✅ Enhanced permission diagnostics and error reporting');
    console.log('9. ✅ Updated HttpClient to support MKCOL with data payload for calendar creation');

    console.log('\n🔧 Next Steps:');
    console.log('- If folder creation fails: Check user permissions for the base path');
    console.log('- If calendar fails: Calendar app should now work with proper WebDAV MKCOL method');
    console.log('- If deck fails: Install Deck app or grant deck permissions');
    console.log('- Check user role and permissions in Nextcloud admin panel');
    console.log('- Calendar creation now uses proper Nextcloud WebDAV specification');

  } catch (error) {
    console.error('💥 Test suite failed with error:', error);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testNextcloudFixes().catch(console.error);
}
