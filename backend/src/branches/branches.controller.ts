import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { BranchesService } from './branches.service';

@Controller('branches')
export class BranchesController {
  constructor(private service: BranchesService) {}

  @Get()
  findAll(@Query('orgId') orgId: string) {
    return this.service.findAll(orgId);
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
}
