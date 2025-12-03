import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string, branchId?: string) {
    const where: any = { 
      organization_id: orgId,
      role: { not: 'org_admin' } // Exclude org admins from the list
    };
    
    // If branchId is provided, include users assigned to that branch OR org-level users (branch_id is null)
    if (branchId) {
      where.OR = [
        { branch_id: branchId },
        { branch_id: null }
      ];
    }
    
    return this.prisma.users.findMany({ 
        where,
        include: { branches: true },
        orderBy: { created_at: 'desc' }
    });
  }

  async findByEmail(email: string) {
    return this.prisma.users.findFirst({ 
        where: { email },
        include: { branches: true, organizations: true }
    });
  }

  async create(data: any) {
    console.log('Creating user with data:', JSON.stringify(data, null, 2));
    
    try {
      if (data.password) {
        const salt = await bcrypt.genSalt();
        data.password_hash = await bcrypt.hash(data.password, salt);
        delete data.password;
      }
      
      console.log('Data after password hash:', JSON.stringify(data, null, 2));
      
      const user = await this.prisma.users.create({ data });
      console.log('User created successfully:', user.id);
      
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
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

  async checkPin(branchId: string, pin: string) {
    const user = await this.prisma.users.findFirst({
        where: { branch_id: branchId, pin_code: pin }
    });
    return !!user;
  }

  async generatePin(branchId: string) {
    let pin = '';
    let isUnique = false;
    while (!isUnique) {
        // Generate 4 digit PIN
        pin = Math.floor(1000 + Math.random() * 9000).toString();
        const exists = await this.checkPin(branchId, pin);
        if (!exists) isUnique = true;
    }
    return pin;
  }
}
