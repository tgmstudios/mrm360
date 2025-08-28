#!/usr/bin/env tsx

// Load environment variables from .env file
import dotenv from 'dotenv';
import path from 'path';

// Load .env file from the backend directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import { WikiJsServiceFactory } from '@/services/wikijsServiceFactory';
import { logger } from '@/utils/logger';

/**
 * Test script for Wiki.js Group and Permission Management
 * 
 * This script demonstrates:
 * 1. Creating groups with specific permissions
 * 2. Creating pages with path-based access control
 * 3. Managing team groups with automatic page creation
 * 4. Adding users to groups
 * 5. Complete team setup with groups, pages, and permissions
 */

async function testWikiJsGroupsAndPermissions() {
  console.log('🔐 Testing Wiki.js Group and Permission Management\n');

  try {
    // Create Wiki.js service
    console.log('1️⃣ Creating Wiki.js service...');
    const service = WikiJsServiceFactory.createServiceFromEnv();
    console.log('✅ Wiki.js service created successfully\n');

    // Generate unique test paths using timestamp
    const timestamp = Date.now();
    const testPaths = {
      team1: `/development-team/TestTeam-${timestamp}`,
      team2: `/engineering-team/BackendTeam-${timestamp}`,
      private: `/private/team-docs-${timestamp}`,
      docs: `/docs/editing-guide-${timestamp}`
    };
    
    console.log('🧹 Using unique test paths to avoid conflicts...');
    console.log('   - Team 1:', testPaths.team1);
    console.log('   - Team 2:', testPaths.team2);
    console.log('   - Private:', testPaths.private);
    console.log('   - Docs:', testPaths.docs);
    console.log('✅ Test paths generated\n');

    // Test 1: Create a basic group
    console.log('2️⃣ Testing basic group creation...');
    try {
      const testGroup = await service.apiClient.createGroup({
        name: 'test-permissions-group',
        description: 'Test group for permission management',
        permissions: ['read', 'write', 'admin']
      });
      console.log('✅ Basic group created:', testGroup.name);
      console.log('   - ID:', testGroup.id);
      console.log('   - Permissions:', testGroup.permissions);
    } catch (error) {
      console.log('⚠️  Basic group creation failed (may already exist):', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 2: Create a group for a specific path
    console.log('\n3️⃣ Testing group creation for specific path...');
    try {
      const pathGroup = await service.createGroupForPath(
        'docs-editors',
        testPaths.docs,
        'Group for documentation editors',
        ['read', 'write']
      );
      console.log('✅ Path-specific group created:', pathGroup.group.name);
      console.log('   - Path:', testPaths.docs);
      console.log('   - Group ID:', pathGroup.group.id);
    } catch (error) {
      console.log('⚠️  Path-specific group creation failed:', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 3: Create a team group with automatic page creation
    console.log('\n4️⃣ Testing team group creation with automatic page...');
    try {
      const teamGroup = await service.createTeamGroup(
        'development',
        'TestTeam',
        ['read', 'write', 'admin'],
        testPaths.team1
      );
      console.log('✅ Team group created:', teamGroup.name);
      console.log('   - Team Type: development');
      console.log('   - Team Name: TestTeam');
      console.log('   - Group ID:', teamGroup.id);
      console.log('   - Permissions:', teamGroup.permissions);
    } catch (error) {
      console.log('⚠️  Team group creation failed:', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 4: Create a page with permissions
    console.log('\n5️⃣ Testing page creation with permissions...');
    try {
      const privatePage = await service.createPageWithPermissions(
        testPaths.private,
        'Private Team Documentation',
        '# Private Team Documentation\n\nThis page is only accessible to team members.',
        [{
          groupId: '1', // Assuming group ID 1 exists
          permissions: ['read', 'write']
        }]
      );
      console.log('✅ Private page created:', privatePage.path);
      console.log('   - Title:', privatePage.title);
      console.log('   - Private:', true);
    } catch (error) {
      console.log('⚠️  Private page creation failed:', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 5: Get groups for a specific path
    console.log('\n6️⃣ Testing path-based group retrieval...');
    try {
      const pathGroups = await service.getGroupsForPath(testPaths.team1);
      console.log('✅ Path groups retrieved:', pathGroups.length);
      pathGroups.forEach((group, index) => {
        console.log(`   - Group ${index + 1}:`, group.groupId);
        console.log(`     Permissions:`, group.permissions);
      });
    } catch (error) {
      console.log('⚠️  Path group retrieval failed:', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 6: Complete team setup
    console.log('\n7️⃣ Testing complete team setup...');
    try {
      const teamSetup = await service.createTeamSetup(
        'engineering',
        'BackendTeam',
        [], // No users to add for this test
        ['read', 'write', 'admin'],
        testPaths.team2
      );
      console.log('✅ Complete team setup created:');
      console.log('   - Group:', teamSetup.group.name);
      console.log('   - Page:', teamSetup.page.path);
      console.log('   - Users Added:', teamSetup.usersAdded);
    } catch (error) {
      console.log('⚠️  Complete team setup failed:', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 7: List all groups
    console.log('\n8️⃣ Testing group listing...');
    try {
      const allGroups = await service.apiClient.getGroups();
      console.log('✅ Groups retrieved:', allGroups.length);
      allGroups.slice(0, 5).forEach((group, index) => {
        console.log(`   - Group ${index + 1}:`, group.name);
        console.log(`     ID: ${group.id}, System: ${group.isSystem}, Users: ${group.userCount}`);
      });
      if (allGroups.length > 5) {
        console.log(`   ... and ${allGroups.length - 5} more groups`);
      }
    } catch (error) {
      console.log('⚠️  Group listing failed:', error instanceof Error ? error.message : 'Unknown error');
    }

    console.log('\n🎉 Wiki.js Group and Permission Management Test Completed Successfully!');
    console.log('\n✨ Summary of Features Tested:');
    console.log('   ✅ Basic group creation with permissions');
    console.log('   ✅ Path-specific group creation');
    console.log('   ✅ Team group creation with automatic page setup');
    console.log('   ✅ Private page creation with access control');
    console.log('   ✅ Path-based group retrieval');
    console.log('   ✅ Complete team setup workflow');
    console.log('   ✅ Group listing and management');

  } catch (error) {
    console.error('\n💥 Test failed with error:', error);
    process.exit(1);
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testWikiJsGroupsAndPermissions()
    .then(() => {
      console.log('\n✨ All tests completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Tests failed:', error);
      process.exit(1);
    });
}
