// Legacy inventory-store kept for backward compatibility with orders module
// New code should use useInventory hook instead

import { Product, StockMovement } from '@/types/inventory';

const PRODUCTS_KEY = 'inventory_products';
const MOVEMENTS_KEY = 'inventory_movements';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function generateCode(): string {
  const n = Math.floor(Math.random() * 999999) + 1;
  return `PRD-${n.toString().padStart(6, '0')}`;
}

export function getProducts(): Product[] {
  const raw = localStorage.getItem(PRODUCTS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveProducts(products: Product[]) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function getMovements(): StockMovement[] {
  const raw = localStorage.getItem(MOVEMENTS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveMovements(movements: StockMovement[]) {
  localStorage.setItem(MOVEMENTS_KEY, JSON.stringify(movements));
}

export function addProduct(product: Partial<Product>): Product {
  const products = getProducts();
  const newProduct = {
    ...product,
    id: generateId(),
    code: generateCode(),
    last_movement: new Date().toISOString(),
  } as Product;
  products.push(newProduct);
  saveProducts(products);
  return newProduct;
}

export function updateProduct(id: string, data: Partial<Product>): Product | null {
  const products = getProducts();
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return null;
  products[idx] = { ...products[idx], ...data };
  saveProducts(products);
  return products[idx];
}

export function deleteProduct(id: string) {
  saveProducts(getProducts().filter(p => p.id !== id));
}

export function addMovement(
  productId: string,
  type: 'entry' | 'exit' | 'order_exit',
  quantity: number,
  notes: string
): { product: Product; movement: StockMovement } | null {
  const products = getProducts();
  const idx = products.findIndex(p => p.id === productId);
  if (idx === -1) return null;

  const product = products[idx];
  const previousQuantity = product.current_quantity;
  const newQuantity = type === 'entry' ? previousQuantity + quantity : previousQuantity - quantity;

  product.current_quantity = newQuantity;
  product.last_movement = new Date().toISOString();
  products[idx] = product;
  saveProducts(products);

  const movement: StockMovement = {
    id: generateId(),
    user_id: '',
    product_id: productId,
    product_name: product.name,
    type,
    quantity,
    previous_quantity: previousQuantity,
    new_quantity: newQuantity,
    created_at: new Date().toISOString(),
    notes,
  };
  const movements = getMovements();
  movements.unshift(movement);
  saveMovements(movements);

  return { product, movement };
}

export function exportToCSV(products: Product[]): string {
  const header = 'Código,Nome,Categoria,Fornecedor,Rua,Prateleira,Nível,Atual,Reservado,Mínimo,Custo,Venda';
  const rows = products.map(p =>
    [p.code, `"${p.name}"`, p.category, p.supplier || '',
     p.location_street, p.location_shelf, p.location_level,
     p.current_quantity, p.reserved_quantity, p.minimum_quantity,
     Number(p.cost_price).toFixed(2), Number(p.sale_price).toFixed(2),
    ].join(',')
  );
  return [header, ...rows].join('\n');
}

export function exportMovementsToCSV(movements: StockMovement[]): string {
  const header = 'Data,Produto,Tipo,Quantidade,Anterior,Novo,Observações';
  const typeLabel: Record<string, string> = { entry: 'Entrada', exit: 'Saída', order_exit: 'Saída (Pedido)' };
  const rows = movements.map(m =>
    [new Date(m.created_at).toLocaleString('pt-BR'), `"${m.product_name}"`, typeLabel[m.type] || m.type, m.quantity, m.previous_quantity, m.new_quantity, `"${m.notes}"`].join(',')
  );
  return [header, ...rows].join('\n');
}
