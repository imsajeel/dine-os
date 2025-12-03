import { Controller, Get, Post, Put, Delete, Body, Param, Query, BadRequestException, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private service: UsersService) {}

  @Get()
  findAll(@Query('orgId') orgId: string, @Query('branchId') branchId?: string) {
    return this.service.findAll(orgId, branchId);
  }

  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @Get('check-pin')
  async checkPin(@Query('branchId') branchId: string, @Query('pin') pin: string) {
    const exists = await this.service.checkPin(branchId, pin);
    return { exists };
  }

  @Get('generate-pin')
  async generatePin(@Query('branchId') branchId: string) {
    const pin = await this.service.generatePin(branchId);
    return { pin };
  }
}
