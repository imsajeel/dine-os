import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  create(@Body() createReservationDto: CreateReservationDto) {
    return this.reservationsService.create(createReservationDto);
  }

  @Get()
  findAll(@Query('organization_id') orgId: string) {
    return this.reservationsService.findAll(orgId);
  }
  
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
      return this.reservationsService.updateStatus(id, status);
  }
}
