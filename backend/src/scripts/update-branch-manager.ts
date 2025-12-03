import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateBranchManager() {
  const targetBranchId = '2d45b188-5ed9-439f-87bb-1457f5873ece';
  
  console.log('Finding branch manager user (A@ab.com)...');
  
  const user = await prisma.users.findFirst({
    where: {
      email: 'A@ab.com'
    }
  });

  if (!user) {
    console.log('User not found!');
    await prisma.$disconnect();
    return;
  }

  console.log('Found user:', {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    current_branch_id: user.branch_id
  });

  console.log(`\nUpdating branch_id to: ${targetBranchId}`);

  const updated = await prisma.users.update({
    where: { id: user.id },
    data: { branch_id: targetBranchId }
  });

  console.log('✅ User updated successfully!');
  console.log('New branch_id:', updated.branch_id);

  await prisma.$disconnect();
}

updateBranchManager()
  .catch((error) => {
    console.error('Error updating user:', error);
    process.exit(1);
  });
