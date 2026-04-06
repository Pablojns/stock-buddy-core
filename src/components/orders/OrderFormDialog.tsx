import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';
import { Order, OrderItem } from '@/types/orders';
import { Product } from '@/types/inventory';

interface OrderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Omit<Order, 'id' | 'orderNumber' | 'status' | 'createdAt' | 'updatedAt'>) => void;
  products: Product[];
  order?: Order | null;
}

const emptyAddress = { street: '', number: '', complement: '', neighborhood: '', city: '', state: '', zipCode: '' };

export function OrderFormDialog({ open, onOpenChange, onSave, products, order }: OrderFormDialogProps) {
  const [clientName, setClientName] = useState('');
  const [clientDocument, setClientDocument] = useState('');
  const [address, setAddress] = useState(emptyAddress);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [invoice, setInvoice] = useState('');
  const [carrier, setCarrier] = useState('');
  const [shippingDate, setShippingDate] = useState('');
  const [trackingCode, setTrackingCode] = useState('');

  useEffect(() => {
    if (open && order) {
      setClientName(order.clientName);
      setClientDocument(order.clientDocument);
      setAddress({ ...order.address });
      setItems([...order.items]);
      setInvoice(order.invoice);
      setCarrier(order.carrier);
      setShippingDate(order.shippingDate);
      setTrackingCode(order.trackingCode);
    } else if (open) {
      setClientName(''); setClientDocument(''); setAddress(emptyAddress);
      setItems([]); setInvoice(''); setCarrier(''); setShippingDate(''); setTrackingCode('');
    }
  }, [open, order]);

  const addItem = () => {
    setItems([...items, { productId: '', productName: '', productCode: '', quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const updated = [...items];
    if (field === 'productId') {
      const product = products.find((p) => p.id === value);
      if (product) {
        updated[index] = {
          ...updated[index],
          productId: product.id,
          productName: product.name,
          productCode: product.code,
          unitPrice: product.sale_price,
          total: product.sale_price * updated[index].quantity,
        };
      }
    } else if (field === 'quantity') {
      updated[index].quantity = Number(value);
      updated[index].total = updated[index].unitPrice * Number(value);
    }
    setItems(updated);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalValue = items.reduce((sum, item) => sum + item.total, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    onSave({
      clientName, clientDocument, address, items, totalValue,
      invoice, carrier, shippingDate, trackingCode,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{order ? 'Editar Pedido' : 'Novo Pedido'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Client */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Cliente *</Label>
              <Input required value={clientName} onChange={(e) => setClientName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>CPF/CNPJ *</Label>
              <Input required value={clientDocument} onChange={(e) => setClientDocument(e.target.value)} />
            </div>
          </div>

          {/* Address */}
          <div className="border rounded-lg p-4 space-y-3">
            <p className="text-sm font-semibold text-muted-foreground">Endereço</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2 space-y-1.5">
                <Label>Rua</Label>
                <Input value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Número</Label>
                <Input value={address.number} onChange={(e) => setAddress({ ...address, number: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Complemento</Label>
                <Input value={address.complement} onChange={(e) => setAddress({ ...address, complement: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Bairro</Label>
                <Input value={address.neighborhood} onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>CEP</Label>
                <Input value={address.zipCode} onChange={(e) => setAddress({ ...address, zipCode: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Cidade</Label>
                <Input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Estado</Label>
                <Input value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} maxLength={2} />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-muted-foreground">Produtos</p>
              <Button type="button" size="sm" variant="outline" onClick={addItem} className="gap-1">
                <Plus className="w-3.5 h-3.5" /> Adicionar
              </Button>
            </div>
            {items.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum produto adicionado.</p>
            )}
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5 space-y-1">
                  {i === 0 && <Label className="text-xs">Produto</Label>}
                  <Select value={item.productId} onValueChange={(v) => updateItem(i, 'productId', v)}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.code} — {p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-1">
                  {i === 0 && <Label className="text-xs">Qtd</Label>}
                  <Input type="number" min={1} className="h-9 text-sm" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', e.target.value)} />
                </div>
                <div className="col-span-2 space-y-1">
                  {i === 0 && <Label className="text-xs">Unitário</Label>}
                  <Input className="h-9 text-sm" disabled value={`R$ ${item.unitPrice.toFixed(2)}`} />
                </div>
                <div className="col-span-2 space-y-1">
                  {i === 0 && <Label className="text-xs">Total</Label>}
                  <Input className="h-9 text-sm font-semibold" disabled value={`R$ ${item.total.toFixed(2)}`} />
                </div>
                <div className="col-span-1 flex justify-center">
                  <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => removeItem(i)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
            {items.length > 0 && (
              <div className="text-right pt-2 border-t">
                <span className="text-sm text-muted-foreground">Total: </span>
                <span className="text-lg font-bold">R$ {totalValue.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Shipping */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Nota Fiscal</Label>
              <Input value={invoice} onChange={(e) => setInvoice(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Transportadora</Label>
              <Input value={carrier} onChange={(e) => setCarrier(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Data de Envio</Label>
              <Input type="date" value={shippingDate} onChange={(e) => setShippingDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Código de Rastreio</Label>
              <Input value={trackingCode} onChange={(e) => setTrackingCode(e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={items.length === 0}>{order ? 'Salvar' : 'Criar Pedido'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
