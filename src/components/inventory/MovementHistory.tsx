import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { StockMovement } from '@/types/inventory';

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

  const filtered = movements.filter(m =>
    !search || m.product_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Input placeholder="Buscar por produto..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />

      <div className="rounded-xl border border-border/50 overflow-hidden bg-card/50 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
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
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhuma movimentação.</TableCell></TableRow>
              )}
              {filtered.map(m => (
                <TableRow key={m.id} className="border-b border-border/30">
                  <TableCell className="text-sm whitespace-nowrap">{new Date(m.created_at).toLocaleString('pt-BR')}</TableCell>
                  <TableCell className="font-medium">{m.product_name}</TableCell>
                  <TableCell><Badge variant={typeConfig[m.type as keyof typeof typeConfig]?.variant || 'secondary'} className="text-xs">{typeConfig[m.type as keyof typeof typeConfig]?.label || m.type}</Badge></TableCell>
                  <TableCell className="text-right font-semibold">{m.quantity}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{m.previous_quantity}</TableCell>
                  <TableCell className="text-right font-semibold">{m.new_quantity}</TableCell>
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
