import React from 'react';

export type Category = {
  id: string;
  name: string;
  icon: React.ElementType;
};

export type Modifier = {
  id: string;
  name: string;
  price: number;
};

export type ModifierGroup = {
  id: string;
  name: string;
  min_selection: number;
  max_selection: number;
  modifiers: Modifier[];
};

export type MenuItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  color: string;
  image: string;
  modifier_groups?: ModifierGroup[];
};

export type CartItem = MenuItem & {
  quantity: number;
  selectedModifiers?: Modifier[];
  notes?: string;
  isExisting?: boolean;
};

export type Table = {
  id: string;
  table_number: string;
  capacity: number;
  current_status: 'free' | 'occupied' | 'reserved';
  active_order?: {
    id: string | number;
    order_items: {
      menu_items: MenuItem;
      quantity: number;
      modifiers: Modifier[] | string;
    }[];
  } | null;
};

export type OrderType = 'dine-in' | 'takeaway';
