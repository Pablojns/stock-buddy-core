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
  onSave: (data: Omit<Product, 'id' | 'code' | 'lastMovement'>) => void;
  product?: Product | null;
}

const emptyForm = {
  name: '', description: '', category: '', ncm: '',
  location: { street: '', shelf: '', level: '' },
  currentQuantity: 0, minimumQuantity: 0,
  costPrice: 0, salePrice: 0,
  entryDate: new Date().toISOString().split('T')[0],
};

export function ProductFormDialog({ open, onOpenChange, onSave, product }: ProductFormDialogProps) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name, description: product.description,
        category: product.category, ncm: product.ncm,
        location: { ...product.location },
        currentQuantity: product.currentQuantity, minimumQuantity: product.minimumQuantity,
        costPrice: product.costPrice, salePrice: product.salePrice,
        entryDate: product.entryDate,
      });
    } else {
      setForm(emptyForm);
    }
  }, [product, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {product ? 'Editar Produto' : 'Novo Produto'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Nome *</Label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Categoria *</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>NCM</Label>
              <Input value={form.ncm} onChange={(e) => setForm({ ...form, ncm: e.target.value })} placeholder="0000.00.00" />
            </div>
            <div className="space-y-1.5">
              <Label>Data de Entrada</Label>
              <Input type="date" value={form.entryDate} onChange={(e) => setForm({ ...form, entryDate: e.target.value })} />
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-3">
            <p className="text-sm font-semibold text-muted-foreground">Localização Física</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Rua</Label>
                <Input value={form.location.street} onChange={(e) => setForm({ ...form, location: { ...form.location, street: e.target.value } })} />
              </div>
              <div className="space-y-1.5">
                <Label>Prateleira</Label>
                <Input value={form.location.shelf} onChange={(e) => setForm({ ...form, location: { ...form.location, shelf: e.target.value } })} />
              </div>
              <div className="space-y-1.5">
                <Label>Nível</Label>
                <Input value={form.location.level} onChange={(e) => setForm({ ...form, location: { ...form.location, level: e.target.value } })} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label>Qtd Atual</Label>
              <Input type="number" min={0} value={form.currentQuantity} onChange={(e) => setForm({ ...form, currentQuantity: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label>Qtd Mínima</Label>
              <Input type="number" min={0} value={form.minimumQuantity} onChange={(e) => setForm({ ...form, minimumQuantity: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label>Custo (R$)</Label>
              <Input type="number" min={0} step={0.01} value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label>Venda (R$)</Label>
              <Input type="number" min={0} step={0.01} value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: Number(e.target.value) })} />
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
