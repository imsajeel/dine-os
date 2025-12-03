import { Controller, Get, Param, Post, Body, Query } from '@nestjs/common';
import { TablesService } from './tables.service';

@Controller('tables')
// Trigger restart 2
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Get(':orgId')
  findAll(@Param('orgId') orgId: string, @Query('branchId') branchId?: string) {
    return this.tablesService.findAll(orgId, branchId);
  }

  @Post('join')
  joinTables(@Body() body: { tableIds: string[] }) {
    return this.tablesService.joinTables(body.tableIds);
  }

  @Post('split/:id')
  splitTable(@Param('id') id: string, @Body() body: { splits: number }) {
    return this.tablesService.splitTable(id, body.splits);
  }
}
