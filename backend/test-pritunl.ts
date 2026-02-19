import { PritunlService } from './src/services/pritunlService';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testPritunlService() {
  console.log('🔐 Testing Pritunl Service\n');

  const config = {
    baseUrl: process.env.PRITUNL_BASE_URL || 'https://pritunl.psuccso.org',
    apiToken: process.env.PRITUNL_API_TOKEN || '',
    apiSecret: process.env.PRITUNL_API_SECRET || '',
  };

  console.log('Configuration:');
  console.log(`  Base URL: ${config.baseUrl}`);
  console.log(`  API Token: ${config.apiToken ? '✓ Set' : '✗ Missing'}`);
  console.log(`  API Secret: ${config.apiSecret ? '✓ Set' : '✗ Missing'}\n`);

  if (!config.apiToken || !config.apiSecret) {
    console.error('❌ Missing Pritunl credentials in .env.local');
    process.exit(1);
  }

  const pritunl = new PritunlService(config);

  try {
    // Test 1: List Organizations
    console.log('Test 1: Listing Organizations...');
    const orgs = await pritunl.listOrganizations();
    console.log(`✓ Found ${orgs.length} organizations:`);
    orgs.forEach(org => {
      console.log(`  - ${org.name} (${org.id})`);
    });
    console.log();

    // Test 2: Find CCSOMembers organization
    console.log('Test 2: Finding CCSOMembers organization...');
    const ccsoOrg = orgs.find(org => org.name === 'CCSOMembers');
    if (ccsoOrg) {
      console.log(`✓ Found CCSOMembers organization: ${ccsoOrg.id}\n`);
    } else {
      console.log('✗ CCSOMembers organization not found\n');
      console.log('Available organizations:', orgs.map(o => o.name).join(', '));
      process.exit(1);
    }

    // Test 3: List Users in CCSOMembers
    console.log('Test 3: Listing users in CCSOMembers...');
    const users = await pritunl.listUsers(ccsoOrg.id);
    console.log(`✓ Found ${users.length} users in CCSOMembers:`);
    users.slice(0, 5).forEach(user => {
      console.log(`  - ${user.name} (${user.email})`);
    });
    if (users.length > 5) {
      console.log(`  ... and ${users.length - 5} more`);
    }
    console.log();

    // Test 4: List Servers
    console.log('Test 4: Listing servers...');
    const servers = await pritunl.listServers();
    console.log(`✓ Found ${servers.length} servers:`);
    servers.forEach(server => {
      console.log(`  - ${server.name} (${server.id})`);
      if (server.organizations && Array.isArray(server.organizations)) {
        console.log(`    Organizations: ${server.organizations.join(', ')}`);
      } else {
        console.log(`    Organizations: (none or not available)`);
      }
    });
    console.log();

    // Test 5: Find server for CCSOMembers
    console.log('Test 5: Finding server for CCSOMembers...');
    const ccsoServer = servers.find(srv => srv.organizations && srv.organizations.includes(ccsoOrg.id));
    if (ccsoServer) {
      console.log(`✓ Found server for CCSOMembers: ${ccsoServer.name}\n`);
    } else {
      console.log('✗ No server found for CCSOMembers organization\n');
    }

    console.log('✅ All Pritunl service tests passed!\n');

    console.log('Note: To test user creation and email sending, you would need to:');
    console.log('  1. Have a test email address');
    console.log('  2. Run: await pritunl.requestVPNProfile("test.user", "test@example.com", "CCSOMembers")');
    console.log('  3. Check the email inbox for VPN profile');

  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error(error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

testPritunlService();
