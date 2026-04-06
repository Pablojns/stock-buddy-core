import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Product, CATEGORIES } from '@/types/inventory';

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<Product>) => void;
  product?: Product | null;
}

const emptyForm = {
  name: '', sku: '', description: '', category: 'Outros', supplier: '', ncm: '',
  location_street: '', location_shelf: '', location_level: '',
  current_quantity: 0, reserved_quantity: 0, minimum_quantity: 0,
  cost_price: 0, sale_price: 0,
  restock_date: '' as string | null,
  entry_date: new Date().toISOString().split('T')[0],
};

export function ProductFormDialog({ open, onOpenChange, onSave, product }: ProductFormDialogProps) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name, sku: product.sku || '', description: product.description,
        category: product.category, supplier: product.supplier || '', ncm: product.ncm,
        location_street: product.location_street, location_shelf: product.location_shelf, location_level: product.location_level,
        current_quantity: product.current_quantity, reserved_quantity: product.reserved_quantity, minimum_quantity: product.minimum_quantity,
        cost_price: product.cost_price, sale_price: product.sale_price,
        restock_date: product.restock_date || '',
        entry_date: product.entry_date || new Date().toISOString().split('T')[0],
      });
    } else {
      setForm(emptyForm);
    }
  }, [product, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, restock_date: form.restock_date || null });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{product ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Nome *</Label>
              <Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>SKU</Label>
              <Input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="SKU-001" />
            </div>
            <div className="space-y-1.5">
              <Label>Categoria *</Label>
              <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Fornecedor</Label>
              <Input value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} placeholder="Nome do fornecedor" />
            </div>
            <div className="space-y-1.5">
              <Label>NCM</Label>
              <Input value={form.ncm} onChange={e => setForm({ ...form, ncm: e.target.value })} placeholder="0000.00.00" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
          </div>

          <div className="border border-border/50 rounded-lg p-4 space-y-3">
            <p className="text-sm font-semibold text-muted-foreground">Localização Física</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Rua</Label>
                <Input value={form.location_street} onChange={e => setForm({ ...form, location_street: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Prateleira</Label>
                <Input value={form.location_shelf} onChange={e => setForm({ ...form, location_shelf: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Nível</Label>
                <Input value={form.location_level} onChange={e => setForm({ ...form, location_level: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Estoque Atual</Label>
              <Input type="number" value={form.current_quantity} onChange={e => setForm({ ...form, current_quantity: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label>Reservado</Label>
              <Input type="number" min={0} value={form.reserved_quantity} onChange={e => setForm({ ...form, reserved_quantity: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label>Estoque Mínimo</Label>
              <Input type="number" min={0} value={form.minimum_quantity} onChange={e => setForm({ ...form, minimum_quantity: Number(e.target.value) })} />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label>Custo (R$)</Label>
              <Input type="number" min={0} step={0.01} value={form.cost_price} onChange={e => setForm({ ...form, cost_price: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label>Venda (R$)</Label>
              <Input type="number" min={0} step={0.01} value={form.sale_price} onChange={e => setForm({ ...form, sale_price: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label>Previsão Reposição</Label>
              <Input type="date" value={form.restock_date || ''} onChange={e => setForm({ ...form, restock_date: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Data Entrada</Label>
              <Input type="date" value={form.entry_date} onChange={e => setForm({ ...form, entry_date: e.target.value })} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">{product ? 'Salvar' : 'Cadastrar'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
