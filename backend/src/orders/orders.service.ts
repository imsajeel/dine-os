import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../prisma.service';

import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const { organization_id, branch_id, items, type, table_id } = createOrderDto;

    // 1. Fetch all menu items to get prices
    const itemIds = items.map(i => i.menu_item_id);
    const menuItems = await this.prisma.menu_items.findMany({
      where: { id: { in: itemIds } }
    });
    
    let totalAmount = 0;
    const orderItemsData: any[] = [];

    for (const item of items) {
      const menuItem = menuItems.find(mi => mi.id === item.menu_item_id);
      if (!menuItem) continue;

      let itemPrice = Number(menuItem.price);
      // Add modifier prices
      if (item.modifiers) {
        for (const mod of item.modifiers) {
           itemPrice += Number(mod.price);
        }
      }
      
      totalAmount += itemPrice * item.quantity;

      orderItemsData.push({
        organization_id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        price_at_time: menuItem.price, // Base price
        modifiers: JSON.stringify(item.modifiers || []),
        notes: item.notes,
        status: 'new'
      });
    }

    // Check for existing active order for this table
    // Check for existing active order for this table or provided order_id
    let existingOrder: any = null;
    if (createOrderDto.order_id) {
        existingOrder = await this.prisma.orders.findUnique({
            where: { id: BigInt(createOrderDto.order_id) }
        });
    } else if (type === 'dine-in' && table_id) {
        existingOrder = await this.prisma.orders.findFirst({
            where: {
                table_id: table_id,
                status: { notIn: ['completed', 'cancelled'] }
            }
        });
    }

    if (existingOrder) {
        // Append to existing order
        // 1. Create Order Items linked to existing order
        await this.prisma.order_items.createMany({
            data: orderItemsData.map(item => ({ ...item, order_id: existingOrder.id }))
        });

        // 2. Update Total Amount
        const newTotal = Number(existingOrder.total_amount) + totalAmount;
        const updatedOrder = await this.prisma.orders.update({
            where: { id: existingOrder.id },
            data: { total_amount: newTotal },
            include: { order_items: true }
        });
        
        // Handle BigInt serialization
        const result = {
            ...updatedOrder,
            id: updatedOrder.id.toString(),
            total_amount: Number(updatedOrder.total_amount)
        };
        this.eventsGateway.emitOrderUpdated(result);
        return result;
    } else {
        // Create New Order
        const order = await this.prisma.orders.create({
          data: {
            organization_id,
            branch_id: branch_id || null,
            table_id: table_id || null,
            status: 'new',
            total_amount: totalAmount,
            payment_status: 'unpaid',
            order_items: {
              create: orderItemsData
            }
          }
        });

        // Update Table Status if dine-in
        if (type === 'dine-in' && table_id) {
          await this.prisma.floor_tables.update({
            where: { id: table_id },
            data: { current_status: 'occupied' }
          });
        }
        
        // Handle BigInt serialization
        const result = {
            ...order,
            id: order.id.toString(),
            total_amount: Number(order.total_amount)
        };
        this.eventsGateway.emitOrderCreated(result);
        return result;
    }
  }

  async findAll(orgId: string, status?: string, type?: string, branchId?: string) {
    const where: any = { organization_id: orgId };
    
    if (branchId) {
        where.branch_id = branchId;
    }
    
    if (status) {
      if (status === 'active') {
        where.status = { notIn: ['completed', 'cancelled'] };
      } else {
        where.status = status;
      }
    }

    if (type === 'takeaway') {
      where.table_id = null;
    }

    const orders = await this.prisma.orders.findMany({
      where,
      include: {
        order_items: {
          include: {
            menu_items: true
          }
        },
        floor_tables: true
      },
      orderBy: { created_at: 'desc' }
    });

    return orders.map(order => {
        (order as any).id = order.id.toString();
        order.order_items.forEach((item: any) => {
           if (item.order_id) item.order_id = item.order_id.toString();
           item.price_at_time = Number(item.price_at_time);
           if (item.menu_items) {
             item.menu_items.price = Number(item.menu_items.price);
           }
        });
        (order as any).total_amount = Number(order.total_amount);
        return order;
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    const order = await this.prisma.orders.update({
      where: { id: BigInt(id) },
      data: updateOrderDto as any
    });
    
    // If order is completed and has a table, free the table
    if ((updateOrderDto as any).status === 'completed' && order.table_id) {
      await this.prisma.floor_tables.update({
        where: { id: order.table_id },
        data: { current_status: 'free' }
      });
    }
    
    // Convert BigInt to string for JSON serialization
    const result = {
      ...order,
      id: order.id.toString(),
      total_amount: Number(order.total_amount)
    };
    this.eventsGateway.emitOrderUpdated(result);
    return result;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }

  async updateOrderItemStatus(itemId: string, status: string) {
    return this.prisma.order_items.update({
      where: { id: itemId },
      data: { status: status as any }
    });
  }
}
