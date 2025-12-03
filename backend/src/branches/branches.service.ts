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

  async create(data: any) {
    return this.prisma.branches.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.branches.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.branches.delete({ where: { id } });
  }
}
