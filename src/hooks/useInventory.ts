import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Product, StockMovement, MovementType } from '@/types/inventory';
import { toast } from '@/hooks/use-toast';

export function useInventory() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');
    if (error) { toast({ title: 'Erro ao carregar produtos', description: error.message, variant: 'destructive' }); return; }
    setProducts((data || []) as unknown as Product[]);
  }, []);

  const fetchMovements = useCallback(async () => {
    const { data, error } = await supabase
      .from('stock_movements')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { toast({ title: 'Erro ao carregar movimentações', description: error.message, variant: 'destructive' }); return; }
    setMovements((data || []) as unknown as StockMovement[]);
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([fetchProducts(), fetchMovements()]).finally(() => setLoading(false));
  }, [user, fetchProducts, fetchMovements]);

  const addProduct = async (data: Partial<Product>) => {
    if (!user) return;
    const code = `PRD-${Date.now().toString().slice(-6)}`;
    const { error } = await supabase.from('products').insert({
      ...data,
      code,
      user_id: user.id,
    } as any);
    if (error) { toast({ title: 'Erro ao cadastrar', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Produto cadastrado com sucesso' });
    fetchProducts();
  };

  const updateProduct = async (id: string, data: Partial<Product>) => {
    const { error } = await supabase.from('products').update(data as any).eq('id', id);
    if (error) { toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Produto atualizado' });
    fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) { toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Produto excluído' });
    fetchProducts();
  };

  const addMovement = async (productId: string, type: MovementType, quantity: number, notes: string) => {
    if (!user) return;
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const prevQty = product.current_quantity;
    const newQty = type === 'entry' ? prevQty + quantity : prevQty - quantity;

    const { error: movError } = await supabase.from('stock_movements').insert({
      user_id: user.id,
      product_id: productId,
      product_name: product.name,
      type,
      quantity,
      previous_quantity: prevQty,
      new_quantity: newQty,
      notes,
    } as any);
    if (movError) { toast({ title: 'Erro na movimentação', description: movError.message, variant: 'destructive' }); return; }

    await supabase.from('products').update({
      current_quantity: newQty,
      last_movement: new Date().toISOString(),
    } as any).eq('id', productId);

    toast({ title: type === 'entry' ? 'Entrada registrada' : 'Saída registrada' });
    fetchProducts();
    fetchMovements();
  };

  return { products, movements, loading, addProduct, updateProduct, deleteProduct, addMovement, refetch: () => { fetchProducts(); fetchMovements(); } };
}
