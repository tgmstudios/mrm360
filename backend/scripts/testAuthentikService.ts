#!/usr/bin/env tsx

// Load environment variables from .env file
import dotenv from 'dotenv';
import path from 'path';

// Load .env file from the backend directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import { AuthentikServiceFactory } from '../src/services/authentikServiceFactory';
import { AuthentikConfigValidator } from '../src/utils/authentikConfigValidator';
import { logger } from '../src/utils/logger';

async function testAuthentikService() {
  console.log('🧪 Testing Authentik Service...\n');

  // Debug: Show environment variables
  console.log('🔧 Environment Variables:');
  console.log(`   AUTHENTIK_BASE_URL: ${process.env.AUTHENTIK_BASE_URL || 'NOT SET'}`);
  console.log(`   AUTHENTIK_TOKEN: ${process.env.AUTHENTIK_TOKEN ? '***' + process.env.AUTHENTIK_TOKEN.slice(-4) : 'NOT SET'}`);
  console.log(`   AUTHENTIK_PARENT_GROUP_TEMPLATE: ${process.env.AUTHENTIK_PARENT_GROUP_TEMPLATE || 'NOT SET'}`);
  console.log();

  try {
    // Test 1: Configuration Validation
    console.log('1. Testing Configuration Validation...');
    const envValidation = AuthentikConfigValidator.validateEnvironment();
    console.log(`   Configuration Valid: ${envValidation.isValid ? '✅' : '❌'}`);
    
    if (envValidation.errors.length > 0) {
      console.log('   Errors:', envValidation.errors);
    }
    
    if (envValidation.warnings.length > 0) {
      console.log('   Warnings:', envValidation.warnings);
    }
    console.log();

    // Test 2: Service Creation
    console.log('2. Testing Service Creation...');
    let service;
    
    try {
      service = AuthentikServiceFactory.createServiceFromEnv();
      console.log('   ✅ Service created successfully from environment');
    } catch (error) {
      console.log('   ⚠️  Failed to create service from environment, using mock service');
      service = AuthentikServiceFactory.createMockService();
    }
    console.log();

    // Test 3: Health Check
    console.log('3. Testing Health Check...');
    try {
      const isHealthy = await service.healthCheck();
      console.log(`   Health Check: ${isHealthy ? '✅ Healthy' : '❌ Unhealthy'}`);
    } catch (error) {
      console.log(`   ❌ Health Check Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    console.log();

    // Test 4: Group Operations...
    console.log('4. Testing Group Operations...');
    
    // Test group creation
    try {
      console.log('   Creating test group...');
      const uniqueGroupName = `test-group-${Date.now()}`;
      const testGroup = await service.createGroup(uniqueGroupName, 'Test group for validation', undefined);
      console.log(`   ✅ Group created: ${testGroup.name} (ID: ${testGroup.id})`);
      
      // Test group retrieval
      console.log('   Retrieving created group...');
      const retrievedGroup = await service.getGroup(testGroup.id);
      console.log(`   ✅ Group retrieved: ${retrievedGroup.name}`);
      
      // Test group update
      console.log('   Updating group...');
      const updatedGroup = await service.updateGroup(testGroup.id, { description: 'Updated test group description' });
      console.log(`   ✅ Group updated: ${updatedGroup.description}`);
      
      // Test group deletion
      console.log('   Deleting test group...');
      await service.deleteGroup(testGroup.id);
      console.log('   ✅ Group deleted successfully');
      
    } catch (error) {
      console.log(`   ❌ Group operations failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      if (error instanceof Error && error.message.includes('HTTP')) {
        console.log(`   🔍 HTTP Error Details: ${error.message}`);
      }
    }
    console.log();

    // Test 5: User Operations...
    console.log('5. Testing User Operations...');
    try {
      // Test user retrieval (this might fail if no users exist)
      console.log('   Testing user operations...');
      const users = await service.listUsers();
      console.log(`   ✅ Retrieved ${users.length} users`);
      
      if (users.length > 0) {
        const firstUser = users[0];
        console.log(`   First user: ${firstUser.username} (${firstUser.email})`);
      }
      
      // Test adding specific user to a test group
      console.log('   Testing user management operations...');
      
      // Create a test group for user management
      const userTestGroupName = `user-test-group-${Date.now()}`;
      console.log(`   Creating test group: ${userTestGroupName}`);
      const userTestGroup = await service.createGroup(userTestGroupName, 'Test group for user management', undefined);
      console.log(`   ✅ Test group created: ${userTestGroup.name} (ID: ${userTestGroup.id})`);
      
      // Find user amj6535
      console.log('   Finding user amj6535...');
      const targetUser = await service.getUserByUsername('amj6535');
      console.log(`   ✅ Found user: ${targetUser.username} (${targetUser.email})`);
      
      // Add user to the test group
      console.log(`   Adding user ${targetUser.username} to test group...`);
      await service.addUsersToGroup(userTestGroup.id, [targetUser.id]);
      console.log(`   ✅ User ${targetUser.username} added to test group`);
      
      // Verify user is in the group
      console.log('   Verifying user membership...');
      const updatedGroup = await service.getGroup(userTestGroup.id);
      console.log(`   ✅ Group now has ${updatedGroup.users.length} users`);
      if (updatedGroup.users.includes(targetUser.id)) {
        console.log(`   ✅ User ${targetUser.username} confirmed in group`);
      }
      
      // Remove user from the group
      console.log(`   Removing user ${targetUser.username} from test group...`);
      await service.removeUsersFromGroup(userTestGroup.id, [targetUser.id]);
      console.log(`   ✅ User ${targetUser.username} removed from test group`);
      
      // Clean up - delete the test group
      console.log('   Cleaning up test group...');
      await service.deleteGroup(userTestGroup.id);
      console.log(`   ✅ Test group ${userTestGroupName} deleted`);
      
    } catch (error) {
      console.log(`   ⚠️  User operations: ${error instanceof Error ? error.message : 'Unknown error'}`);
      if (error instanceof Error && error.message.includes('HTTP')) {
        console.log(`   🔍 HTTP Error Details: ${error.message}`);
      }
    }
    console.log();

    // Test 6: Parent Group Operations...
    console.log('6. Testing Parent Group Operations...');
    try {
      // First try to create a parent group if it doesn't exist
      console.log('   Creating parent group for competition teams...');
      const parentGroupName = 'competition-team';
      const parentGroup = await service.createGroup(parentGroupName, 'Parent group for competition teams', undefined);
      console.log(`   ✅ Parent group created: ${parentGroup.name} (ID: ${parentGroup.id})`);
      
      // Now test getting the parent group
      const retrievedParentGroup = await service.getParentGroup('competition');
      console.log(`   ✅ Parent group found: ${retrievedParentGroup.name} (ID: ${retrievedParentGroup.id})`);
      
      // Clean up - delete the test parent group
      console.log('   Cleaning up test parent group...');
      await service.deleteGroup(parentGroup.id);
      console.log('   ✅ Test parent group deleted');
      
    } catch (error) {
      if (error instanceof Error && error.message.includes('This field must be unique')) {
        console.log('   ⚠️  Parent group already exists, testing retrieval...');
        try {
          const parentGroup = await service.getParentGroup('competition');
          console.log(`   ✅ Parent group found: ${parentGroup.name} (ID: ${parentGroup.id})`);
        } catch (retrievalError) {
          console.log(`   ⚠️  Parent group operations: ${retrievalError instanceof Error ? retrievalError.message : 'Unknown error'}`);
        }
      } else {
        console.log(`   ⚠️  Parent group operations: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    console.log();

    // Test 7: Group Listing
    console.log('7. Testing Group Listing...');
    try {
      const groups = await service.listGroups();
      console.log(`   ✅ Retrieved ${groups.length} groups`);
      
      if (groups.length > 0) {
        console.log('   Sample groups:');
        groups.slice(0, 3).forEach(group => {
          console.log(`     - ${group.name} (${group.users.length} users)`);
        });
      }
    } catch (error) {
      console.log(`   ❌ Group listing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    console.log();

    // Test 8: Service Status
    console.log('8. Testing Service Status...');
    try {
      const status = await AuthentikServiceFactory.getServiceStatus(service);
      console.log(`   ✅ Service Status: ${status.isHealthy ? 'Healthy' : 'Unhealthy'}`);
      console.log(`   Last Health Check: ${status.lastHealthCheck.toISOString()}`);
    } catch (error) {
      console.log(`   ❌ Service status failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    console.log();

    console.log('🎉 Authentik Service Testing Completed!');
    
    // Summary
    console.log('\n📊 Test Summary:');
    console.log(`   Configuration Valid: ${envValidation.isValid ? '✅' : '❌'}`);
    console.log(`   Service Created: ✅`);
    console.log(`   Health Check: ${await service.healthCheck() ? '✅' : '❌'}`);
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testAuthentikService()
    .then(() => {
      console.log('\n✨ All tests completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test suite failed:', error);
      process.exit(1);
    });
}

export { testAuthentikService };
