export class CreateOrderDto {
  organization_id: string;
  items: {
    menu_item_id: string;
    quantity: number;
    modifiers?: any[];
    notes?: string;
  }[];
  type: 'dine-in' | 'takeaway';
  table_id?: string;
  order_id?: string;
}
