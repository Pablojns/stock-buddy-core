import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Product, MovementType } from '@/types/inventory';

interface MovementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  onSubmit: (productId: string, type: MovementType, quantity: number, notes: string) => void;
  preselectedProduct?: Product | null;
  preselectedType?: MovementType;
}

export function MovementDialog({ open, onOpenChange, products, onSubmit, preselectedProduct, preselectedType }: MovementDialogProps) {
  const [productId, setProductId] = useState('');
  const [type, setType] = useState<MovementType>('entry');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open) {
      setProductId(preselectedProduct?.id || '');
      setType(preselectedType || 'entry');
      setQuantity(1);
      setNotes('');
    }
  }, [open, preselectedProduct, preselectedType]);

  const selectedProduct = products.find(p => p.id === productId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;
    onSubmit(productId, type, quantity, notes);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Movimentação de Estoque</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Produto *</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger><SelectValue placeholder="Selecione o produto" /></SelectTrigger>
              <SelectContent>
                {products.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.code} — {p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedProduct && (
              <p className="text-xs text-muted-foreground">
                Atual: <span className="font-semibold">{selectedProduct.current_quantity}</span> · Reservado: <span className="text-amber-400">{selectedProduct.reserved_quantity}</span> · Disponível: <span className="text-emerald-400">{selectedProduct.current_quantity - selectedProduct.reserved_quantity}</span>
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Tipo *</Label>
            <Select value={type} onValueChange={v => setType(v as MovementType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="entry">Entrada</SelectItem>
                <SelectItem value="exit">Saída Manual</SelectItem>
                <SelectItem value="order_exit">Saída por Pedido</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Quantidade *</Label>
            <Input type="number" min={1} required value={quantity} onChange={e => setQuantity(Number(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">Confirmar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
