import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(user: any, branchId?: string) {
    const orgId = user.organization_id;
    const where: any = { organization_id: orgId };
    
    // If branch manager, force branchId
    if (user.role === 'branch_manager') {
        where.branch_id = user.branch_id;
    } else if (branchId) {
        // If admin and branchId provided, filter by it
        where.branch_id = branchId;
    }

    // Total Orders
    const totalOrders = await this.prisma.orders.count({ where });

    // Revenue
    const revenueResult = await this.prisma.orders.aggregate({
      _sum: {
        total_amount: true,
      },
      where: {
        ...where,
        status: { not: 'cancelled' },
      },
    });
    const revenue = revenueResult._sum.total_amount || 0;

    // Active Tables
    const activeTables = await this.prisma.floor_tables.count({
      where: {
        ...where,
        current_status: { not: 'free' },
      },
    });

    // Fetch Currency
    const org = await this.prisma.organizations.findUnique({
        where: { id: orgId },
        select: { currency: true }
    });

    return {
      totalOrders,
      revenue,
      activeTables,
      currency: org?.currency || 'USD'
    };
  }
}
