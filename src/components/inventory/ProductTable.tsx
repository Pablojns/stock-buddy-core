import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Trash2, ArrowUpDown, Plus, Minus, Download } from 'lucide-react';
import { Product, CATEGORIES } from '@/types/inventory';
import { exportToCSV } from '@/lib/inventory-store';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onMovement: (product: Product, type: 'entry' | 'exit') => void;
}

export function ProductTable({ products, onEdit, onDelete, onMovement }: ProductTableProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortField, setSortField] = useState<'name' | 'currentQuantity' | 'lastMovement'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const filtered = products
    .filter((p) => {
      const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortField === 'name') return a.name.localeCompare(b.name) * dir;
      if (sortField === 'currentQuantity') return (a.currentQuantity - b.currentQuantity) * dir;
      return a.lastMovement.localeCompare(b.lastMovement) * dir;
    });

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const handleExportCSV = () => {
    const csv = exportToCSV(filtered);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `estoque_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input placeholder="Buscar por nome ou código..." value={search} onChange={(e) => setSearch(e.target.value)} className="sm:max-w-xs" />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="sm:max-w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Categorias</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={handleExportCSV} className="ml-auto gap-1.5">
          <Download className="w-4 h-4" /> CSV
        </Button>
      </div>

      <div className="bg-card rounded-xl border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Código</TableHead>
                <TableHead className="font-semibold cursor-pointer select-none" onClick={() => toggleSort('name')}>
                  <span className="flex items-center gap-1">Nome <ArrowUpDown className="w-3.5 h-3.5" /></span>
                </TableHead>
                <TableHead className="font-semibold">Categoria</TableHead>
                <TableHead className="font-semibold">Localização</TableHead>
                <TableHead className="font-semibold cursor-pointer select-none text-right" onClick={() => toggleSort('currentQuantity')}>
                  <span className="flex items-center justify-end gap-1">Estoque <ArrowUpDown className="w-3.5 h-3.5" /></span>
                </TableHead>
                <TableHead className="font-semibold text-right">Custo</TableHead>
                <TableHead className="font-semibold text-right">Venda</TableHead>
                <TableHead className="font-semibold cursor-pointer select-none" onClick={() => toggleSort('lastMovement')}>
                  <span className="flex items-center gap-1">Última Mov. <ArrowUpDown className="w-3.5 h-3.5" /></span>
                </TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Nenhum produto encontrado.</TableCell></TableRow>
              )}
              {filtered.map((p) => {
                const isLow = p.currentQuantity <= p.minimumQuantity;
                return (
                  <TableRow key={p.id} className="group">
                    <TableCell className="font-mono text-xs">{p.code}</TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell><Badge variant="secondary" className="text-xs">{p.category}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p.location.street}-{p.location.shelf}-{p.location.level}</TableCell>
                    <TableCell className="text-right">
                      <span className={`font-semibold ${isLow ? 'text-destructive' : ''}`}>{p.currentQuantity}</span>
                      {isLow && <span className="ml-1 text-xs text-destructive">(mín: {p.minimumQuantity})</span>}
                    </TableCell>
                    <TableCell className="text-right text-sm">R$ {p.costPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right text-sm">R$ {p.salePrice.toFixed(2)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.lastMovement}</TableCell>
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
