import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ItemForm {
  product_id: string;
  product_name: string;
  product_code: string;
  product_image: string;
  quantity: number;
  unit_price: number;
}

export function OrderCreateDialog({ open, onOpenChange }: Props) {
  const { createOrder } = useOrders();
  const [saving, setSaving] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [clientName, setClientName] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<ItemForm[]>([{ product_id: '', product_name: '', product_code: '', product_image: '', quantity: 1, unit_price: 0 }]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      supabase.from('products').select('id, name, code, sale_price').then(({ data }) => {
        if (data) setProducts(data);
      });
    }
  }, [open]);

  const addItem = () => setItems([...items, { product_id: '', product_name: '', product_code: '', product_image: '', quantity: 1, unit_price: 0 }]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));

  const updateItem = (idx: number, field: keyof ItemForm, value: any) => {
    const updated = [...items];
    if (field === 'product_id' && value) {
      const p = products.find(p => p.id === value);
      if (p) {
        updated[idx] = { ...updated[idx], product_id: p.id, product_name: p.name, product_code: p.code, unit_price: Number(p.sale_price) };
      }
    } else {
      (updated[idx] as any)[field] = value;
    }
    setItems(updated);
  };

  const handleSubmit = async () => {
    if (!orderNumber || !clientName || items.length === 0) return;
    setSaving(true);
    await createOrder(
      { order_number: orderNumber, client_name: clientName, notes },
      items.map(i => ({
        product_id: i.product_id || null,
        product_name: i.product_name,
        product_code: i.product_code,
        product_image: i.product_image,
        quantity: i.quantity,
        unit_price: i.unit_price,
        is_separated: false,
        is_packed: false,
        is_shipped: false,
      }))
    );
    setSaving(false);
    setOrderNumber(''); setClientName(''); setNotes('');
    setItems([{ product_id: '', product_name: '', product_code: '', product_image: '', quantity: 1, unit_price: 0 }]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Pedido para Separação</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Nº do Pedido</Label><Input value={orderNumber} onChange={e => setOrderNumber(e.target.value)} placeholder="PED-001" className="bg-secondary/50 border-border/50" /></div>
            <div><Label>Cliente</Label><Input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Nome do cliente" className="bg-secondary/50 border-border/50" /></div>
          </div>
          <div><Label>Observações</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notas..." className="bg-secondary/50 border-border/50" rows={2} /></div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Itens do Pedido</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1"><Plus className="h-3 w-3" />Item</Button>
            </div>
            {items.map((item, idx) => (
              <div key={idx} className="flex items-end gap-2 p-3 rounded-lg bg-secondary/20 border border-border/30">
                <div className="flex-1">
                  <Label className="text-xs">Produto</Label>
                  <select value={item.product_id} onChange={e => updateItem(idx, 'product_id', e.target.value)} className="w-full h-9 rounded-md bg-secondary/50 border border-border/50 px-2 text-sm text-foreground">
                    <option value="">Manual</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.code} - {p.name}</option>)}
                  </select>
                </div>
                {!item.product_id && (
                  <div className="flex-1"><Label className="text-xs">Nome</Label><Input value={item.product_name} onChange={e => updateItem(idx, 'product_name', e.target.value)} className="bg-secondary/50 border-border/50 h-9" /></div>
                )}
                <div className="w-20"><Label className="text-xs">Qtd</Label><Input type="number" min={1} value={item.quantity} onChange={e => updateItem(idx, 'quantity', Number(e.target.value))} className="bg-secondary/50 border-border/50 h-9" /></div>
                {items.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(idx)} className="h-9 w-9 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                )}
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={saving || !orderNumber || !clientName}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Criar Pedido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
