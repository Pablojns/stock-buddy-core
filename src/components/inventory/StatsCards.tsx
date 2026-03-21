import { Package, AlertTriangle, TrendingUp, Archive } from 'lucide-react';
import { Product } from '@/types/inventory';

interface StatsCardsProps {
  products: Product[];
}

export function StatsCards({ products }: StatsCardsProps) {
  const totalProducts = products.length;
  const totalItems = products.reduce((sum, p) => sum + p.currentQuantity, 0);
  const lowStock = products.filter((p) => p.currentQuantity <= p.minimumQuantity).length;
  const totalValue = products.reduce((sum, p) => sum + p.currentQuantity * p.costPrice, 0);

  const stats = [
    { label: 'Produtos Cadastrados', value: totalProducts, icon: Package, color: 'text-primary' },
    { label: 'Total em Estoque', value: totalItems.toLocaleString('pt-BR'), icon: Archive, color: 'text-primary' },
    { label: 'Estoque Baixo', value: lowStock, icon: AlertTriangle, color: lowStock > 0 ? 'text-destructive' : 'text-success' },
    { label: 'Valor Total (Custo)', value: `R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: 'text-primary' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-card rounded-xl p-5 shadow-card border border-border">
          <div className="flex items-center gap-3 mb-2">
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
            <span className="text-sm text-muted-foreground">{stat.label}</span>
          </div>
          <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
