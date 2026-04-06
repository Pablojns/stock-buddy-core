import { Package, AlertTriangle, TrendingUp, Archive, ShieldAlert, CalendarClock } from 'lucide-react';
import { Product } from '@/types/inventory';
import { GlassCard } from '@/components/ui/glass-card';

interface StatsCardsProps {
  products: Product[];
}

export function StatsCards({ products }: StatsCardsProps) {
  const totalProducts = products.length;
  const totalItems = products.reduce((sum, p) => sum + p.current_quantity, 0);
  const totalReserved = products.reduce((sum, p) => sum + p.reserved_quantity, 0);
  const available = products.reduce((sum, p) => sum + Math.max(0, p.current_quantity - p.reserved_quantity), 0);
  const lowStock = products.filter(p => p.current_quantity > 0 && p.current_quantity <= p.minimum_quantity).length;
  const outOfStock = products.filter(p => p.current_quantity <= 0).length;
  const totalValue = products.reduce((sum, p) => sum + p.current_quantity * p.cost_price, 0);
  const restockSoon = products.filter(p => {
    if (!p.restock_date) return false;
    const d = new Date(p.restock_date);
    const now = new Date();
    const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  }).length;

  const stats = [
    { label: 'Produtos', value: totalProducts, icon: Package, color: 'text-primary' },
    { label: 'Em Estoque', value: totalItems.toLocaleString('pt-BR'), icon: Archive, color: 'text-primary' },
    { label: 'Disponível', value: available.toLocaleString('pt-BR'), icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Reservado', value: totalReserved.toLocaleString('pt-BR'), icon: Package, color: 'text-amber-400' },
    { label: 'Estoque Baixo', value: lowStock, icon: AlertTriangle, color: lowStock > 0 ? 'text-amber-400' : 'text-emerald-400' },
    { label: 'Ruptura', value: outOfStock, icon: ShieldAlert, color: outOfStock > 0 ? 'text-destructive' : 'text-emerald-400' },
    { label: 'Reposição Próxima', value: restockSoon, icon: CalendarClock, color: restockSoon > 0 ? 'text-amber-400' : 'text-muted-foreground' },
    { label: 'Valor Total', value: `R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: 'text-primary' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <GlassCard key={stat.label} className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
            <span className="text-xs text-muted-foreground">{stat.label}</span>
          </div>
          <p className="text-xl font-bold tracking-tight">{stat.value}</p>
        </GlassCard>
      ))}
    </div>
  );
}
