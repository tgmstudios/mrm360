const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// System roles that control permissions and access
const SYSTEM_ROLES = ['ADMIN', 'EXEC_BOARD', 'MEMBER'];

// Class rank roles that are used for Discord role assignment
const CLASS_RANK_ROLES = ['FIRST_YEAR', 'SECOND_YEAR', 'THIRD_YEAR', 'FOURTH_YEAR', 'ALUMNI_OTHER'];

function isSystemRole(role) {
  return SYSTEM_ROLES.includes(role);
}

function isClassRankRole(role) {
  return CLASS_RANK_ROLES.includes(role);
}

async function fixUserRoles() {
  try {
    console.log('Starting user role fix...');

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true
      }
    });

    console.log(`Found ${users.length} users`);

    let fixedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      console.log(`Checking user ${user.email} with role: ${user.role}`);

      if (isClassRankRole(user.role)) {
        console.log(`  ❌ User ${user.email} has class rank role "${user.role}" as system role - fixing to MEMBER`);
        
        await prisma.user.update({
          where: { id: user.id },
          data: { role: 'MEMBER' }
        });

        fixedCount++;
      } else if (isSystemRole(user.role)) {
        console.log(`  ✅ User ${user.email} has valid system role: ${user.role}`);
        skippedCount++;
      } else {
        console.log(`  ⚠️  User ${user.email} has unknown role: ${user.role} - fixing to MEMBER`);
        
        await prisma.user.update({
          where: { id: user.id },
          data: { role: 'MEMBER' }
        });

        fixedCount++;
      }
    }

    console.log('\n=== Summary ===');
    console.log(`Total users: ${users.length}`);
    console.log(`Fixed users: ${fixedCount}`);
    console.log(`Skipped users: ${skippedCount}`);
    console.log('User role fix completed successfully!');

  } catch (error) {
    console.error('Error fixing user roles:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixUserRoles()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
