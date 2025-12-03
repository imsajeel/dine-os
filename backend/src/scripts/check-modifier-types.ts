
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);

  const groups = await prisma.modifier_groups.findMany({
    select: { 
      id: true, 
      name: true, 
      type: true, 
      organization_id: true,
      modifiers: {
        select: { id: true, name: true, price: true }
      }
    }
  });

  console.log('Modifier Groups with Modifiers:');
  groups.forEach(g => {
    console.log(`Group: ${g.name} (${g.type})`);
    if (g.modifiers.length === 0) {
        console.log('  No modifiers found!');
    } else {
        console.table(g.modifiers);
    }
    console.log('---');
  });

  await app.close();
}

bootstrap();
