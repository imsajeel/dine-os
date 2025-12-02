import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string) {
    const categories = await this.prisma.categories.findMany({
      where: { organization_id: orgId, is_active: true },
      orderBy: { sort_order: 'asc' },
    });

    const items = await this.prisma.menu_items.findMany({
      where: { organization_id: orgId, is_available: true },
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
}
