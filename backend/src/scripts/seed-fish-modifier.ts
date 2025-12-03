
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);

  const fishGroup = await prisma.modifier_groups.findFirst({
    where: { name: 'Fish', type: 'grams' }
  });

  if (!fishGroup) {
    console.error('Fish group not found!');
    await app.close();
    return;
  }

  console.log('Found Fish group:', fishGroup.id);

  const modifier = await prisma.modifiers.create({
    data: {
      name: 'Standard Weight',
      price: 25.00, // Example price per kg
      modifier_group_id: fishGroup.id,
      is_available: true
    }
  });

  console.log('Created modifier:', modifier);

  await app.close();
}

bootstrap();
