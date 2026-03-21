import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { StockMovement } from '@/types/inventory';
import { exportMovementsToCSV } from '@/lib/inventory-store';

interface MovementHistoryProps {
  movements: StockMovement[];
}

const typeConfig = {
  entry: { label: 'Entrada', variant: 'default' as const },
  exit: { label: 'Saída', variant: 'destructive' as const },
  order_exit: { label: 'Saída (Pedido)', variant: 'destructive' as const },
};

export function MovementHistory({ movements }: MovementHistoryProps) {
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const filtered = movements.filter((m) => {
    const matchesSearch = !search || m.productName.toLowerCase().includes(search.toLowerCase());
    const matchesDate = !dateFilter || m.date.startsWith(dateFilter);
    return matchesSearch && matchesDate;
  });

  const handleExport = () => {
    const csv = exportMovementsToCSV(filtered);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `movimentacoes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input placeholder="Buscar por produto..." value={search} onChange={(e) => setSearch(e.target.value)} className="sm:max-w-xs" />
        <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="sm:max-w-[180px]" />
        <Button variant="outline" size="sm" onClick={handleExport} className="ml-auto gap-1.5">
          <Download className="w-4 h-4" /> CSV
        </Button>
      </div>

      <div className="bg-card rounded-xl border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Data/Hora</TableHead>
                <TableHead className="font-semibold">Produto</TableHead>
                <TableHead className="font-semibold">Tipo</TableHead>
                <TableHead className="font-semibold text-right">Qtd</TableHead>
                <TableHead className="font-semibold text-right">Anterior</TableHead>
                <TableHead className="font-semibold text-right">Novo</TableHead>
                <TableHead className="font-semibold">Observações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhuma movimentação encontrada.</TableCell></TableRow>
              )}
              {filtered.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="text-sm whitespace-nowrap">{new Date(m.date).toLocaleString('pt-BR')}</TableCell>
                  <TableCell className="font-medium">{m.productName}</TableCell>
                  <TableCell><Badge variant={typeConfig[m.type].variant} className="text-xs">{typeConfig[m.type].label}</Badge></TableCell>
                  <TableCell className="text-right font-semibold">{m.quantity}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{m.previousQuantity}</TableCell>
                  <TableCell className="text-right font-semibold">{m.newQuantity}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{m.notes || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
