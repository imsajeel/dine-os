import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string, branchId?: string) {
    const where: any = { organization_id: orgId };
    if (branchId) where.branch_id = branchId;
    return this.prisma.users.findMany({ 
        where,
        include: { branches: true }
    });
  }

  async findByEmail(email: string) {
    return this.prisma.users.findFirst({ 
        where: { email },
        include: { branches: true, organizations: true }
    });
  }

  async create(data: any) {
    if (data.password) {
      const salt = await bcrypt.genSalt();
      data.password_hash = await bcrypt.hash(data.password, salt);
      delete data.password;
    }
    return this.prisma.users.create({ data });
  }

  async update(id: string, data: any) {
    if (data.password) {
      const salt = await bcrypt.genSalt();
      data.password_hash = await bcrypt.hash(data.password, salt);
      delete data.password;
    }
    return this.prisma.users.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.users.delete({ where: { id } });
  }
}
