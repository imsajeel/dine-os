import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TablesService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string) {
    const tables = await this.prisma.floor_tables.findMany({
      where: { organization_id: orgId },
      orderBy: { table_number: 'asc' },
      include: {
        orders: {
          where: {
            status: {
              notIn: ['completed', 'cancelled']
            }
          },
          include: {
            order_items: {
              include: {
                menu_items: true
              }
            }
          }
        }
      }
    });

    return tables.map(table => {
      const { orders, ...tableData } = table;
      const activeOrder = orders[0];
      
      if (activeOrder) {
        // Handle BigInt serialization
        (activeOrder as any).id = activeOrder.id.toString();
        activeOrder.order_items.forEach((item: any) => {
           if (item.order_id) item.order_id = item.order_id.toString();
           // Ensure price is number
           item.price_at_time = Number(item.price_at_time);
           if (item.menu_items) {
             item.menu_items.price = Number(item.menu_items.price);
           }
        });
        (activeOrder as any).total_amount = Number(activeOrder.total_amount);
      }

      return {
        ...tableData,
        active_order: activeOrder || null,
      };
    });
  }
}
