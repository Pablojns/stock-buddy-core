import { AlertTriangle } from 'lucide-react';
import { Product } from '@/types/inventory';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface LowStockAlertsProps {
  products: Product[];
  onRestock: (product: Product) => void;
}

export function LowStockAlerts({ products, onRestock }: LowStockAlertsProps) {
  const lowStock = products.filter((p) => p.currentQuantity <= p.minimumQuantity);

  if (lowStock.length === 0) {
    return (
      <div className="bg-card rounded-xl border shadow-card p-6 text-center text-muted-foreground">
        <p className="text-sm">Nenhum produto com estoque baixo. ✓</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {lowStock.map((p) => (
        <div key={p.id} className="bg-card rounded-xl border border-destructive/20 shadow-card p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
            <div className="min-w-0">
              <p className="font-medium truncate">{p.name}</p>
              <p className="text-xs text-muted-foreground">
                Atual: <span className="text-destructive font-semibold">{p.currentQuantity}</span> · Mínimo: {p.minimumQuantity}
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="shrink-0 gap-1" onClick={() => onRestock(p)}>
            <Plus className="w-3.5 h-3.5" /> Repor
          </Button>
        </div>
      ))}
    </div>
  );
}
