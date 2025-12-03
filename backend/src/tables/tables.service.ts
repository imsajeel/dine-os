import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TablesService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string, branchId?: string) {
    const where: any = { 
        organization_id: orgId,
        current_status: { notIn: ['merged', 'split'] }
    };
    if (branchId) where.branch_id = branchId;

    const tables = await this.prisma.floor_tables.findMany({
      where,
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

  async joinTables(tableIds: string[]) {
    if (tableIds.length < 2) throw new BadRequestException('Need at least 2 tables to join');

    const tables = await this.prisma.floor_tables.findMany({
      where: { id: { in: tableIds } }
    });

    if (tables.length !== tableIds.length) throw new NotFoundException('Some tables not found');

    const busyTables = tables.filter(t => t.current_status !== 'free');
    if (busyTables.length > 0) throw new BadRequestException('Cannot join busy tables');

    // Sort tables by number to create consistent name
    tables.sort((a, b) => a.table_number.localeCompare(b.table_number, undefined, { numeric: true }));
    const newTableNumber = tables.map(t => t.table_number).join('-');
    const totalCapacity = tables.reduce((sum, t) => sum + (t.capacity || 0), 0);
    const firstTable = tables[0];

    // Create merged table
    const newTable = await this.prisma.floor_tables.create({
      data: {
        organization_id: firstTable.organization_id,
        branch_id: firstTable.branch_id,
        table_number: newTableNumber,
        capacity: totalCapacity,
        x_position: firstTable.x_position,
        y_position: firstTable.y_position,
        shape: 'rect',
        current_status: 'free',
        is_merged: true,
        merged_ids: tableIds
      }
    });

    // Update original tables
    await this.prisma.floor_tables.updateMany({
      where: { id: { in: tableIds } },
      data: { current_status: 'merged' }
    });

    return newTable;
  }

  async splitTable(tableId: string, splits: number) {
    const table = await this.prisma.floor_tables.findUnique({ where: { id: tableId } });
    if (!table) throw new NotFoundException('Table not found');
    if (table.current_status !== 'free') throw new BadRequestException('Cannot split busy table');

    const newCapacity = Math.floor((table.capacity || 4) / splits);
    const suffixes = ['a', 'b', 'c', 'd', 'e', 'f'].slice(0, splits);

    const createdTables = [];
    for (const suffix of suffixes) {
      const newT = await this.prisma.floor_tables.create({
        data: {
            organization_id: table.organization_id,
            branch_id: table.branch_id,
            table_number: `${table.table_number}${suffix}`,
            capacity: newCapacity,
            x_position: table.x_position,
            y_position: table.y_position,
            shape: table.shape,
            current_status: 'free',
            parent_table_id: table.id
        }
      });
      createdTables.push(newT);
    }

    await this.prisma.floor_tables.update({
        where: { id: tableId },
        data: { current_status: 'split' }
    });

    return createdTables;
  }
}
