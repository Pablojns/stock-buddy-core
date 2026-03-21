import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Pencil, Trash2, ArrowUpDown } from 'lucide-react';
import { Order, OrderStatus, ORDER_STATUS_CONFIG } from '@/types/orders';

interface OrderTableProps {
  orders: Order[];
  onView: (order: Order) => void;
  onEdit: (order: Order) => void;
  onDelete: (id: string) => void;
}

export function OrderTable({ orders, onView, onEdit, onDelete }: OrderTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<'createdAt' | 'totalValue'>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = orders
    .filter((o) => {
      const matchesSearch = !search || o.clientName.toLowerCase().includes(search.toLowerCase()) || o.orderNumber.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortField === 'totalValue') return (a.totalValue - b.totalValue) * dir;
      return a.createdAt.localeCompare(b.createdAt) * dir;
    });

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input placeholder="Buscar por cliente ou nº pedido..." value={search} onChange={(e) => setSearch(e.target.value)} className="sm:max-w-xs" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:max-w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            {(Object.entries(ORDER_STATUS_CONFIG) as [OrderStatus, { label: string }][]).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-xl border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Nº Pedido</TableHead>
                <TableHead className="font-semibold">Cliente</TableHead>
                <TableHead className="font-semibold">CPF/CNPJ</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Itens</TableHead>
                <TableHead className="font-semibold cursor-pointer select-none text-right" onClick={() => toggleSort('totalValue')}>
                  <span className="flex items-center justify-end gap-1">Total <ArrowUpDown className="w-3.5 h-3.5" /></span>
                </TableHead>
                <TableHead className="font-semibold cursor-pointer select-none" onClick={() => toggleSort('createdAt')}>
                  <span className="flex items-center gap-1">Data <ArrowUpDown className="w-3.5 h-3.5" /></span>
                </TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhum pedido encontrado.</TableCell></TableRow>
              )}
              {filtered.map((o) => {
                const cfg = ORDER_STATUS_CONFIG[o.status];
                return (
                  <TableRow key={o.id} className="group cursor-pointer" onClick={() => onView(o)}>
                    <TableCell className="font-mono text-xs font-semibold">{o.orderNumber}</TableCell>
                    <TableCell className="font-medium">{o.clientName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{o.clientDocument}</TableCell>
                    <TableCell><Badge className={`text-xs ${cfg.color}`}>{cfg.label}</Badge></TableCell>
                    <TableCell className="text-sm">{o.items.length} produto(s)</TableCell>
                    <TableCell className="text-right font-semibold">R$ {o.totalValue.toFixed(2)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(o.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onView(o)}><Eye className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(o)}><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(o.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{filtered.length} de {orders.length} pedidos</p>
    </div>
  );
}
