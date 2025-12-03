import { Controller, Get, Param, Post, Put, Delete, Body, Query } from '@nestjs/common';
import { MenuService } from './menu.service';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get(':orgId')
  findAll(@Param('orgId') orgId: string, @Query('branchId') branchId?: string) {
    return this.menuService.findAll(orgId, branchId);
  }

  @Get('admin/:orgId')
  getAdminMenu(@Param('orgId') orgId: string, @Query('branchId') branchId?: string) {
    return this.menuService.getAdminMenu(orgId, branchId);
  }

  @Post('category')
  createCategory(@Body() body: any) {
    return this.menuService.createCategory(body);
  }

  @Put('category/:id')
  updateCategory(@Param('id') id: string, @Body() body: any) {
    return this.menuService.updateCategory(id, body);
  }

  @Delete('category/:id')
  deleteCategory(@Param('id') id: string) {
    return this.menuService.deleteCategory(id);
  }

  @Post('item')
  createMenuItem(@Body() body: any) {
    return this.menuService.createMenuItem(body);
  }

  @Put('item/:id')
  updateMenuItem(@Param('id') id: string, @Body() body: any) {
    return this.menuService.updateMenuItem(id, body);
  }

  @Delete('item/:id')
  deleteMenuItem(@Param('id') id: string) {
    return this.menuService.deleteMenuItem(id);
  }
}
