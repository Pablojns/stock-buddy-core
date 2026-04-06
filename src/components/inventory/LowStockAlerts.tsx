import { AlertTriangle, ShieldAlert, CalendarClock } from 'lucide-react';
import { Product } from '@/types/inventory';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';

interface LowStockAlertsProps {
  products: Product[];
  onRestock: (product: Product) => void;
}

export function LowStockAlerts({ products, onRestock }: LowStockAlertsProps) {
  const outOfStock = products.filter(p => p.current_quantity <= 0);
  const lowStock = products.filter(p => p.current_quantity > 0 && p.current_quantity <= p.minimum_quantity);
  const restockSoon = products.filter(p => {
    if (!p.restock_date) return false;
    const diff = (new Date(p.restock_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  });

  if (outOfStock.length === 0 && lowStock.length === 0 && restockSoon.length === 0) {
    return (
      <GlassCard className="p-6 text-center text-muted-foreground">
        <p className="text-sm">Nenhum alerta ativo. Estoque saudável ✓</p>
      </GlassCard>
    );
  }

  const renderItem = (p: Product, icon: React.ReactNode, label: string, color: string) => (
    <div key={p.id} className={`rounded-xl border ${color} p-4 flex items-center justify-between gap-4 bg-card/50 backdrop-blur-sm`}>
      <div className="flex items-center gap-3 min-w-0">
        {icon}
        <div className="min-w-0">
          <p className="font-medium truncate text-sm">{p.name}</p>
          <p className="text-xs text-muted-foreground">
            {label} · Atual: <span className="font-semibold">{p.current_quantity}</span> · Mín: {p.minimum_quantity}
          </p>
        </div>
      </div>
      <Button size="sm" variant="outline" className="shrink-0 gap-1" onClick={() => onRestock(p)}>
        <Plus className="w-3.5 h-3.5" /> Repor
      </Button>
    </div>
  );

  return (
    <div className="space-y-3">
      {outOfStock.map(p => renderItem(p, <ShieldAlert className="w-5 h-5 text-destructive shrink-0" />, 'RUPTURA', 'border-destructive/30'))}
      {lowStock.map(p => renderItem(p, <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />, 'Estoque Baixo', 'border-amber-500/30'))}
      {restockSoon.map(p => renderItem(p, <CalendarClock className="w-5 h-5 text-primary shrink-0" />, `Reposição: ${new Date(p.restock_date!).toLocaleDateString('pt-BR')}`, 'border-primary/30'))}
    </div>
  );
}
