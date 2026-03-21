import { Order, OrderStatus } from '@/types/orders';
import { addMovement } from '@/lib/inventory-store';

const ORDERS_KEY = 'orders_data';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function generateOrderNumber(): string {
  const orders = getOrders();
  const next = orders.length + 1;
  return `PED-${next.toString().padStart(5, '0')}`;
}

export function getOrders(): Order[] {
  const raw = localStorage.getItem(ORDERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveOrders(orders: Order[]) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function createOrder(data: Omit<Order, 'id' | 'orderNumber' | 'status' | 'createdAt' | 'updatedAt'>): Order {
  const orders = getOrders();
  const order: Order = {
    ...data,
    id: generateId(),
    orderNumber: generateOrderNumber(),
    status: 'created',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  orders.unshift(order);
  saveOrders(orders);
  return order;
}

export function updateOrder(id: string, data: Partial<Order>): Order | null {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  orders[idx] = { ...orders[idx], ...data, updatedAt: new Date().toISOString() };
  saveOrders(orders);
  return orders[idx];
}

export function changeOrderStatus(id: string, newStatus: OrderStatus): { order: Order; stockErrors: string[] } | null {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return null;

  const order = orders[idx];
  const stockErrors: string[] = [];

  // Auto stock deduction when order is completed
  if (newStatus === 'completed' && order.status !== 'completed') {
    for (const item of order.items) {
      const result = addMovement(item.productId, 'order_exit', item.quantity, `Pedido ${order.orderNumber}`);
      if (!result) {
        stockErrors.push(`Estoque insuficiente: ${item.productName} (qtd: ${item.quantity})`);
      }
    }
  }

  orders[idx] = { ...order, status: newStatus, updatedAt: new Date().toISOString() };
  saveOrders(orders);
  return { order: orders[idx], stockErrors };
}

export function deleteOrder(id: string) {
  const orders = getOrders().filter((o) => o.id !== id);
  saveOrders(orders);
}
