import { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Package, Plus, ArrowRightLeft, AlertTriangle, History, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

// Inventory
import { StatsCards } from '@/components/inventory/StatsCards';
import { ProductTable } from '@/components/inventory/ProductTable';
import { ProductFormDialog } from '@/components/inventory/ProductFormDialog';
import { MovementDialog } from '@/components/inventory/MovementDialog';
import { MovementHistory } from '@/components/inventory/MovementHistory';
import { LowStockAlerts } from '@/components/inventory/LowStockAlerts';
import { Product, MovementType } from '@/types/inventory';
import { getProducts, getMovements, addProduct, updateProduct, deleteProduct, addMovement } from '@/lib/inventory-store';

// Orders
import { OrderStats } from '@/components/orders/OrderStats';
import { OrderTable } from '@/components/orders/OrderTable';
import { OrderFormDialog } from '@/components/orders/OrderFormDialog';
import { OrderDetailDialog } from '@/components/orders/OrderDetailDialog';
import { Order, OrderStatus } from '@/types/orders';
import { getOrders, createOrder, updateOrder, changeOrderStatus, deleteOrder } from '@/lib/orders-store';
import { generateOrderPDF } from '@/lib/generate-order-pdf';

type Module = 'inventory' | 'orders';

const Index = () => {
  const [activeModule, setActiveModule] = useState<Module>('inventory');

  // --- Inventory state ---
  const [products, setProducts] = useState<Product[]>(getProducts);
  const [movements, setMovements] = useState(getMovements);
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [movementOpen, setMovementOpen] = useState(false);
  const [movementPreselect, setMovementPreselect] = useState<{ product: Product | null; type: MovementType }>({ product: null, type: 'entry' });

  // --- Orders state ---
  const [orders, setOrders] = useState<Order[]>(getOrders);
  const [orderFormOpen, setOrderFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);

  const refresh = useCallback(() => {
    setProducts(getProducts());
    setMovements(getMovements());
    setOrders(getOrders());
  }, []);

  // --- Inventory handlers ---
  const handleSaveProduct = (data: Omit<Product, 'id' | 'code' | 'lastMovement'>) => {
    if (editingProduct) { updateProduct(editingProduct.id, data); toast.success('Produto atualizado!'); }
    else { addProduct(data); toast.success('Produto cadastrado!'); }
    setEditingProduct(null);
    refresh();
  };

  const handleDeleteProduct = (id: string) => {
    if (!confirm('Deseja realmente excluir este produto?')) return;
    deleteProduct(id); toast.success('Produto excluído.'); refresh();
  };

  const handleMovement = (productId: string, type: MovementType, quantity: number, notes: string) => {
    const result = addMovement(productId, type, quantity, notes);
    if (!result) { toast.error('Quantidade insuficiente em estoque!'); return; }
    toast.success(`${type === 'entry' ? 'Entrada' : 'Saída'} de ${quantity} unidade(s) registrada.`);
    refresh();
  };

  // --- Order handlers ---
  const handleSaveOrder = (data: Omit<Order, 'id' | 'orderNumber' | 'status' | 'createdAt' | 'updatedAt'>) => {
    if (editingOrder) { updateOrder(editingOrder.id, data); toast.success('Pedido atualizado!'); }
    else { createOrder(data); toast.success('Pedido criado!'); }
    setEditingOrder(null);
    refresh();
  };

  const handleDeleteOrder = (id: string) => {
    if (!confirm('Deseja realmente excluir este pedido?')) return;
    deleteOrder(id); toast.success('Pedido excluído.'); refresh();
  };

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    const result = changeOrderStatus(orderId, status);
    if (!result) { toast.error('Erro ao alterar status.'); return; }
    if (result.stockErrors.length > 0) {
      result.stockErrors.forEach((err) => toast.error(err));
    }
    toast.success(`Status alterado para: ${status === 'completed' ? 'Concluído (estoque atualizado)' : status}`);
    setViewingOrder(result.order);
    refresh();
  };

  const handleGeneratePDF = (order: Order) => {
    generateOrderPDF(order);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-header text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {activeModule === 'inventory' ? <Package className="w-7 h-7" /> : <ShoppingCart className="w-7 h-7" />}
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  {activeModule === 'inventory' ? 'Controle de Estoque' : 'Gestão de Pedidos'}
                </h1>
                <p className="text-sm opacity-80">
                  {activeModule === 'inventory' ? 'Produtos, movimentações e alertas' : 'Pedidos, status e envios'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Module switcher */}
              <div className="flex bg-white/10 rounded-lg p-0.5 mr-2">
                <button
                  onClick={() => setActiveModule('inventory')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${activeModule === 'inventory' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white'}`}
                >
                  <Package className="w-3.5 h-3.5 inline mr-1" />Estoque
                </button>
                <button
                  onClick={() => setActiveModule('orders')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${activeModule === 'orders' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white'}`}
                >
                  <ShoppingCart className="w-3.5 h-3.5 inline mr-1" />Pedidos
                </button>
              </div>

              {activeModule === 'inventory' ? (
                <>
                  <Button variant="secondary" size="sm" className="gap-1.5" onClick={() => { setMovementPreselect({ product: null, type: 'entry' }); setMovementOpen(true); }}>
                    <ArrowRightLeft className="w-4 h-4" /> Movimentação
                  </Button>
                  <Button size="sm" className="gap-1.5 bg-white/15 hover:bg-white/25 text-white border-white/20" onClick={() => { setEditingProduct(null); setProductFormOpen(true); }}>
                    <Plus className="w-4 h-4" /> Novo Produto
                  </Button>
                </>
              ) : (
                <Button size="sm" className="gap-1.5 bg-white/15 hover:bg-white/25 text-white border-white/20" onClick={() => { setEditingOrder(null); setOrderFormOpen(true); }}>
                  <Plus className="w-4 h-4" /> Novo Pedido
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {activeModule === 'inventory' ? (
          <>
            <StatsCards products={products} />
            <Tabs defaultValue="products" className="space-y-4">
              <TabsList>
                <TabsTrigger value="products" className="gap-1.5"><Package className="w-4 h-4" /> Produtos</TabsTrigger>
                <TabsTrigger value="history" className="gap-1.5"><History className="w-4 h-4" /> Movimentações</TabsTrigger>
                <TabsTrigger value="alerts" className="gap-1.5"><AlertTriangle className="w-4 h-4" /> Alertas</TabsTrigger>
              </TabsList>
              <TabsContent value="products">
                <ProductTable products={products} onEdit={(p) => { setEditingProduct(p); setProductFormOpen(true); }} onDelete={handleDeleteProduct} onMovement={(p, t) => { setMovementPreselect({ product: p, type: t }); setMovementOpen(true); }} />
              </TabsContent>
              <TabsContent value="history"><MovementHistory movements={movements} /></TabsContent>
              <TabsContent value="alerts"><LowStockAlerts products={products} onRestock={(p) => { setMovementPreselect({ product: p, type: 'entry' }); setMovementOpen(true); }} /></TabsContent>
            </Tabs>
          </>
        ) : (
          <>
            <OrderStats orders={orders} />
            <OrderTable
              orders={orders}
              onView={(o) => { setViewingOrder(o); setOrderDetailOpen(true); }}
              onEdit={(o) => { setEditingOrder(o); setOrderFormOpen(true); }}
              onDelete={handleDeleteOrder}
            />
          </>
        )}
      </main>

      {/* Dialogs */}
      <ProductFormDialog open={productFormOpen} onOpenChange={setProductFormOpen} onSave={handleSaveProduct} product={editingProduct} />
      <MovementDialog open={movementOpen} onOpenChange={setMovementOpen} products={products} onSubmit={handleMovement} preselectedProduct={movementPreselect.product} preselectedType={movementPreselect.type} />
      <OrderFormDialog open={orderFormOpen} onOpenChange={setOrderFormOpen} onSave={handleSaveOrder} products={products} order={editingOrder} />
      <OrderDetailDialog open={orderDetailOpen} onOpenChange={setOrderDetailOpen} order={viewingOrder} onStatusChange={handleStatusChange} onGeneratePDF={handleGeneratePDF} />
    </div>
  );
};

export default Index;
