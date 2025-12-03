import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MenuModule } from './menu/menu.module';
import { PrismaService } from './prisma.service';
import { TablesModule } from './tables/tables.module';
import { OrdersModule } from './orders/orders.module';
import { ReservationsModule } from './reservations/reservations.module';
import { BranchesModule } from './branches/branches.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [MenuModule, TablesModule, OrdersModule, ReservationsModule, BranchesModule, UsersModule, AuthModule, StatsModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
