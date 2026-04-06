import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Trash2, ArrowUpDown, Plus, Minus } from 'lucide-react';
import { Product, CATEGORIES } from '@/types/inventory';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onMovement: (product: Product, type: 'entry' | 'exit') => void;
}

export function ProductTable({ products, onEdit, onDelete, onMovement }: ProductTableProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortField, setSortField] = useState<'name' | 'current_quantity' | 'last_movement'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const filtered = products
    .filter(p => {
      const s = search.toLowerCase();
      const matchesSearch = !search || p.name.toLowerCase().includes(s) || p.code.toLowerCase().includes(s) || (p.sku || '').toLowerCase().includes(s);
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortField === 'name') return a.name.localeCompare(b.name) * dir;
      if (sortField === 'current_quantity') return (a.current_quantity - b.current_quantity) * dir;
      return (a.last_movement || '').localeCompare(b.last_movement || '') * dir;
    });

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const getStockBadge = (p: Product) => {
    const available = p.current_quantity - p.reserved_quantity;
    if (p.current_quantity <= 0) return <Badge variant="destructive" className="text-[10px]">Ruptura</Badge>;
    if (p.current_quantity <= p.minimum_quantity) return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">Baixo</Badge>;
    if (available <= 0) return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">Reservado</Badge>;
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input placeholder="Buscar nome, código ou SKU..." value={search} onChange={e => setSearch(e.target.value)} className="sm:max-w-xs" />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="sm:max-w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Categorias</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border/50 overflow-hidden bg-card/50 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 border-b border-border/50">
                <TableHead className="font-semibold">Código</TableHead>
                <TableHead className="font-semibold cursor-pointer select-none" onClick={() => toggleSort('name')}>
                  <span className="flex items-center gap-1">Nome <ArrowUpDown className="w-3 h-3" /></span>
                </TableHead>
                <TableHead className="font-semibold">Categoria</TableHead>
                <TableHead className="font-semibold">Fornecedor</TableHead>
                <TableHead className="font-semibold">Local</TableHead>
                <TableHead className="font-semibold text-right cursor-pointer select-none" onClick={() => toggleSort('current_quantity')}>
                  <span className="flex items-center justify-end gap-1">Atual <ArrowUpDown className="w-3 h-3" /></span>
                </TableHead>
                <TableHead className="font-semibold text-right">Reserv.</TableHead>
                <TableHead className="font-semibold text-right">Disp.</TableHead>
                <TableHead className="font-semibold text-right">Custo</TableHead>
                <TableHead className="font-semibold text-right">Venda</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={12} className="text-center py-8 text-muted-foreground">Nenhum produto encontrado.</TableCell></TableRow>
              )}
              {filtered.map(p => {
                const available = p.current_quantity - p.reserved_quantity;
                return (
                  <TableRow key={p.id} className="group border-b border-border/30 hover:bg-white/5">
                    <TableCell className="font-mono text-xs text-muted-foreground">{p.code}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{p.name}</p>
                        {p.sku && <p className="text-[10px] text-muted-foreground">SKU: {p.sku}</p>}
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="secondary" className="text-[10px]">{p.category}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p.supplier || '—'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{[p.location_street, p.location_shelf, p.location_level].filter(Boolean).join('-') || '—'}</TableCell>
                    <TableCell className="text-right font-semibold">{p.current_quantity}</TableCell>
                    <TableCell className="text-right text-amber-400">{p.reserved_quantity}</TableCell>
                    <TableCell className={`text-right font-semibold ${available < 0 ? 'text-destructive' : available === 0 ? 'text-amber-400' : 'text-emerald-400'}`}>{available}</TableCell>
                    <TableCell className="text-right text-sm">R$ {Number(p.cost_price).toFixed(2)}</TableCell>
                    <TableCell className="text-right text-sm">R$ {Number(p.sale_price).toFixed(2)}</TableCell>
                    <TableCell>{getStockBadge(p)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onMovement(p, 'entry')} title="Entrada"><Plus className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onMovement(p, 'exit')} title="Saída"><Minus className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(p)}><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(p.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{filtered.length} de {products.length} produtos</p>
    </div>
  );
}
