export class CreateReservationDto {
  organization_id: string;
  table_id?: string;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  party_size: number;
  reservation_time: string;
  deposit_amount?: number;
  is_deposit_paid?: boolean;
  notes?: string;
}
