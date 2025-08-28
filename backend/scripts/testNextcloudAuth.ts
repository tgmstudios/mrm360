#!/usr/bin/env tsx

import { config } from 'dotenv';
import { NextcloudApiClient } from '@/utils/nextcloudApiClient';

// Load environment variables
config();

async function testNextcloudAuth() {
  console.log('🔐 Testing Nextcloud Authentication Methods\n');

  try {
    const baseUrl = process.env.NEXTCLOUD_BASE_URL;
    const username = process.env.NEXTCLOUD_USERNAME;
    const password = process.env.NEXTCLOUD_PASSWORD;

    if (!baseUrl || !username || !password) {
      console.error('❌ Missing required environment variables:');
      console.error(`   NEXTCLOUD_BASE_URL: ${baseUrl || 'NOT SET'}`);
      console.error(`   NEXTCLOUD_USERNAME: ${username || 'NOT SET'}`);
      console.error(`   NEXTCLOUD_PASSWORD: ${password ? 'SET' : 'NOT SET'}`);
      return;
    }

    console.log('📋 Configuration:');
    console.log(`   Base URL: ${baseUrl}`);
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password ? '***' : 'NOT SET'}`);
    console.log('');

    // Test Basic Authentication
    console.log('🔑 Test 1: Basic Authentication');
    console.log('================================');
    
    try {
      const basicAuthClient = new NextcloudApiClient({
        baseUrl,
        username,
        password,
        useSessionAuth: false
      });

      const basicAuthTest = await basicAuthClient.testAuthentication();
      console.log('Basic Auth Result:', basicAuthTest);
      
      if (basicAuthTest.success) {
        console.log('✅ Basic authentication successful');
      } else {
        console.log('❌ Basic authentication failed');
      }
    } catch (error) {
      console.log('❌ Basic authentication test error:', error);
    }
    console.log('');

    // Test Session Authentication
    console.log('🍪 Test 2: Session Authentication');
    console.log('==================================');
    
    try {
      const sessionAuthClient = new NextcloudApiClient({
        baseUrl,
        username,
        password,
        useSessionAuth: true
      });

      const sessionAuthTest = await sessionAuthClient.testAuthentication();
      console.log('Session Auth Result:', sessionAuthTest);
      
      if (sessionAuthTest.success) {
        console.log('✅ Session authentication successful');
      } else {
        console.log('❌ Session authentication failed');
      }
    } catch (error) {
      console.log('❌ Session authentication test error:', error);
    }
    console.log('');

    // Test direct API call
    console.log('🌐 Test 3: Direct API Call');
    console.log('===========================');
    
    try {
      const client = new NextcloudApiClient({
        baseUrl,
        username,
        password,
        useSessionAuth: false
      });

      console.log('Testing direct API call to /ocs/v1.php/cloud/groups');
      
      const response = await client['httpClient'].get('/ocs/v1.php/cloud/groups', undefined, {
        'Authorization': `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
        'OCS-APIRequest': 'true'
      });
      
      console.log('✅ Direct API call successful');
      console.log('Status:', response.status);
      console.log('Response data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('❌ Direct API call failed:', error);
    }
    console.log('');

    // Test login page
    console.log('📄 Test 4: Login Page Access');
    console.log('==============================');
    
    try {
      const client = new NextcloudApiClient({
        baseUrl,
        username,
        password,
        useSessionAuth: false
      });

      console.log('Testing access to login page');
      
      const response = await client['httpClient'].get('/login', {
        'Accept': 'text/html'
      });
      
      console.log('✅ Login page accessible');
      console.log('Status:', response.status);
      console.log('Content type:', response.headers['content-type']);
      console.log('Response length:', response.data?.length || 'Unknown');
    } catch (error) {
      console.log('❌ Login page access failed:', error);
    }
    console.log('');

    console.log('🎉 Authentication testing completed!');
    console.log('=====================================');
    
    console.log('\n💡 Recommendations:');
    console.log('1. If Basic Auth fails, try setting NEXTCLOUD_USE_SESSION_AUTH=true');
    console.log('2. Check if your Nextcloud instance requires CSRF tokens');
    console.log('3. Verify the user has admin privileges');
    console.log('4. Check if the OCS API is enabled in Nextcloud');

  } catch (error) {
    console.error('💥 Test suite failed with error:', error);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testNextcloudAuth()
    .then(() => {
      console.log('\n✨ Authentication tests completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Authentication tests failed:', error);
      process.exit(1);
    });
}
