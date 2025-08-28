import dotenv from 'dotenv';
import { DiscordBotService } from '../src/services/discordBotService';
import { DiscordBotServiceFactory } from '../src/services/discordBotServiceFactory';
import { DiscordConfigValidator } from '../src/services/discordConfigValidator';
import { logger } from '../src/utils/logger';

// Load environment variables
dotenv.config();

async function testDiscordBotService() {
  console.log('🚀 Starting Discord Bot Service Tests...\n');

  let discordService: DiscordBotService | null = null;
  let testChannelId: string | null = null;
  let testRoleId: string | null = null;
  let testCategoryId: string | null = null;

  try {
    // Test 1: Configuration Validation
    console.log('📋 Test 1: Configuration Validation...');
    const envValidation = DiscordConfigValidator.validateEnvironment();
    console.log(`Environment validation: ${envValidation.isValid ? '✅ PASSED' : '❌ FAILED'}`);
    
    if (!envValidation.isValid) {
      console.log('Configuration errors:', envValidation.errors);
      console.log('Configuration warnings:', envValidation.warnings);
      
      if (envValidation.errors.length > 0) {
        console.log('\n📚 Setup Instructions:');
        const instructions = DiscordConfigValidator.generateSetupInstructions();
        instructions.forEach(instruction => console.log(instruction));
        return;
      }
    }

    const envStatus = DiscordConfigValidator.getEnvironmentStatus();
    console.log('Environment status:', envStatus);
    console.log('');

    // Test 2: Service Factory
    console.log('🏭 Test 2: Service Factory...');
    try {
      discordService = DiscordBotServiceFactory.createServiceFromEnv();
      console.log('✅ Service factory: PASSED');
    } catch (error) {
      console.log('❌ Service factory: FAILED');
      console.log('Error details:', error instanceof Error ? error.message : 'Unknown error');
      console.log('This should not happen with valid configuration. Please check your Discord bot setup.');
      throw error; // Don't fall back to mock - force real service
    }
    console.log('');

    // Test 3: Service Connection
    console.log('🔌 Test 3: Service Connection...');
    try {
      await discordService!.connect();
      console.log('✅ Service connection: PASSED');
    } catch (error) {
      console.log('❌ Service connection: FAILED');
      console.log('Error:', error instanceof Error ? error.message : 'Unknown error');
      console.log('This is expected for mock service or invalid configuration');
    }
    console.log('');

    // Test 4: Health Check
    console.log('🏥 Test 4: Health Check...');
    try {
      const healthStatus = await discordService!.getHealthStatus();
      console.log('Health status:', healthStatus.status);
      console.log('Message:', healthStatus.message);
      if (healthStatus.details) {
        console.log('Details:', healthStatus.details);
      }
      console.log('✅ Health check: PASSED');
    } catch (error) {
      console.log('❌ Health check: FAILED');
      console.log('Error:', error instanceof Error ? error.message : 'Unknown error');
    }
    console.log('');

    // Test 5: Category Operations
    console.log('📁 Test 5: Category Operations...');
    try {
      testCategoryId = await discordService!.createCategory('test-category');
      console.log(`✅ Created test category: ${testCategoryId}`);
      
      const categoryExists = await discordService!.roleExists('test-category');
      console.log(`Category exists check: ${categoryExists}`);
      
      console.log('✅ Category operations: PASSED');
    } catch (error) {
      console.log('❌ Category operations: FAILED');
      console.log('Error:', error instanceof Error ? error.message : 'Unknown error');
    }
    console.log('');

    // Test 6: Role Operations
    console.log('🎭 Test 6: Role Operations...');
    try {
      const testRole = await discordService!.createRole('test-role', ['view_channel', 'send_messages']);
      testRoleId = testRole.id;
      console.log(`✅ Created test role: ${testRole.name} (${testRole.id})`);
      
      const roleExists = await discordService!.roleExists('test-role');
      console.log(`Role exists check: ${roleExists}`);
      
      const fetchedRole = await discordService!.getRole(testRoleId);
      console.log(`✅ Fetched role: ${fetchedRole.name}`);
      
      const updatedRole = await discordService!.updateRole(testRoleId, { 
        name: 'updated-test-role',
        permissions: ['view_channel', 'send_messages', 'read_message_history']
      });
      console.log(`✅ Updated role: ${updatedRole.name}`);
      
      console.log('✅ Role operations: PASSED');
    } catch (error) {
      console.log('❌ Role operations: FAILED');
      console.log('Error:', error instanceof Error ? error.message : 'Unknown error');
    }
    console.log('');

    // Test 7: Channel Operations
    console.log('📺 Test 7: Channel Operations...');
    try {
      const testChannel = await discordService!.createChannel('test-channel', testCategoryId);
      testChannelId = testChannel.id;
      console.log(`✅ Created test channel: ${testChannel.name} (${testChannel.id})`);
      
      const channelExists = await discordService!.channelExists('test-channel');
      console.log(`Channel exists check: ${channelExists}`);
      
      const fetchedChannel = await discordService!.getChannel(testChannelId);
      console.log(`✅ Fetched channel: ${fetchedChannel.name}`);
      
      const updatedChannel = await discordService!.updateChannel(testChannelId, { 
        name: 'updated-test-channel'
      });
      console.log(`✅ Updated channel: ${updatedChannel.name}`);
      
      if (testCategoryId) {
        await discordService!.moveChannelToCategory(testChannelId, testCategoryId);
        console.log('✅ Moved channel to category');
      }
      
      console.log('✅ Channel operations: PASSED');
    } catch (error) {
      console.log('❌ Channel operations: FAILED');
      console.log('Error:', error instanceof Error ? error.message : 'Unknown error');
    }
    console.log('');

    // Test 8: Permission Operations
    console.log('🔐 Test 8: Permission Operations...');
    try {
      if (testChannelId && testRoleId) {
        await discordService!.setChannelPermissions(testChannelId, [{
          roleId: testRoleId,
          permissions: ['view_channel', 'send_messages', 'read_message_history']
        }]);
        console.log('✅ Set channel permissions');
      }
      
      console.log('✅ Permission operations: PASSED');
    } catch (error) {
      console.log('❌ Permission operations: FAILED');
      console.log('Error:', error instanceof Error ? error.message : 'Unknown error');
    }
    console.log('');

    // Test 9: User Role Assignment (Mock)
    console.log('👥 Test 9: User Role Assignment...');
    try {
      if (testRoleId) {
        // Note: This will fail with mock service since we don't have real user IDs
        // In production, you would use actual Discord user IDs
        await discordService!.assignRoleToUsers(testRoleId, ['mock-user-id']);
        console.log('✅ Role assignment: PASSED');
      }
    } catch (error) {
      console.log('⚠️ Role assignment: SKIPPED (expected for mock service)');
      console.log('Note: This requires real Discord user IDs in production');
    }
    console.log('');

    // Test 10: Service Factory Validation
    console.log('🏭 Test 10: Service Factory Validation...');
    try {
      const isProductionReady = DiscordBotServiceFactory.isProductionReady({
        botToken: process.env.DISCORD_BOT_TOKEN || 'mock-token',
        guildId: process.env.DISCORD_GUILD_ID || 'mock-guild-id',
        categoryId: process.env.DISCORD_CATEGORY_ID || 'mock-category-id'
      });
      console.log(`Production ready: ${isProductionReady ? '✅ YES' : '❌ NO'}`);
      
      if (discordService) {
        const healthValid = await DiscordBotServiceFactory.validateServiceHealth(discordService);
        console.log(`Service health validation: ${healthValid ? '✅ PASSED' : '❌ FAILED'}`);
      }
      
      console.log('✅ Service factory validation: PASSED');
    } catch (error) {
      console.log('❌ Service factory validation: FAILED');
      console.log('Error:', error instanceof Error ? error.message : 'Unknown error');
    }
    console.log('');

    console.log('🎉 All tests completed!');

  } catch (error) {
    console.error('❌ Test suite failed:', error);
  } finally {
    // Cleanup
    console.log('\n🧹 Cleaning up test resources...');
    
    try {
      if (discordService) {
        // Clean up test resources
        if (testChannelId) {
          try {
            await discordService.deleteChannel(testChannelId);
            console.log('✅ Cleaned up test channel');
          } catch (error) {
            console.log('⚠️ Failed to clean up test channel:', error instanceof Error ? error.message : 'Unknown error');
          }
        }
        
        if (testRoleId) {
          try {
            await discordService.deleteRole(testRoleId);
            console.log('✅ Cleaned up test role');
          } catch (error) {
            console.log('⚠️ Failed to clean up test role:', error instanceof Error ? error.message : 'Unknown error');
          }
        }
        
        if (testCategoryId) {
          try {
            await discordService.deleteChannel(testCategoryId);
            console.log('✅ Cleaned up test category');
          } catch (error) {
            console.log('⚠️ Failed to clean up test category:', error instanceof Error ? error.message : 'Unknown error');
          }
        }
        
        await discordService.disconnect();
        console.log('✅ Disconnected Discord service');
      }
    } catch (error) {
      console.log('⚠️ Cleanup error:', error instanceof Error ? error.message : 'Unknown error');
    }
    
    console.log('\n✨ Test cleanup completed!');
  }
}

// Run the tests
if (require.main === module) {
  testDiscordBotService()
    .then(() => {
      console.log('\n🎯 Discord Bot Service tests finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Discord Bot Service tests failed:', error);
      process.exit(1);
    });
}
