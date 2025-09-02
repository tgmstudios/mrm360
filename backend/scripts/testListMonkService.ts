#!/usr/bin/env ts-node

import { ListMonkServiceFactory } from '../src/services/listmonkServiceFactory';
import { ListMonkConfigValidator } from '../src/utils/listmonkConfigValidator';
import { logger } from '../src/utils/logger';

async function testListMonkService() {
  console.log('🔍 Testing ListMonk Service Configuration and Connectivity\n');

  // Step 1: Check environment configuration
  console.log('📋 Step 1: Environment Configuration Check');
  console.log('=' .repeat(50));
  
  const configStatus = ListMonkConfigValidator.validateFromEnv();
  const envVarStatus = ListMonkConfigValidator.getEnvVarStatus();
  
  console.log('Configuration Validation:');
  console.log(`  Valid: ${configStatus.isValid ? '✅' : '❌'}`);
  
  if (!configStatus.isValid) {
    console.log('  Errors:');
    configStatus.errors.forEach((error: string) => {
      console.log(`    - ${error}`);
    });
  }
  
  if (configStatus.warnings.length > 0) {
    console.log('  Warnings:');
    configStatus.warnings.forEach((warning: string) => {
      console.log(`    - ${warning}`);
    });
  }
  
  console.log('\nEnvironment Variables:');
  Object.entries(envVarStatus).forEach(([key, status]) => {
    const displayValue = status.set ? (status.value || '***') : 'NOT SET';
    console.log(`  ${key}: ${displayValue}`);
  });

  // Step 2: Try to create service
  console.log('\n🔧 Step 2: Service Creation Test');
  console.log('=' .repeat(50));
  
  let service;
  try {
    service = ListMonkServiceFactory.createServiceFromEnv();
    console.log('✅ Service created successfully');
    
    const configInfo = service.getConfigurationInfo();
    console.log('Configuration Info:');
    console.log(`  Base URL: ${configInfo.baseUrl}`);
    console.log(`  Username: ${configInfo.username}`);
    console.log(`  Has Password: ${configInfo.hasPassword ? 'Yes' : 'No'}`);
    
  } catch (error) {
    console.log('❌ Failed to create service');
    console.log(`  Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return;
  }

  // Step 3: Health check
  console.log('\n🏥 Step 3: Health Check Test');
  console.log('=' .repeat(50));
  
  try {
    const isHealthy = await service.healthCheck();
    console.log(`Health Check: ${isHealthy ? '✅ PASSED' : '❌ FAILED'}`);
  } catch (error) {
    console.log('❌ Health check failed');
    console.log(`  Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Step 4: Test API connectivity
  console.log('\n🌐 Step 4: API Connectivity Test');
  console.log('=' .repeat(50));
  
  try {
    console.log('Testing basic API call...');
    const lists = await service.getLists();
    console.log(`✅ Successfully retrieved ${lists.length} lists`);
    
    if (lists.length > 0) {
      console.log('Sample list:');
      console.log(`  ID: ${lists[0].id}`);
      console.log(`  Name: ${lists[0].name}`);
      console.log(`  Type: ${lists[0].type}`);
      console.log(`  Subscriber Count: ${lists[0].subscriberCount}`);
    }
  } catch (error) {
    console.log('❌ API connectivity test failed');
    console.log(`  Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Step 5: Test subscriber operations
  console.log('\n👥 Step 5: Subscriber Operations Test');
  console.log('=' .repeat(50));
  
  const testEmail = 'test@example.com';
  
  try {
    console.log(`Testing subscriber lookup for: ${testEmail}`);
    const subscriber = await service.getSubscriberByEmail(testEmail);
    
    if (subscriber) {
      console.log('✅ Subscriber found');
      console.log(`  ID: ${subscriber.id}`);
      console.log(`  Email: ${subscriber.email}`);
      console.log(`  Status: ${subscriber.status}`);
      console.log(`  Lists: ${subscriber.lists.length}`);
    } else {
      console.log('ℹ️  Subscriber not found (this is expected for test email)');
    }
  } catch (error) {
    console.log('❌ Subscriber lookup failed');
    console.log(`  Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Step 6: Test subscriber creation (if lists exist)
  console.log('\n➕ Step 6: Subscriber Creation Test');
  console.log('=' .repeat(50));
  
  try {
    const lists = await service.getLists();
    if (lists.length > 0) {
      const testSubscriberEmail = `test-${Date.now()}@example.com`;
      console.log(`Testing subscriber creation with email: ${testSubscriberEmail}`);
      
      const newSubscriber = await service.createSubscriber({
        email: testSubscriberEmail,
        firstName: 'Test',
        lastName: 'User',
        status: 'enabled',
        lists: [lists[0].id]
      });
      
      console.log('✅ Subscriber created successfully');
      console.log(`  ID: ${newSubscriber.id}`);
      console.log(`  Email: ${newSubscriber.email}`);
      
      // Clean up - delete the test subscriber
      console.log('Cleaning up test subscriber...');
      await service.deleteSubscriber(newSubscriber.id!);
      console.log('✅ Test subscriber deleted');
      
    } else {
      console.log('ℹ️  No lists available for subscriber creation test');
    }
  } catch (error) {
    console.log('❌ Subscriber creation test failed');
    console.log(`  Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Step 7: Network diagnostics
  console.log('\n🔍 Step 7: Network Diagnostics');
  console.log('=' .repeat(50));
  
  const configInfo = service.getConfigurationInfo();
  console.log(`Testing connection to: ${configInfo.baseUrl}`);
  
  try {
    const response = await fetch(`${configInfo.baseUrl}/api/lists`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `token ${configInfo.username}:***`
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    console.log(`Response Status: ${response.status} ${response.statusText}`);
    console.log(`Response Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`Response Data Keys: ${Object.keys(data)}`);
    } else {
      console.log('❌ HTTP request failed');
    }
  } catch (error) {
    console.log('❌ Network request failed');
    console.log(`  Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  console.log('\n🏁 Test completed');
}

// Run the test
testListMonkService().catch(error => {
  console.error('Test failed with error:', error);
  process.exit(1);
});
