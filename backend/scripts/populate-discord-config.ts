import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const discordConfigs = [
  // Role IDs
  { key: 'DISCORD_MEMBER_ROLE_ID', value: '566464580717510685', description: 'Member role ID' },
  { key: 'DISCORD_FIRST_YEAR_ROLE_ID', value: '618944722945179649', description: 'First year student role ID' },
  { key: 'DISCORD_SECOND_YEAR_ROLE_ID', value: '618944731979710494', description: 'Second year student role ID' },
  { key: 'DISCORD_THIRD_YEAR_ROLE_ID', value: '618944734567858197', description: 'Third year student role ID' },
  { key: 'DISCORD_FOURTH_YEAR_ROLE_ID', value: '618944737218527232', description: 'Fourth year student role ID' },
  { key: 'DISCORD_ALUMNI_OTHER_ROLE_ID', value: '621130615340793859', description: 'Alumni/Other role ID' },
  { key: 'DISCORD_OFFENSE_ROLE_ID', value: '566463909007982600', description: 'Offense/CPTC role ID' },
  { key: 'DISCORD_DEFENSE_ROLE_ID', value: '566463907191980042', description: 'Defense/CCDC role ID' },
  { key: 'DISCORD_CTF_ROLE_ID', value: '829845252402970654', description: 'CTF role ID' },
  { key: 'DISCORD_GAMING_ROLE_ID', value: '704352838477676645', description: 'Gaming role ID' },
  
  // Channel IDs
  { key: 'DISCORD_NEW_USERS_CHANNEL_ID', value: '1009661676548788264', description: 'New users channel ID' },
  
  // Placeholder for role reaction message ID (will be set when created)
  { key: 'DISCORD_ROLE_REACTION_MESSAGE_ID', value: '', description: 'Role reaction message ID for button interactions' }
];

async function populateDiscordConfig() {
  try {
    console.log('Starting to populate Discord config table...');
    
    for (const config of discordConfigs) {
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
      console.log(`✅ Upserted: ${config.key}`);
    }
    
    console.log('🎉 Discord config table populated successfully!');
  } catch (error) {
    console.error('❌ Error populating Discord config:', error);
  } finally {
    await prisma.$disconnect();
  }
}

populateDiscordConfig();


