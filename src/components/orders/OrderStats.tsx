import { ShoppingCart, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';
import { Order, ORDER_STATUS_CONFIG, OrderStatus } from '@/types/orders';

interface OrderStatsProps {
  orders: Order[];
}

export function OrderStats({ orders }: OrderStatsProps) {
  const total = orders.length;
  const active = orders.filter((o) => !['completed', 'cancelled'].includes(o.status)).length;
  const completed = orders.filter((o) => o.status === 'completed').length;
  const totalRevenue = orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.totalValue, 0);

  const stats = [
    { label: 'Total de Pedidos', value: total, icon: ShoppingCart, color: 'text-primary' },
    { label: 'Em Andamento', value: active, icon: Clock, color: 'text-accent' },
    { label: 'Concluídos', value: completed, icon: CheckCircle, color: 'text-success' },
    { label: 'Faturamento', value: `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: Truck, color: 'text-primary' },
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
