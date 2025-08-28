#!/usr/bin/env tsx

// Load environment variables from .env file
import dotenv from 'dotenv';
import path from 'path';

// Load .env file from the backend directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import { WikiJsServiceFactory } from '@/services/wikijsServiceFactory';

/**
 * Example usage of Wiki.js Group and Permission Management
 * 
 * This script demonstrates practical use cases for:
 * - Creating teams with automatic group and page setup
 * - Managing access control for different documentation areas
 * - Setting up project-specific permissions
 * - Creating user groups for different roles
 */

async function exampleWikiJsGroupsAndPermissions() {
  console.log('📚 Wiki.js Group and Permission Management Examples\n');

  try {
    // Create Wiki.js service
    const service = WikiJsServiceFactory.createServiceFromEnv();
    console.log('✅ Wiki.js service created successfully\n');

    // Example 1: Create a development team with full setup
    console.log('🏗️  Example 1: Creating a Development Team');
    console.log('   This will create a group, team page, and set permissions automatically\n');
    
    try {
      const devTeam = await service.createTeamSetup(
        'development',
        'FrontendTeam',
        [], // User IDs would be added here in production
        ['read', 'write', 'admin']
      );
      
      console.log('✅ Development team created successfully:');
      console.log(`   - Group: ${devTeam.group.name}`);
      console.log(`   - Page: ${devTeam.page.path}`);
      console.log(`   - Access: Private with group permissions`);
      console.log(`   - Users Added: ${devTeam.usersAdded ? 'Yes' : 'No'}`);
    } catch (error) {
      console.log('⚠️  Development team creation failed:', error instanceof Error ? error.message : 'Unknown error');
    }

    // Example 2: Create a documentation editors group
    console.log('\n📝 Example 2: Creating Documentation Editors Group');
    console.log('   This creates a group specifically for managing documentation access\n');
    
    try {
      const docsGroup = await service.createGroupForPath(
        'documentation-editors',
        '/docs/technical',
        'Group for technical documentation editors',
        ['read', 'write']
      );
      
      console.log('✅ Documentation editors group created:');
      console.log(`   - Group: ${docsGroup.group.name}`);
      console.log(`   - Path: /docs/technical`);
      console.log(`   - Permissions: read, write`);
    } catch (error) {
      console.log('⚠️  Documentation editors group creation failed:', error instanceof Error ? error.message : 'Unknown error');
    }

    // Example 3: Create a project-specific group
    console.log('\n🚀 Example 3: Creating Project-Specific Group');
    console.log('   This creates a group for a specific project with its own documentation\n');
    
    try {
      const projectGroup = await service.createGroupForPath(
        'project-alpha-team',
        '/projects/alpha',
        'Team for Project Alpha development',
        ['read', 'write', 'admin']
      );
      
      console.log('✅ Project Alpha group created:');
      console.log(`   - Group: ${projectGroup.group.name}`);
      console.log(`   - Path: /projects/alpha`);
      console.log(`   - Permissions: read, write, admin`);
    } catch (error) {
      console.log('⚠️  Project Alpha group creation failed:', error instanceof Error ? error.message : 'Unknown error');
    }

    // Example 4: Create a private knowledge base
    console.log('\n🔒 Example 4: Creating Private Knowledge Base');
    console.log('   This creates a private page accessible only to specific groups\n');
    
    try {
      const privatePage = await service.createPageWithPermissions(
        '/internal/knowledge-base',
        'Internal Knowledge Base',
        `# Internal Knowledge Base

This is a private knowledge base accessible only to authorized team members.

## Available Resources
- Development Guidelines
- Architecture Decisions
- Team Processes
- Troubleshooting Guides

## Access Control
- Only members of authorized groups can view this content
- Content is not publicly accessible
- Changes are tracked and audited`,
        [{
          groupId: '1', // This would be the actual group ID in production
          permissions: ['read', 'write']
        }]
      );
      
      console.log('✅ Private knowledge base created:');
      console.log(`   - Path: ${privatePage.path}`);
      console.log(`   - Title: ${privatePage.title}`);
      console.log(`   - Access: Private with group permissions`);
    } catch (error) {
      console.log('⚠️  Private knowledge base creation failed:', error instanceof Error ? error.message : 'Unknown error');
    }

    // Example 5: Create multiple team groups for different departments
    console.log('\n🏢 Example 5: Creating Department Teams');
    console.log('   This demonstrates creating multiple teams with different access levels\n');
    
    const departments = [
      { type: 'engineering', name: 'BackendTeam', permissions: ['read', 'write', 'admin'] },
      { type: 'design', name: 'UXTeam', permissions: ['read', 'write'] },
      { type: 'product', name: 'ProductTeam', permissions: ['read', 'write', 'admin'] },
      { type: 'marketing', name: 'MarketingTeam', permissions: ['read'] }
    ];

    for (const dept of departments) {
      try {
        const team = await service.createTeamGroup(
          dept.type,
          dept.name,
          dept.permissions
        );
        
        console.log(`✅ ${dept.type} team created: ${team.name}`);
        console.log(`   - Permissions: ${dept.permissions.join(', ')}`);
      } catch (error) {
        console.log(`⚠️  ${dept.type} team creation failed:`, error instanceof Error ? error.message : 'Unknown error');
      }
    }

    // Example 6: Check access control for existing paths
    console.log('\n🔍 Example 6: Checking Access Control');
    console.log('   This demonstrates how to check which groups have access to specific paths\n');
    
    const pathsToCheck = [
      '/development-team/FrontendTeam',
      '/docs/technical',
      '/projects/alpha'
    ];

    for (const path of pathsToCheck) {
      try {
        const groups = await service.getGroupsForPath(path);
        console.log(`📁 Path: ${path}`);
        if (groups.length === 0) {
          console.log('   - Access: Public (no access control)');
        } else {
          console.log(`   - Access: Private (${groups.length} group(s) with access)`);
          groups.forEach((group, index) => {
            console.log(`     Group ${index + 1}: ${group.groupId} - ${group.permissions.join(', ')}`);
          });
        }
      } catch (error) {
        console.log(`⚠️  Could not check access for ${path}:`, error instanceof Error ? error.message : 'Unknown error');
      }
    }

    console.log('\n🎉 All examples completed successfully!');
    console.log('\n💡 Key Benefits of This System:');
    console.log('   🔐 Granular access control at the path level');
    console.log('   👥 Automatic group and page creation for teams');
    console.log('   📚 Private documentation areas for sensitive content');
    console.log('   🚀 Easy team onboarding with automatic setup');
    console.log('   🔍 Clear visibility into who has access to what');
    console.log('   📝 Flexible permission levels (read, write, admin)');

  } catch (error) {
    console.error('\n💥 Examples failed with error:', error);
    process.exit(1);
  }
}

// Run the examples if this script is executed directly
if (require.main === module) {
  exampleWikiJsGroupsAndPermissions()
    .then(() => {
      console.log('\n✨ Examples completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Examples failed:', error);
      process.exit(1);
    });
}
