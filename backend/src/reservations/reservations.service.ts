import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  create(createReservationDto: CreateReservationDto) {
    return this.prisma.reservations.create({
      data: {
        organization_id: createReservationDto.organization_id,
        table_id: createReservationDto.table_id,
        customer_name: createReservationDto.customer_name,
        customer_phone: createReservationDto.customer_phone,
        customer_email: createReservationDto.customer_email,
        party_size: createReservationDto.party_size,
        reservation_time: new Date(createReservationDto.reservation_time),
        deposit_amount: createReservationDto.deposit_amount,
        is_deposit_paid: createReservationDto.is_deposit_paid,
        notes: createReservationDto.notes,
        status: 'confirmed'
      }
    });
  }

  findAll(orgId: string) {
    return this.prisma.reservations.findMany({
      where: { organization_id: orgId },
      include: { floor_tables: true },
      orderBy: { reservation_time: 'asc' }
    });
  }
  
  updateStatus(id: string, status: string) {
      return this.prisma.reservations.update({
          where: { id },
          data: { status }
      });
  }
}
