import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const orgId = '47d16db1-d727-4817-bd42-d646417a5e0b'; // From previous seed

  // 1. Create 'Removals' Modifier Group
  const removalsGroup = await prisma.modifier_groups.create({
    data: {
      organization_id: orgId,
      name: 'Removals',
      min_selection: 0,
      max_selection: 5,
    }
  });

  console.log('Created Removals Group:', removalsGroup.id);

  // 2. Add Modifiers
  const modifiers = ['No Onion', 'No Tomato', 'No Pickle', 'No Sauce', 'No Cheese'];
  
  for (const name of modifiers) {
    await prisma.modifiers.create({
      data: {
        modifier_group_id: removalsGroup.id,
        name: name,
        price: 0.00
      }
    });
  }

  console.log('Added Removals modifiers');

  // 3. Link to Burgers
  // Find 'Burgers' category
  const burgerCategory = await prisma.categories.findFirst({
    where: { name: 'Burgers', organization_id: orgId }
  });

  if (burgerCategory) {
    const burgers = await prisma.menu_items.findMany({
      where: { category_id: burgerCategory.id }
    });

    for (const burger of burgers) {
      await prisma.item_modifiers.create({
        data: {
          menu_item_id: burger.id,
          modifier_group_id: removalsGroup.id
        }
      });
    }
    console.log(`Linked Removals to ${burgers.length} burgers`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
