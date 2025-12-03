import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('dashboard')
  async getDashboardStats(@Request() req, @Query('branchId') branchId?: string) {
    // req.user is populated by JwtStrategy
    return this.statsService.getDashboardStats(req.user, branchId);
  }
}
