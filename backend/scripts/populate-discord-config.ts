import { PrismaClient } from '@prisma/client';
import { Client, GatewayIntentBits, Guild } from 'discord.js';
import { logger } from '../src/utils/logger';

const prisma = new PrismaClient();

// Discord client for role discovery
const discordClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// Role name to config key mapping
const roleNameToConfigMap = {
  'Member': 'DISCORD_MEMBER_ROLE_ID',
  'First Year': 'DISCORD_FIRST_YEAR_ROLE_ID',
  'Second Year': 'DISCORD_SECOND_YEAR_ROLE_ID', 
  'Third Year': 'DISCORD_THIRD_YEAR_ROLE_ID',
  'Fourth Year': 'DISCORD_FOURTH_YEAR_ROLE_ID',
  'Alumni / Other': 'DISCORD_ALUMNI_OTHER_ROLE_ID',
  'Offense': 'DISCORD_OFFENSE_ROLE_ID',
  'Defense': 'DISCORD_DEFENSE_ROLE_ID',
  'CTF': 'DISCORD_CTF_ROLE_ID',
  'Gaming': 'DISCORD_GAMING_ROLE_ID'
};

export async function discoverAndSaveDiscordRoles() {
  try {
    console.log('🔍 Starting Discord role discovery...');
    
    const botToken = process.env.DISCORD_BOT_TOKEN;
    const guildId = process.env.DISCORD_GUILD_ID;
    
    if (!botToken || !guildId) {
      console.error('❌ Missing Discord configuration: DISCORD_BOT_TOKEN or DISCORD_GUILD_ID');
      return;
    }

    // Connect to Discord
    console.log('🔗 Connecting to Discord...');
    await discordClient.login(botToken);
    
    // Get the guild
    const guild = await discordClient.guilds.fetch(guildId);
    console.log(`✅ Connected to guild: ${guild.name}`);
    
    // Fetch all roles
    const roles = await guild.roles.fetch();
    console.log(`📋 Found ${roles.size} roles in the guild`);
    
    let discoveredCount = 0;
    
    // Iterate through roles and match names
    for (const [roleId, role] of roles) {
      const roleName = role.name;
      
      // Check if this role name matches any of our config keys
      for (const [searchName, configKey] of Object.entries(roleNameToConfigMap)) {
        if (roleName.toLowerCase().includes(searchName.toLowerCase())) {
          console.log(`🎯 Found role: "${roleName}" (${roleId}) -> ${configKey}`);
          
          // Save to database
          await prisma.discordConfig.upsert({
            where: { key: configKey },
            update: { 
              value: roleId,
              description: `Auto-discovered: ${roleName}`,
              updatedAt: new Date()
            },
            create: {
              key: configKey,
              value: roleId,
              description: `Auto-discovered: ${roleName}`
            }
          });
          
          discoveredCount++;
          break; // Found a match, move to next role
        }
      }
    }
    
    // Also save channel IDs from environment variables
    const channelConfigs = [
      { key: 'DISCORD_NEW_USERS_CHANNEL_ID', value: process.env.DISCORD_NEW_USERS_CHANNEL_ID || '', description: 'New users channel ID' },
      { key: 'DISCORD_ROLE_REACTION_MESSAGE_ID', value: '', description: 'Role reaction message ID for button interactions' }
    ];
    
    for (const config of channelConfigs) {
      if (config.value) {
        await prisma.discordConfig.upsert({
          where: { key: config.key },
          update: { 
            value: config.value,
            description: config.description,
            updatedAt: new Date()
          },
          create: {
            key: config.key,
            value: config.value,
            description: config.description
          }
        });
        console.log(`✅ Saved channel config: ${config.key} = ${config.value}`);
      }
    }
    
    console.log(`🎉 Discord role discovery completed! Discovered ${discoveredCount} roles`);
    
    // List all saved configurations
    const savedConfigs = await prisma.discordConfig.findMany();
    console.log('\n📊 Current Discord configurations:');
    for (const config of savedConfigs) {
      console.log(`  ${config.key}: ${config.value} (${config.description})`);
    }
    
  } catch (error) {
    console.error('❌ Error during Discord role discovery:', error);
  } finally {
    await discordClient.destroy();
    await prisma.$disconnect();
  }
}

// Run the discovery if this script is executed directly
if (require.main === module) {
  discoverAndSaveDiscordRoles();
}


