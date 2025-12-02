import { Controller, Get, Param } from '@nestjs/common';
import { MenuService } from './menu.service';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get(':orgId')
  findAll(@Param('orgId') orgId: string) {
    return this.menuService.findAll(orgId);
  }
}
