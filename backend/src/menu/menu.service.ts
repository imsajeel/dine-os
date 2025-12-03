import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string, branchId?: string) {
    const catWhere: any = { organization_id: orgId, is_active: true };
    if (branchId) {
        catWhere.OR = [
            { branch_id: branchId },
            { branch_id: null }
        ];
    }

    const categories = await this.prisma.categories.findMany({
      where: catWhere,
      orderBy: { sort_order: 'asc' },
    });

    const itemWhere: any = { organization_id: orgId, is_available: true };
    if (branchId) {
        itemWhere.OR = [
            { branch_id: branchId },
            { branch_id: null }
        ];
    }

    const items = await this.prisma.menu_items.findMany({
      where: itemWhere,
      include: { 
        categories: true,
        item_modifiers: {
          include: {
            modifier_groups: {
              include: {
                modifiers: true
              }
            }
          }
        }
      },
    });

    return {
      categories: categories.map(c => ({
        id: c.name.toLowerCase(),
        name: c.name,
      })),
      items: items.map(i => ({
        id: i.id,
        name: i.name,
        category: i.categories?.name.toLowerCase() || 'other',
        price: Number(i.price),
        image: i.image_url,
        modifier_groups: i.item_modifiers.map(im => ({
          id: im.modifier_groups.id,
          name: im.modifier_groups.name,
          min_selection: im.modifier_groups.min_selection,
          max_selection: im.modifier_groups.max_selection,
          modifiers: im.modifier_groups.modifiers.map(m => ({
            id: m.id,
            name: m.name,
            price: Number(m.price),
          }))
        }))
      })),
    };
  }

  async getAdminMenu(orgId: string, branchId?: string) {
    const catWhere: any = { organization_id: orgId, is_active: true };
    if (branchId) {
        catWhere.OR = [
            { branch_id: branchId },
            { branch_id: null }
        ];
    }

    const categories = await this.prisma.categories.findMany({
      where: catWhere,
      orderBy: { sort_order: 'asc' },
      include: { branches: true }
    });

    const itemWhere: any = { organization_id: orgId, is_available: true };
    if (branchId) {
        itemWhere.OR = [
            { branch_id: branchId },
            { branch_id: null }
        ];
    }

    const items = await this.prisma.menu_items.findMany({
      where: itemWhere,
      include: { 
        categories: true,
        branches: true
      },
    });

    return { categories, items };
  }


  async createCategory(data: any) {
    return this.prisma.categories.create({ data });
  }

  async updateCategory(id: string, data: any) {
    return this.prisma.categories.update({ where: { id }, data });
  }

  async deleteCategory(id: string) {
    return this.prisma.categories.delete({ where: { id } });
  }

  async createMenuItem(data: any) {
    return this.prisma.menu_items.create({ data });
  }

  async updateMenuItem(id: string, data: any) {
    return this.prisma.menu_items.update({ where: { id }, data });
  }

  async deleteMenuItem(id: string) {
    return this.prisma.menu_items.delete({ where: { id } });
  }
}
