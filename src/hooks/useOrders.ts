import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_code: string;
  product_image: string;
  quantity: number;
  unit_price: number;
  is_separated: boolean;
  is_packed: boolean;
  is_shipped: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  client_name: string;
  client_document: string;
  status: string;
  notes: string;
  photo_url: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  items: OrderItem[];
}

export function useOrders() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*');

      if (itemsError) throw itemsError;

      const merged = (ordersData || []).map((o: any) => ({
        ...o,
        items: (itemsData || []).filter((i: any) => i.order_id === o.id),
      }));

      setOrders(merged);
    } catch (err: any) {
      toast({ title: 'Erro ao carregar pedidos', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const createOrder = async (order: { order_number: string; client_name: string; client_document?: string; notes?: string }, items: Omit<OrderItem, 'id' | 'order_id' | 'created_at'>[]) => {
    if (!user) return;
    const { data, error } = await supabase.from('orders').insert({
      ...order,
      user_id: user.id,
    }).select().single();
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }

    if (items.length > 0) {
      const { error: itemsError } = await supabase.from('order_items').insert(
        items.map(i => ({ ...i, order_id: data.id }))
      );
      if (itemsError) { toast({ title: 'Erro nos itens', description: itemsError.message, variant: 'destructive' }); return; }
    }

    toast({ title: 'Pedido criado com sucesso!' });
    fetchOrders();
  };

  const updateItemStatus = async (itemId: string, field: 'is_separated' | 'is_packed' | 'is_shipped', value: boolean) => {
    const { error } = await supabase.from('order_items').update({ [field]: value }).eq('id', itemId);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    setOrders(prev => prev.map(o => ({
      ...o,
      items: o.items.map(i => i.id === itemId ? { ...i, [field]: value } : i),
    })));
  };

  const completeOrder = async (orderId: string, photoUrl: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Deduct stock for each item
    for (const item of order.items) {
      if (item.product_id) {
        const { data: product } = await supabase.from('products').select('current_quantity').eq('id', item.product_id).single();
        if (product) {
          const prev = product.current_quantity;
          const newQty = prev - item.quantity;
          await supabase.from('products').update({ current_quantity: newQty, last_movement: new Date().toISOString() }).eq('id', item.product_id);
          await supabase.from('stock_movements').insert({
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            type: 'exit',
            previous_quantity: prev,
            new_quantity: newQty,
            notes: `Saída automática - Pedido ${order.order_number}`,
            user_id: order.user_id,
          });
        }
      }
    }

    const { error } = await supabase.from('orders').update({
      status: 'completed',
      photo_url: photoUrl,
      completed_at: new Date().toISOString(),
    }).eq('id', orderId);

    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Pedido concluído e estoque atualizado!' });
    fetchOrders();
  };

  const uploadPhoto = async (file: File): Promise<string | null> => {
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('order-photos').upload(fileName, file);
    if (error) { toast({ title: 'Erro no upload', description: error.message, variant: 'destructive' }); return null; }
    const { data } = supabase.storage.from('order-photos').getPublicUrl(fileName);
    return data.publicUrl;
  };

  return { orders, loading, createOrder, updateItemStatus, completeOrder, uploadPhoto, refetch: fetchOrders };
}
