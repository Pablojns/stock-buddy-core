export type OrderStatus = 'created' | 'separating' | 'separated' | 'shipped' | 'completed' | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  clientName: string;
  clientDocument: string; // CPF/CNPJ
  address: {
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  items: OrderItem[];
  totalValue: number;
  status: OrderStatus;
  invoice: string; // NF
  carrier: string; // transportadora
  shippingDate: string;
  trackingCode: string;
  createdAt: string;
  updatedAt: string;
}

export const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; color: string }> = {
  created: { label: 'Criado', color: 'bg-blue-100 text-blue-800' },
  separating: { label: 'Em Separação', color: 'bg-amber-100 text-amber-800' },
  separated: { label: 'Separado', color: 'bg-purple-100 text-purple-800' },
  shipped: { label: 'Enviado', color: 'bg-cyan-100 text-cyan-800' },
  completed: { label: 'Concluído', color: 'bg-emerald-100 text-emerald-800' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
};

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  'created', 'separating', 'separated', 'shipped', 'completed',
];
