import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string) {
    return this.prisma.branches.findMany({ 
        where: { organization_id: orgId },
        orderBy: { created_at: 'desc' }
    });
  }

  async getConfig(orgId: string) {
    const org = await this.prisma.organizations.findUnique({
        where: { id: orgId },
        select: { max_branches: true }
    });
    const count = await this.prisma.branches.count({
        where: { organization_id: orgId }
    });
    return { max_branches: org?.max_branches || 1, count };
  }

  async create(data: any) {
    const org = await this.prisma.organizations.findUnique({
        where: { id: data.organization_id }
    });

    const currentBranches = await this.prisma.branches.count({
        where: { organization_id: data.organization_id }
    });

    if (org?.max_branches && currentBranches >= org.max_branches) {
        throw new Error(`Branch limit reached. Your plan allows ${org.max_branches} branches.`);
    }

    return this.prisma.branches.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.branches.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.branches.delete({ where: { id } });
  }
}
