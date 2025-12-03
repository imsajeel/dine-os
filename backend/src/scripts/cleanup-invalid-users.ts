import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupInvalidUsers() {
  console.log('Starting cleanup of invalid users...');

  // Find users who don't have both org_id and branch_id, excluding org_admins
  const invalidUsers = await prisma.users.findMany({
    where: {
      role: { not: 'org_admin' },
      OR: [
        { organization_id: null },
        { branch_id: null }
      ]
    },
    select: {
      id: true,
      email: true,
      full_name: true,
      role: true,
      organization_id: true,
      branch_id: true
    }
  });

  console.log(`Found ${invalidUsers.length} invalid users:`);
  invalidUsers.forEach(user => {
    console.log(`- ${user.full_name} (${user.email}) - Role: ${user.role}, Org: ${user.organization_id}, Branch: ${user.branch_id}`);
  });

  if (invalidUsers.length === 0) {
    console.log('No invalid users found. Database is clean!');
    await prisma.$disconnect();
    return;
  }

  // Delete the invalid users
  const result = await prisma.users.deleteMany({
    where: {
      role: { not: 'org_admin' },
      OR: [
        { organization_id: null },
        { branch_id: null }
      ]
    }
  });

  console.log(`✅ Deleted ${result.count} invalid users`);
  await prisma.$disconnect();
}

cleanupInvalidUsers()
  .catch((error) => {
    console.error('Error during cleanup:', error);
    process.exit(1);
  });
