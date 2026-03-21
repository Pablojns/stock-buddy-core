export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  ncm: string;
  location: {
    street: string;
    shelf: string;
    level: string;
  };
  currentQuantity: number;
  minimumQuantity: number;
  costPrice: number;
  salePrice: number;
  entryDate: string;
  lastMovement: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'entry' | 'exit' | 'order_exit';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  date: string;
  notes: string;
}

export type MovementType = 'entry' | 'exit' | 'order_exit';

export const CATEGORIES = [
  'Eletrônicos',
  'Ferramentas',
  'Matéria-Prima',
  'Embalagens',
  'Peças',
  'Insumos',
  'Acabamento',
  'Outros',
];
