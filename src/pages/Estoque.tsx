import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { StatsCards } from '@/components/inventory/StatsCards';
import { ProductTable } from '@/components/inventory/ProductTable';
import { ProductFormDialog } from '@/components/inventory/ProductFormDialog';
import { MovementDialog } from '@/components/inventory/MovementDialog';
import { MovementHistory } from '@/components/inventory/MovementHistory';
import { LowStockAlerts } from '@/components/inventory/LowStockAlerts';
import { useInventory } from '@/hooks/useInventory';
import { Product, MovementType } from '@/types/inventory';
import { Plus, Package, ArrowDownToLine, ArrowUpFromLine, Warehouse, History, AlertTriangle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUserRole } from '@/hooks/useUserRole';

export default function Estoque() {
  const { role, displayName } = useUserRole();
  const { products, movements, loading, addProduct, updateProduct, deleteProduct, addMovement } = useInventory();

  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [movementDialogOpen, setMovementDialogOpen] = useState(false);
  const [movementProduct, setMovementProduct] = useState<Product | null>(null);
  const [movementType, setMovementType] = useState<MovementType>('entry');

  const handleEdit = (p: Product) => { setEditingProduct(p); setProductDialogOpen(true); };
  const handleNewProduct = () => { setEditingProduct(null); setProductDialogOpen(true); };
  const handleMovement = (p: Product, type: 'entry' | 'exit') => { setMovementProduct(p); setMovementType(type); setMovementDialogOpen(true); };
  const handleRestock = (p: Product) => { setMovementProduct(p); setMovementType('entry'); setMovementDialogOpen(true); };

  const handleSaveProduct = (data: Partial<Product>) => {
    if (editingProduct) updateProduct(editingProduct.id, data);
    else addProduct(data);
  };

  const handleMovementSubmit = (productId: string, type: MovementType, qty: number, notes: string) => {
    addMovement(productId, type, qty, notes);
  };

  const entryMovements = movements.filter(m => m.type === 'entry');
  const exitMovements = movements.filter(m => m.type === 'exit' || m.type === 'order_exit');

  if (loading) {
    return (
      <DashboardLayout userRole={role} displayName={displayName}>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={role} displayName={displayName}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
              <Warehouse className="w-8 h-8" /> Estoque
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Gestão de estoque WEG — Brindes Corporativos</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => { setMovementProduct(null); setMovementType('entry'); setMovementDialogOpen(true); }}>
              <ArrowDownToLine className="w-4 h-4" /> Entrada
            </Button>
            <Button className="gap-2" onClick={handleNewProduct}>
              <Plus className="w-4 h-4" /> Novo Produto
            </Button>
          </div>
        </div>

        <StatsCards products={products} />

        <Tabs defaultValue="produtos" className="space-y-4">
          <TabsList className="bg-card/50 backdrop-blur-sm border border-border/50">
            <TabsTrigger value="produtos" className="gap-1.5"><Package className="w-3.5 h-3.5" /> Produtos</TabsTrigger>
            <TabsTrigger value="entradas" className="gap-1.5"><ArrowDownToLine className="w-3.5 h-3.5" /> Entradas</TabsTrigger>
            <TabsTrigger value="saidas" className="gap-1.5"><ArrowUpFromLine className="w-3.5 h-3.5" /> Saídas</TabsTrigger>
            <TabsTrigger value="alertas" className="gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Alertas</TabsTrigger>
            <TabsTrigger value="historico" className="gap-1.5"><History className="w-3.5 h-3.5" /> Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="produtos">
            <ProductTable products={products} onEdit={handleEdit} onDelete={deleteProduct} onMovement={handleMovement} />
          </TabsContent>

          <TabsContent value="entradas">
            <MovementHistory movements={entryMovements} />
          </TabsContent>

          <TabsContent value="saidas">
            <MovementHistory movements={exitMovements} />
          </TabsContent>

          <TabsContent value="alertas">
            <LowStockAlerts products={products} onRestock={handleRestock} />
          </TabsContent>

          <TabsContent value="historico">
            <MovementHistory movements={movements} />
          </TabsContent>
        </Tabs>
      </motion.div>

      <ProductFormDialog open={productDialogOpen} onOpenChange={setProductDialogOpen} onSave={handleSaveProduct} product={editingProduct} />
      <MovementDialog open={movementDialogOpen} onOpenChange={setMovementDialogOpen} products={products} onSubmit={handleMovementSubmit} preselectedProduct={movementProduct} preselectedType={movementType} />
    </DashboardLayout>
  );
}
