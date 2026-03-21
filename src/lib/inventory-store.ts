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

const SEED_PRODUCTS: Product[] = [
  { id: generateId(), code: 'PRD-000001', name: 'Parafuso Sextavado M8', description: 'Parafuso sextavado aço carbono M8x30mm', category: 'Peças', ncm: '7318.15.00', location: { street: 'A', shelf: '03', level: '2' }, currentQuantity: 450, minimumQuantity: 100, costPrice: 0.35, salePrice: 0.75, entryDate: '2025-11-15', lastMovement: '2026-02-28' },
  { id: generateId(), code: 'PRD-000002', name: 'Chapa de Aço 1020', description: 'Chapa de aço 1020 2mm espessura 1x2m', category: 'Matéria-Prima', ncm: '7208.51.00', location: { street: 'B', shelf: '01', level: '1' }, currentQuantity: 12, minimumQuantity: 5, costPrice: 185.00, salePrice: 290.00, entryDate: '2025-12-01', lastMovement: '2026-02-20' },
  { id: generateId(), code: 'PRD-000003', name: 'Motor Elétrico 1CV', description: 'Motor elétrico trifásico 1CV 3500RPM', category: 'Eletrônicos', ncm: '8501.52.00', location: { street: 'C', shelf: '02', level: '1' }, currentQuantity: 3, minimumQuantity: 5, costPrice: 520.00, salePrice: 890.00, entryDate: '2025-10-20', lastMovement: '2026-01-15' },
  { id: generateId(), code: 'PRD-000004', name: 'Caixa Papelão 40x30x20', description: 'Caixa de papelão ondulado reforçado', category: 'Embalagens', ncm: '4819.10.00', location: { street: 'D', shelf: '05', level: '3' }, currentQuantity: 80, minimumQuantity: 200, costPrice: 3.50, salePrice: 6.90, entryDate: '2026-01-10', lastMovement: '2026-02-27' },
  { id: generateId(), code: 'PRD-000005', name: 'Tinta Epóxi Cinza', description: 'Tinta epóxi industrial cinza 3.6L', category: 'Acabamento', ncm: '3208.90.29', location: { street: 'A', shelf: '07', level: '2' }, currentQuantity: 18, minimumQuantity: 10, costPrice: 89.90, salePrice: 149.90, entryDate: '2026-02-05', lastMovement: '2026-02-25' },
  { id: generateId(), code: 'PRD-000006', name: 'Sensor Indutivo PNP', description: 'Sensor indutivo PNP 12mm NF 10-30VDC', category: 'Eletrônicos', ncm: '8536.50.90', location: { street: 'C', shelf: '04', level: '2' }, currentQuantity: 2, minimumQuantity: 8, costPrice: 45.00, salePrice: 85.00, entryDate: '2025-09-12', lastMovement: '2026-02-10' },
];

export function getProducts(): Product[] {
  const raw = localStorage.getItem(PRODUCTS_KEY);
  if (!raw) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(SEED_PRODUCTS));
    return SEED_PRODUCTS;
  }
  return JSON.parse(raw);
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

export function addProduct(product: Omit<Product, 'id' | 'code' | 'lastMovement'>): Product {
  const products = getProducts();
  const newProduct: Product = {
    ...product,
    id: generateId(),
    code: generateCode(),
    lastMovement: new Date().toISOString().split('T')[0],
  };
  products.push(newProduct);
  saveProducts(products);
  return newProduct;
}

export function updateProduct(id: string, data: Partial<Product>): Product | null {
  const products = getProducts();
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  products[idx] = { ...products[idx], ...data };
  saveProducts(products);
  return products[idx];
}

export function deleteProduct(id: string) {
  const products = getProducts().filter((p) => p.id !== id);
  saveProducts(products);
}

export function addMovement(
  productId: string,
  type: 'entry' | 'exit' | 'order_exit',
  quantity: number,
  notes: string
): { product: Product; movement: StockMovement } | null {
  const products = getProducts();
  const idx = products.findIndex((p) => p.id === productId);
  if (idx === -1) return null;

  const product = products[idx];
  const previousQuantity = product.currentQuantity;
  const newQuantity = type === 'entry' ? previousQuantity + quantity : previousQuantity - quantity;

  if (newQuantity < 0) return null;

  product.currentQuantity = newQuantity;
  product.lastMovement = new Date().toISOString().split('T')[0];
  products[idx] = product;
  saveProducts(products);

  const movement: StockMovement = {
    id: generateId(),
    productId,
    productName: product.name,
    type,
    quantity,
    previousQuantity,
    newQuantity,
    date: new Date().toISOString(),
    notes,
  };
  const movements = getMovements();
  movements.unshift(movement);
  saveMovements(movements);

  return { product, movement };
}

export function exportToCSV(products: Product[]): string {
  const header = 'Código,Nome,Descrição,Categoria,NCM,Rua,Prateleira,Nível,Qtd Atual,Qtd Mínima,Custo,Venda,Entrada,Última Mov.';
  const rows = products.map((p) =>
    [
      p.code, `"${p.name}"`, `"${p.description}"`, p.category, p.ncm,
      p.location.street, p.location.shelf, p.location.level,
      p.currentQuantity, p.minimumQuantity,
      p.costPrice.toFixed(2), p.salePrice.toFixed(2),
      p.entryDate, p.lastMovement,
    ].join(',')
  );
  return [header, ...rows].join('\n');
}

export function exportMovementsToCSV(movements: StockMovement[]): string {
  const header = 'Data,Produto,Tipo,Quantidade,Saldo Anterior,Novo Saldo,Observações';
  const typeLabel = { entry: 'Entrada', exit: 'Saída', order_exit: 'Saída (Pedido)' };
  const rows = movements.map((m) =>
    [
      new Date(m.date).toLocaleString('pt-BR'),
      `"${m.productName}"`,
      typeLabel[m.type],
      m.quantity, m.previousQuantity, m.newQuantity,
      `"${m.notes}"`,
    ].join(',')
  );
  return [header, ...rows].join('\n');
}
