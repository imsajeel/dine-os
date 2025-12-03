import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(orgId: string, branchId?: string) {
    const where: any = { organization_id: orgId };
    if (branchId) where.branch_id = branchId;

    // Total Orders (maybe filter by date? for now all time)
    const totalOrders = await this.prisma.orders.count({ where });

    // Revenue
    const revenueResult = await this.prisma.orders.aggregate({
      _sum: {
        total_amount: true,
      },
      where: {
        ...where,
        status: { not: 'cancelled' }, // Exclude cancelled orders
      },
    });
    const revenue = revenueResult._sum.total_amount || 0;

    // Active Tables
    // Tables are usually branch specific. If branchId is not provided, we sum up all active tables in org.
    const activeTables = await this.prisma.floor_tables.count({
      where: {
        ...where,
        current_status: { not: 'free' },
      },
    });

    return {
      totalOrders,
      revenue,
      activeTables,
    };
  }
}
