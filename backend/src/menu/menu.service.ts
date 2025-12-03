import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class MenuService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway
  ) {}

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

    // Deduplicate categories: prefer branch-specific
    const uniqueCategories = Array.from(
      categories.reduce((map, cat) => {
        const existing = map.get(cat.name);
        if (!existing || (cat.branch_id && !existing.branch_id)) {
          map.set(cat.name, cat);
        }
        return map;
      }, new Map<string, any>()).values()
    ).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));

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

    // Deduplicate items: prefer branch-specific
    const uniqueItems = Array.from(
      items.reduce((map, item) => {
        const existing = map.get(item.name);
        if (!existing || (item.branch_id && !existing.branch_id)) {
          map.set(item.name, item);
        }
        return map;
      }, new Map<string, any>()).values()
    );

    return {
      categories: uniqueCategories.map((c: any) => ({
        id: c.name.toLowerCase(),
        name: c.name,
      })),
      items: uniqueItems.map((i: any) => ({
        id: i.id,
        name: i.name,
        category: i.categories?.name.toLowerCase() || 'other',
        price: Number(i.price),
        image: i.image_url,
        modifier_groups: i.item_modifiers.map((im: any) => ({
          id: im.modifier_groups.id,
          name: im.modifier_groups.name,
          type: im.modifier_groups.type,
          min_selection: im.modifier_groups.min_selection,
          max_selection: im.modifier_groups.max_selection,
          modifiers: im.modifier_groups.modifiers.map((m: any) => ({
            id: m.id,
            name: m.name,
            price: Number(m.price),
          }))
        }))
      })),
    };
  }

  async getAdminMenu(orgId: string, branchId?: string) {
    const catWhere: any = { organization_id: orgId };
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

    console.log(`Fetched ${categories.length} categories for org ${orgId} and branch ${branchId}`);
    return { categories, items };
  }


  async createCategory(data: any) {
    console.log('Creating category with data:', JSON.stringify(data, null, 2));
    try {
      const result = await this.prisma.categories.create({ data });
      this.eventsGateway.emitMenuUpdated();
      return result;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  async updateCategory(id: string, data: any) {
    const result = await this.prisma.categories.update({ where: { id }, data });
    this.eventsGateway.emitMenuUpdated();
    return result;
  }

  async deleteCategory(id: string) {
    const itemsCount = await this.prisma.menu_items.count({
      where: { category_id: id }
    });

    if (itemsCount > 0) {
      throw new BadRequestException('You have to delete all items first');
    }

    const result = await this.prisma.categories.delete({
      where: { id },
    });
    this.eventsGateway.emitMenuUpdated();
    return result;
  }

  async createMenuItem(data: any) {
    const { modifier_group_ids, ...itemData } = data;
    const result = await this.prisma.menu_items.create({
      data: {
        ...itemData,
        item_modifiers: {
          create: modifier_group_ids?.map((groupId: string) => ({
            modifier_group_id: groupId
          })) || []
        }
      },
      include: { item_modifiers: true }
    });
    this.eventsGateway.emitMenuUpdated();
    return result;
  }

  async updateMenuItem(id: string, data: any) {
    const { modifier_group_ids, ...itemData } = data;

    if (modifier_group_ids) {
        await this.prisma.item_modifiers.deleteMany({ where: { menu_item_id: id } });
        if (modifier_group_ids.length > 0) {
            await this.prisma.item_modifiers.createMany({
                data: modifier_group_ids.map((groupId: string) => ({
                    menu_item_id: id,
                    modifier_group_id: groupId
                }))
            });
        }
    }

    const result = await this.prisma.menu_items.update({ 
        where: { id }, 
        data: itemData,
        include: { item_modifiers: true }
    });
    this.eventsGateway.emitMenuUpdated();
    return result;
  }

  async deleteMenuItem(id: string) {
    const result = await this.prisma.menu_items.delete({ where: { id } });
    this.eventsGateway.emitMenuUpdated();
    return result;
  }

  async copyMenu(sourceBranchId: string, targetBranchId: string, options: { mode: 'all' | 'category' | 'item', categoryId?: string, itemId?: string }) {
    // 1. Fetch source categories
    let sourceCategories: any[] = [];
    if (options.mode === 'all') {
        sourceCategories = await this.prisma.categories.findMany({
            where: { branch_id: sourceBranchId }
        });
    } else if (options.mode === 'category' && options.categoryId) {
        const cat = await this.prisma.categories.findUnique({ where: { id: options.categoryId } });
        if (cat) sourceCategories = [cat];
    }

    // Map old category ID to new category ID
    const categoryMap = new Map<string, string>();

    // 2. Create new categories (or find existing)
    for (const cat of sourceCategories) {
        const existingCat = await this.prisma.categories.findFirst({
            where: { 
                branch_id: targetBranchId, 
                name: cat.name 
            }
        });

        if (existingCat) {
            categoryMap.set(cat.id, existingCat.id);
        } else {
            const newCat = await this.prisma.categories.create({
                data: {
                    organization_id: cat.organization_id,
                    branch_id: targetBranchId,
                    name: cat.name,
                    sort_order: cat.sort_order,
                    is_active: cat.is_active,
                    icon: cat.icon
                }
            });
            categoryMap.set(cat.id, newCat.id);
        }
    }

    // 3. Fetch source items with modifiers
    let sourceItems: any[] = [];
    const itemInclude = {
        item_modifiers: {
            include: {
                modifier_groups: {
                    include: { modifiers: true }
                }
            }
        }
    };

    if (options.mode === 'all') {
        sourceItems = await this.prisma.menu_items.findMany({
            where: { branch_id: sourceBranchId },
            include: itemInclude
        });
    } else if (options.mode === 'category' && options.categoryId) {
        sourceItems = await this.prisma.menu_items.findMany({
            where: { category_id: options.categoryId },
            include: itemInclude
        });
    } else if (options.mode === 'item' && options.itemId) {
        const item = await this.prisma.menu_items.findUnique({ 
            where: { id: options.itemId },
            include: itemInclude
        });
        if (item) sourceItems = [item];
    }

    // Helper to map/create modifier groups
    const modifierGroupMap = new Map<string, string>();
    
    const getTargetModifierGroupId = async (sourceGroup: any) => {
        if (modifierGroupMap.has(sourceGroup.id)) return modifierGroupMap.get(sourceGroup.id);

        // If global, use as is
        if (!sourceGroup.branch_id) return sourceGroup.id;

        // If branch specific, check if exists in target
        const existingGroup = await this.prisma.modifier_groups.findFirst({
            where: {
                branch_id: targetBranchId,
                name: sourceGroup.name,
                type: sourceGroup.type
            }
        });

        if (existingGroup) {
            modifierGroupMap.set(sourceGroup.id, existingGroup.id);
            return existingGroup.id;
        }

        // Create new group in target branch
        const newGroup = await this.prisma.modifier_groups.create({
            data: {
                organization_id: sourceGroup.organization_id,
                branch_id: targetBranchId,
                name: sourceGroup.name,
                type: sourceGroup.type,
                min_selection: sourceGroup.min_selection,
                max_selection: sourceGroup.max_selection,
                modifiers: {
                    create: sourceGroup.modifiers.map((m: any) => ({
                        name: m.name,
                        price: m.price,
                        is_available: m.is_available
                    }))
                }
            }
        });

        modifierGroupMap.set(sourceGroup.id, newGroup.id);
        return newGroup.id;
    };

    // 4. Create new items
    let createdCount = 0;
    for (const item of sourceItems) {
        let newCategoryId = item.category_id ? categoryMap.get(item.category_id) : null;
        
        if (item.category_id && !newCategoryId) {
            const cat = await this.prisma.categories.findUnique({ where: { id: item.category_id } });
            if (cat) {
                if (cat.branch_id === sourceBranchId) {
                    const targetCat = await this.prisma.categories.findFirst({
                        where: { branch_id: targetBranchId, name: cat.name }
                    });
                    if (targetCat) newCategoryId = targetCat.id;
                } else {
                    newCategoryId = item.category_id;
                }
            }
        }

        // Prepare modifiers
        const newItemModifiers: { modifier_group_id: string }[] = [];
        if (item.item_modifiers) {
            for (const im of item.item_modifiers) {
                const targetGroupId = await getTargetModifierGroupId(im.modifier_groups);
                if (targetGroupId) {
                    newItemModifiers.push({ modifier_group_id: targetGroupId });
                }
            }
        }

        await this.prisma.menu_items.create({
            data: {
                organization_id: item.organization_id,
                branch_id: targetBranchId,
                name: item.name,
                description: item.description,
                price: item.price,
                category_id: newCategoryId,
                image_url: item.image_url,
                is_available: item.is_available,
                item_modifiers: {
                    create: newItemModifiers
                }
            }
        });
        createdCount++;
    }

    this.eventsGateway.emitMenuUpdated();
    return { success: true, categoriesCopied: sourceCategories.length, itemsCopied: createdCount };
  }

  async mergeCategories(branchId: string) {
    // 1. Fetch all categories for the branch
    const categories = await this.prisma.categories.findMany({
        where: { branch_id: branchId },
        include: { menu_items: true }
    });

    // 2. Group by name
    const grouped = new Map<string, any[]>();
    for (const cat of categories) {
        const name = cat.name.trim().toLowerCase();
        if (!grouped.has(name)) {
            grouped.set(name, []);
        }
        grouped.get(name)!.push(cat);
    }

    let mergedCount = 0;

    // 3. Process duplicates
    for (const [name, cats] of grouped) {
        if (cats.length < 2) continue;

        // Find winner (most items)
        // Sort by item count desc, then by created_at asc (keep older one if tie?)
        cats.sort((a, b) => b.menu_items.length - a.menu_items.length);

        const winner = cats[0];
        const losers = cats.slice(1);

        for (const loser of losers) {
            // Move items
            await this.prisma.menu_items.updateMany({
                where: { category_id: loser.id },
                data: { category_id: winner.id }
            });

            // Delete loser
            await this.prisma.categories.delete({
                where: { id: loser.id }
            });
            
            mergedCount++;
        }
    }

    if (mergedCount > 0) {
        this.eventsGateway.emitMenuUpdated();
    }
    return { success: true, mergedCount };
  }

}
