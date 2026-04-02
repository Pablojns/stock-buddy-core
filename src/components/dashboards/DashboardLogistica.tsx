import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { Truck, Package, AlertTriangle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const kpis = [
  { label: 'Pedidos Hoje', value: '32', icon: Package, color: 'text-accent' },
  { label: 'Em Trânsito', value: '18', icon: Truck, color: 'text-primary' },
  { label: 'Estoque Alerta', value: '5', icon: AlertTriangle, color: 'text-destructive' },
  { label: 'Entregues Hoje', value: '14', icon: CheckCircle, color: 'text-success' },
];

const orders = [
  { id: '#4521', client: 'Petrobras', items: 3, status: 'Separar', priority: 'Alta' },
  { id: '#4520', client: 'Vale S.A.', items: 7, status: 'Enviar', priority: 'Média' },
  { id: '#4519', client: 'Ambev', items: 2, status: 'Separar', priority: 'Alta' },
  { id: '#4518', client: 'JBS', items: 5, status: 'Entregar', priority: 'Normal' },
  { id: '#4517', client: 'Itaú', items: 1, status: 'Enviar', priority: 'Média' },
];

const stockAlerts = [
  { product: 'Caneta Metal Premium', stock: 12, min: 50 },
  { product: 'Garrafa Térmica 500ml', stock: 5, min: 30 },
  { product: 'Camiseta Dry-fit G', stock: 8, min: 25 },
  { product: 'Mochila Executiva', stock: 3, min: 20 },
  { product: 'Caderno A5 Reciclado', stock: 15, min: 40 },
];

const carriers = [
  { name: 'Correios (SEDEX)', active: 8, onTime: '92%' },
  { name: 'JadLog', active: 5, onTime: '88%' },
  { name: 'Total Express', active: 3, onTime: '95%' },
  { name: 'Loggi', active: 2, onTime: '90%' },
];

const statusColor: Record<string, string> = {
  Separar: 'bg-warning/20 text-warning',
  Enviar: 'bg-primary/20 text-primary',
  Entregar: 'bg-success/20 text-success',
};

const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

export function DashboardLogistica() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <motion.div key={kpi.label} variants={item}>
            <GlassCard hover glow>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <p className={`text-3xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders */}
        <motion.div variants={item}>
          <GlassCard>
            <h3 className="text-lg font-semibold mb-4">Pedidos para Hoje</h3>
            <div className="space-y-3">
              {orders.map((o) => (
                <div key={o.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-muted-foreground">{o.id}</span>
                    <span className="text-sm font-medium">{o.client}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{o.items} itens</span>
                    <Badge className={`${statusColor[o.status]} border-0 text-xs`}>{o.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Stock Alerts */}
        <motion.div variants={item}>
          <GlassCard>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" /> Estoque Crítico
            </h3>
            <div className="space-y-3">
              {stockAlerts.map((s) => (
                <div key={s.product} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <span className="text-sm font-medium">{s.product}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-destructive">{s.stock}</span>
                    <span className="text-xs text-muted-foreground">/ {s.min} mín</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Carriers */}
      <motion.div variants={item}>
        <GlassCard>
          <h3 className="text-lg font-semibold mb-4">Transportadoras</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {carriers.map((c) => (
              <div key={c.name} className="p-4 rounded-xl bg-white/5 text-center">
                <Truck className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">{c.name}</p>
                <p className="text-2xl font-bold text-accent mt-1">{c.active}</p>
                <p className="text-xs text-muted-foreground">envios ativos</p>
                <p className="text-xs text-success mt-1">{c.onTime} no prazo</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
