import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MenuModule } from './menu/menu.module';
import { PrismaService } from './prisma.service';
import { TablesModule } from './tables/tables.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [MenuModule, TablesModule, OrdersModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
