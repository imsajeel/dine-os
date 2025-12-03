import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ModifiersService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string, branchId?: string) {
    return this.prisma.modifier_groups.findMany({
      where: {
        organization_id: orgId,
        ...(branchId ? { branch_id: branchId } : {})
      },
      include: {
        modifiers: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });
  }

  async create(data: any) {
    return this.prisma.modifier_groups.create({
      data: {
        organization_id: data.organization_id,
        branch_id: data.branch_id,
        name: data.name,
        type: data.type,
        min_selection: data.min_selection,
        max_selection: data.max_selection,
        modifiers: {
          create: data.options?.map((opt: any) => ({
            name: opt.name,
            price: opt.price
          })) || []
        }
      },
      include: {
        modifiers: true
      }
    });
  }

  async update(id: string, data: any) {
    // Update group details
    const group = await this.prisma.modifier_groups.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        min_selection: data.min_selection,
        max_selection: data.max_selection
      }
    });

    // Handle options update/create/delete if provided
    // For simplicity, we might handle options separately or expect full replacement logic here
    // But typically options are managed via separate endpoints or careful sync logic
    
    return group;
  }

  async delete(id: string) {
    return this.prisma.modifier_groups.delete({
      where: { id }
    });
  }

  async addOption(groupId: string, data: any) {
    return this.prisma.modifiers.create({
      data: {
        modifier_group_id: groupId,
        name: data.name,
        price: data.price
      }
    });
  }

  async removeOption(id: string) {
    return this.prisma.modifiers.delete({
      where: { id }
    });
  }
}
