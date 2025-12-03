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

    // Branch-wise breakdown (only for org admins without specific branch)
    let branchStats: Array<{
      branchId: string;
      branchName: string;
      revenue: number;
      orders: number;
    }> = [];
    
    if (user.role === 'org_admin' && !branchId) {
      const branches = await this.prisma.branches.findMany({
        where: { organization_id: orgId, is_active: true },
        select: { id: true, name: true }
      });

      branchStats = await Promise.all(
        branches.map(async (branch) => {
          const branchRevenue = await this.prisma.orders.aggregate({
            _sum: { total_amount: true },
            where: {
              organization_id: orgId,
              branch_id: branch.id,
              status: { not: 'cancelled' }
            }
          });

          const branchOrders = await this.prisma.orders.count({
            where: {
              organization_id: orgId,
              branch_id: branch.id
            }
          });

          return {
            branchId: branch.id,
            branchName: branch.name,
            revenue: Number(branchRevenue._sum.total_amount?.toString() || 0),
            orders: branchOrders
          };
        })
      );
    }

    // Top selling items
    const topItems = await this.prisma.order_items.groupBy({
      by: ['menu_item_id'],
      where: {
        organization_id: orgId,
        menu_item_id: { not: null },
        ...(branchId ? { orders: { branch_id: branchId } } : {})
      },
      _sum: {
        quantity: true,
        price_at_time: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 5
    });

    // Fetch menu item details for top items
    const topItemsWithDetails = await Promise.all(
      topItems.map(async (item) => {
        if (!item.menu_item_id) return null;
        
        const menuItem = await this.prisma.menu_items.findUnique({
          where: { id: item.menu_item_id },
          select: { name: true, price: true }
        });
        return {
          name: menuItem?.name || 'Unknown',
          quantity: item._sum.quantity || 0,
          revenue: Number(item._sum.price_at_time?.toString() || 0)
        };
      })
    );

    return {
      totalOrders,
      revenue: Number(revenue?.toString() || 0),
      activeTables,
      currency: org?.currency || 'GBP',
      branchStats,
      topItems: topItemsWithDetails.filter(item => item !== null)
    };
  }
}
