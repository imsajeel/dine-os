import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ModifiersService } from './modifiers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('modifiers')
@UseGuards(JwtAuthGuard)
export class ModifiersController {
  constructor(private readonly modifiersService: ModifiersService) {}

  @Get(':orgId')
  findAll(@Param('orgId') orgId: string, @Query('branchId') branchId?: string) {
    return this.modifiersService.findAll(orgId, branchId);
  }

  @Post()
  create(@Body() body: any) {
    return this.modifiersService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.modifiersService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.modifiersService.delete(id);
  }

  @Post(':groupId/options')
  addOption(@Param('groupId') groupId: string, @Body() body: any) {
    return this.modifiersService.addOption(groupId, body);
  }

  @Delete('options/:id')
  removeOption(@Param('id') id: string) {
    return this.modifiersService.removeOption(id);
  }
}
