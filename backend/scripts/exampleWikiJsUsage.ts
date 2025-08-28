import dotenv from 'dotenv';
import { WikiJsServiceFactory } from '../src/services/wikijsServiceFactory';
import { logger } from '../src/utils/logger';

// Load environment variables
dotenv.config();

async function exampleUsage() {
  console.log('📚 Wiki.js Service Usage Examples\n');

  try {
    // Create service
    const service = WikiJsServiceFactory.createServiceWithFallback();
    console.log('✅ Service created successfully\n');

    // Example 1: Create a documentation page
    console.log('📝 Example 1: Creating a documentation page');
    try {
      const docPage = await service.createPage(
        '/docs/getting-started',
        'Getting Started Guide',
        `# Getting Started Guide

Welcome to our project! This guide will help you get up and running quickly.

## Prerequisites

- Node.js 18+
- npm or yarn
- Git

## Installation

\`\`\`bash
npm install
npm run dev
\`\`\`

## Next Steps

1. Read the [API Documentation](/docs/api)
2. Check out [Examples](/docs/examples)
3. Join our [Community](/docs/community)

---
*Last updated: ${new Date().toLocaleDateString()}*
`
      );
      console.log(`✅ Documentation page created: ${docPage.path}`);
    } catch (error) {
      console.log(`⚠️  Could not create documentation page: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Example 2: Create a team page
    console.log('\n👥 Example 2: Creating a team page');
    try {
      const teamPage = await service.createTeamIndexPage('engineering', 'Backend');
      console.log(`✅ Team page created: ${teamPage.path}`);
      console.log(`📄 Title: ${teamPage.title}`);
      console.log(`📝 Content length: ${teamPage.content.length} characters`);
    } catch (error) {
      console.log(`⚠️  Could not create team page: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Example 3: Create a page with auto-generated path
    console.log('\n🔄 Example 3: Creating a page with auto-generated path');
    try {
      const autoPage = await service.createPageWithAutoPath(
        'API Reference Documentation',
        `# API Reference

This page contains the complete API reference for our services.

## Authentication

All API calls require authentication via Bearer token.

## Endpoints

- \`GET /api/users\` - List users
- \`POST /api/users\` - Create user
- \`PUT /api/users/:id\` - Update user
- \`DELETE /api/users/:id\` - Delete user

## Response Format

\`\`\`json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully"
}
\`\`\`
`,
        '/api-docs'
      );
      console.log(`✅ Auto path page created: ${autoPage.path}`);
    } catch (error) {
      console.log(`⚠️  Could not create auto path page: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Example 4: Search functionality
    console.log('\n🔍 Example 4: Searching pages');
    try {
      const searchResults = await service.searchPages('API');
      console.log(`✅ Search found ${searchResults.length} pages containing 'API'`);
      
      if (searchResults.length > 0) {
        console.log('📄 Found pages:');
        searchResults.forEach(page => {
          console.log(`   - ${page.title} (${page.path})`);
        });
      }
    } catch (error) {
      console.log(`⚠️  Could not search pages: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Example 5: Get service status
    console.log('\n📊 Example 5: Getting service status');
    try {
      const status = await service.getServiceStatus();
      console.log('📊 Service Status:');
      console.log(`   Health: ${status.isHealthy ? '✅ Healthy' : '❌ Unhealthy'}`);
      console.log(`   Base Path: ${status.basePath}`);
      console.log(`   Page Count: ${status.pageCount || 'Unknown'}`);
      console.log(`   Last Health Check: ${status.lastHealthCheck.toLocaleString()}`);
    } catch (error) {
      console.log(`⚠️  Could not get service status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Example 6: Batch page creation
    console.log('\n📚 Example 6: Batch page creation');
    const pagesToCreate = [
      {
        path: '/docs/installation',
        title: 'Installation Guide',
        content: '# Installation Guide\n\nStep-by-step installation instructions.'
      },
      {
        path: '/docs/configuration',
        title: 'Configuration',
        content: '# Configuration\n\nHow to configure the application.'
      },
      {
        path: '/docs/deployment',
        title: 'Deployment',
        content: '# Deployment\n\nDeployment instructions and best practices.'
      }
    ];

    for (const pageData of pagesToCreate) {
      try {
        const page = await service.createPage(pageData.path, pageData.title, pageData.content);
        console.log(`✅ Created: ${page.path}`);
      } catch (error) {
        console.log(`⚠️  Could not create ${pageData.path}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Example 7: Update existing page
    console.log('\n✏️  Example 7: Updating existing page');
    try {
      const updatedPage = await service.updatePage('/docs/getting-started', {
        content: `# Getting Started Guide

Welcome to our project! This guide will help you get up and running quickly.

## Prerequisites

- Node.js 18+
- npm or yarn
- Git

## Installation

\`\`\`bash
npm install
npm run dev
\`\`\`

## Next Steps

1. Read the [API Documentation](/docs/api)
2. Check out [Examples](/docs/examples)
3. Join our [Community](/docs/community)

## Quick Start

For the impatient, here's the quickest way to get started:

\`\`\`bash
git clone https://github.com/your-repo/your-project.git
cd your-project
npm install
npm start
\`\`\`

---
*Last updated: ${new Date().toLocaleDateString()}*
*Updated with quick start section*
`
      });
      console.log(`✅ Page updated: ${updatedPage.path}`);
    } catch (error) {
      console.log(`⚠️  Could not update page: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    console.log('\n🎉 All examples completed!');
    console.log('\n💡 Tip: Check the Wiki.js instance to see the created pages');
    console.log('💡 Tip: Use the health endpoint to monitor service status');

  } catch (error) {
    console.error('\n💥 Example failed with error:', error);
  }
}

// Run the examples
if (require.main === module) {
  exampleUsage()
    .then(() => {
      console.log('\n✨ Examples completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Examples failed:', error);
      process.exit(1);
    });
}

export { exampleUsage };
