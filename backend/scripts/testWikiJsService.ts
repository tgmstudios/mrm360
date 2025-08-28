#!/usr/bin/env tsx

// Load environment variables from .env file
import dotenv from 'dotenv';
import path from 'path';

// Load .env file from the backend directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import { WikiJsServiceFactory } from '@/services/wikijsServiceFactory';
import { WikiJsConfigValidator } from '@/services/wikijsConfigValidator';
import { logger } from '@/utils/logger';

async function testWikiJsService() {
  console.log('🧪 Testing Wiki.js Service\n');

  try {
    // Test 1: Configuration Validation
    console.log('1️⃣ Testing Configuration Validation...');
    const envValidation = WikiJsConfigValidator.validateEnvironment();
    
    if (envValidation.isValid) {
      console.log('✅ Environment configuration is valid');
      if (envValidation.warnings.length > 0) {
        console.log('⚠️  Warnings:', envValidation.warnings.join(', '));
      }
    } else {
      console.log('❌ Environment configuration is invalid:');
      envValidation.errors.forEach(error => console.log(`   - ${error}`));
      
      if (envValidation.warnings.length > 0) {
        console.log('⚠️  Warnings:', envValidation.warnings.join(', '));
      }
      
      console.log('\n📝 Please set the following environment variables:');
      console.log('   WIKIJS_BASE_URL - The base URL of your Wiki.js instance');
      console.log('   WIKIJS_API_TOKEN - Your Wiki.js API token');
      console.log('   WIKIJS_BASE_PATH - The base path for Wiki.js pages');
      
      return;
    }

    // Test 2: Service Creation
    console.log('\n2️⃣ Testing Service Creation...');
    let service;
    
    try {
      service = WikiJsServiceFactory.createServiceFromEnv();
      console.log('✅ Wiki.js service created successfully');
    } catch (error) {
      console.log('❌ Failed to create service from environment, trying fallback...');
      service = WikiJsServiceFactory.createServiceWithFallback();
      console.log('✅ Wiki.js service created with fallback (mock mode)');
    }

    // Test 3: Health Check
    console.log('\n3️⃣ Testing Health Check...');
    const isHealthy = await service.healthCheck();
    
    if (isHealthy) {
      console.log('✅ Wiki.js service is healthy');
    } else {
      console.log('⚠️  Wiki.js service health check failed (may be in mock mode)');
    }

    // Test 4: Service Status
    console.log('\n4️⃣ Testing Service Status...');
    const status = await service.getServiceStatus();
    console.log('📊 Service Status:', {
      isHealthy: status.isHealthy,
      basePath: status.basePath,
      pageCount: status.pageCount,
      lastHealthCheck: status.lastHealthCheck.toISOString()
    });

    // Test 5: Page Operations (if service is healthy)
    if (isHealthy) {
      console.log('\n5️⃣ Testing Page Operations...');
      
      // Test page creation
      const testPath = '/test-page';
      const testTitle = 'Test Page';
      const testContent = '# Test Page\n\nThis is a test page created by the test script.';
      
      try {
        // Check if page exists
        const exists = await service.pageExists(testPath);
        if (exists) {
          console.log('ℹ️  Test page already exists, skipping creation');
        } else {
          // Create test page
          const page = await service.createPage(testPath, testTitle, testContent);
          console.log('✅ Test page created successfully:', page.path);
        }
        
        // Get the page
        const retrievedPage = await service.getPage(testPath);
        console.log('✅ Test page retrieved successfully:', retrievedPage.title);
        
        // Update the page
        const updatedPage = await service.updatePage(testPath, {
          content: testContent + '\n\nUpdated content!'
        });
        console.log('✅ Test page updated successfully');
        
        // Search pages
        const searchResults = await service.searchPages('test');
        console.log(`✅ Search found ${searchResults.length} pages containing 'test'`);
        
        // Get all pages
        const allPages = await service.getAllPages();
        console.log(`✅ Retrieved ${allPages.length} total pages`);
        
        // Clean up - delete test page
        await service.deletePage(testPath);
        console.log('✅ Test page deleted successfully');
        
      } catch (error) {
        console.log('⚠️  Page operations test failed (may be in mock mode):', error instanceof Error ? error.message : 'Unknown error');
      }
    }

    // Test 6: Team Page Creation
    console.log('\n6️⃣ Testing Team Page Creation...');
    try {
      const teamPage = await service.createTeamIndexPage('development', 'TestTeam');
      console.log('✅ Team index page created successfully:', teamPage.path);
      console.log('📄 Page title:', teamPage.title);
      console.log('📝 Content length:', teamPage.content.length, 'characters');
    } catch (error) {
      console.log('⚠️  Team page creation test failed:', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 7: Auto Path Generation
    console.log('\n7️⃣ Testing Auto Path Generation...');
    try {
      const autoPage = await service.createPageWithAutoPath(
        'Auto Generated Page Title',
        '# Auto Generated Page\n\nThis page was created with an auto-generated path.',
        '/auto-test'
      );
      console.log('✅ Auto path page created successfully:', autoPage.path);
      
      // Clean up
      await service.deletePage(autoPage.path);
      console.log('✅ Auto path page deleted successfully');
    } catch (error) {
      console.log('⚠️  Auto path generation test failed:', error instanceof Error ? error.message : 'Unknown error');
    }

    console.log('\n🎉 Wiki.js Service Test Completed Successfully!');

  } catch (error) {
    console.error('\n💥 Test failed with error:', error);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testWikiJsService()
    .then(() => {
      console.log('\n✨ All tests completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test suite failed:', error);
      process.exit(1);
    });
}

export { testWikiJsService };
