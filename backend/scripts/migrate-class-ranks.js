const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Class rank roles that should be migrated
const CLASS_RANK_ROLES = ['FIRST_YEAR', 'SECOND_YEAR', 'THIRD_YEAR', 'FOURTH_YEAR', 'ALUMNI_OTHER'];

// System roles that should not be migrated
const SYSTEM_ROLES = ['ADMIN', 'EXEC_BOARD', 'MEMBER'];

function isClassRankRole(role) {
  return CLASS_RANK_ROLES.includes(role);
}

function isSystemRole(role) {
  return SYSTEM_ROLES.includes(role);
}

async function migrateClassRanks() {
  try {
    console.log('Starting class rank migration...');

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true
      }
    });

    console.log(`Found ${users.length} users`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const user of users) {
      console.log(`Checking user ${user.email} with role: ${user.role}`);

      if (isClassRankRole(user.role)) {
        console.log(`  🔄 User ${user.email} has class rank role "${user.role}" - migrating to UserClassRank table`);
        
        try {
          // Create entry in UserClassRank table
          await prisma.userClassRank.upsert({
            where: { userId: user.id },
            update: { classRank: user.role },
            create: {
              userId: user.id,
              classRank: user.role
            }
          });

          // Update user role to MEMBER (default system role)
          await prisma.user.update({
            where: { id: user.id },
            data: { role: 'MEMBER' }
          });

          console.log(`  ✅ Successfully migrated ${user.email} from ${user.role} to MEMBER + UserClassRank`);
          migratedCount++;
        } catch (error) {
          console.error(`  ❌ Failed to migrate ${user.email}:`, error);
          errorCount++;
        }
      } else if (isSystemRole(user.role)) {
        console.log(`  ✅ User ${user.email} has valid system role: ${user.role} - no migration needed`);
        skippedCount++;
      } else {
        console.log(`  ⚠️  User ${user.email} has unknown role: ${user.role} - skipping`);
        skippedCount++;
      }
    }

    console.log('\n=== Migration Summary ===');
    console.log(`Total users: ${users.length}`);
    console.log(`Migrated users: ${migratedCount}`);
    console.log(`Skipped users: ${skippedCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log('Class rank migration completed!');

  } catch (error) {
    console.error('Error during class rank migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
migrateClassRanks()
  .then(() => {
    console.log('Migration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
