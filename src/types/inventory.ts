export interface Product {
  id: string;
  user_id: string;
  code: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  supplier: string;
  ncm: string;
  location_street: string;
  location_shelf: string;
  location_level: string;
  current_quantity: number;
  reserved_quantity: number;
  minimum_quantity: number;
  cost_price: number;
  sale_price: number;
  restock_date: string | null;
  entry_date: string;
  last_movement: string;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  type: 'entry' | 'exit' | 'order_exit';
  quantity: number;
  previous_quantity: number;
  new_quantity: number;
  notes: string;
  created_at: string;
}

export type MovementType = 'entry' | 'exit' | 'order_exit';

export const CATEGORIES = [
  'Cadernos',
  'Canetas',
  'Camisas',
  'Bonés',
  'Brindes Personalizados',
  'Embalagens',
  'Material Promocional',
  'Outros',
];
