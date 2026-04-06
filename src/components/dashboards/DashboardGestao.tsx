import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import {
  DollarSign, TrendingUp, Clock, AlertTriangle, Truck, ShoppingCart,
  Users, CreditCard, ArrowUpRight, ArrowDownRight, Loader2,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, ComposedChart, Line,
} from 'recharts';
import { useDashboardGestao } from '@/hooks/useDashboardGestao';

const fmt = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtK = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v);

const PIE_COLORS = [
  'hsl(199, 89%, 48%)', 'hsl(221, 83%, 53%)', 'hsl(160, 60%, 45%)',
  'hsl(38, 92%, 50%)', 'hsl(280, 65%, 60%)', 'hsl(0, 84%, 60%)',
];

const tooltipStyle = {
  background: 'rgba(15,23,42,0.95)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  color: '#f8fafc',
  fontSize: '12px',
};

const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

export function DashboardGestao() {
  const d = useDashboardGestao();

  if (d.loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const kpis = [
    { label: 'Faturamento Mês', value: `R$ ${fmt(d.faturamentoMes)}`, icon: DollarSign, color: 'text-accent', up: true },
    { label: 'Lucro Líquido', value: `R$ ${fmt(d.lucroLiquido)}`, icon: TrendingUp, color: 'text-success', up: d.lucroLiquido > 0 },
    { label: 'Pedidos em Aberto', value: String(d.pedidosAbertos), icon: Clock, color: 'text-warning', up: false },
    { label: 'Pedidos Atrasados', value: String(d.pedidosAtrasados), icon: AlertTriangle, color: 'text-destructive', up: false },
    { label: 'Estoque Crítico', value: String(d.estoqueCritico), icon: AlertTriangle, color: 'text-destructive', up: false },
    { label: 'Pedidos Entregues', value: String(d.pedidosEntregues), icon: Truck, color: 'text-success', up: true },
    { label: 'Comissão Comercial', value: `R$ ${fmt(d.comissaoComercial)}`, icon: Users, color: 'text-primary', up: true },
    { label: 'Compras do Mês', value: `R$ ${fmt(d.comprasMes)}`, icon: CreditCard, color: 'text-accent', up: false },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <motion.div key={kpi.label} variants={item}>
            <GlassCard hover glow className="relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                  <p className={`text-2xl font-bold mt-1.5 ${kpi.color} truncate`}>{kpi.value}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 shrink-0 ml-3">
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1">
                {kpi.up
                  ? <ArrowUpRight className="w-3.5 h-3.5 text-success" />
                  : <ArrowDownRight className="w-3.5 h-3.5 text-destructive" />}
                <span className={`text-xs ${kpi.up ? 'text-success' : 'text-destructive'}`}>este mês</span>
              </div>
              <div className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 blur-2xl" />
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Vendas por mês */}
        <motion.div variants={item}>
          <GlassCard className="p-0">
            <div className="px-6 pt-6 pb-2">
              <h3 className="text-base font-semibold">Vendas & Lucro por Mês</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Últimos 6 meses</p>
            </div>
            <div className="px-4 pb-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={d.vendasPorMes}>
                  <defs>
                    <linearGradient id="gradReceita" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={11} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickFormatter={fmtK} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `R$ ${fmt(v)}`} />
                  <Area type="monotone" dataKey="receita" stroke="hsl(199, 89%, 48%)" fill="url(#gradReceita)" strokeWidth={2} name="Receita" />
                  <Line type="monotone" dataKey="lucro" stroke="hsl(160, 60%, 45%)" strokeWidth={2} dot={false} name="Lucro" />
                  <Bar dataKey="custo" fill="hsl(221, 83%, 53%)" opacity={0.4} radius={[4, 4, 0, 0]} name="Custo" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        {/* Produtos mais vendidos */}
        <motion.div variants={item}>
          <GlassCard className="p-0">
            <div className="px-6 pt-6 pb-2">
              <h3 className="text-base font-semibold">Produtos Mais Vendidos</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Por receita total</p>
            </div>
            <div className="px-4 pb-4 h-72">
              {d.produtosMaisVendidos.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={d.produtosMaisVendidos}
                      cx="50%" cy="50%"
                      innerRadius={60} outerRadius={95}
                      dataKey="receita"
                      nameKey="name"
                      paddingAngle={3}
                      stroke="none"
                    >
                      {d.produtosMaisVendidos.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `R$ ${fmt(v)}`} />
                    <Legend
                      wrapperStyle={{ fontSize: '11px', color: 'hsl(215,20%,65%)' }}
                      iconType="circle"
                      iconSize={8}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  Nenhum dado de vendas ainda
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Performance comercial */}
        <motion.div variants={item}>
          <GlassCard className="p-0">
            <div className="px-6 pt-6 pb-2">
              <h3 className="text-base font-semibold">Performance Comercial</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Leads vs Pedidos Fechados</p>
            </div>
            <div className="px-4 pb-4 h-72">
              {d.performanceComercial.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={d.performanceComercial} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" stroke="rgba(255,255,255,0.3)" fontSize={11} />
                    <YAxis type="category" dataKey="responsavel" stroke="rgba(255,255,255,0.3)" fontSize={11} width={100} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="leads" fill="hsl(199, 89%, 48%)" radius={[0, 4, 4, 0]} name="Leads" />
                    <Bar dataKey="fechados" fill="hsl(160, 60%, 45%)" radius={[0, 4, 4, 0]} name="Fechados" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  Nenhum lead cadastrado
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Giro de estoque */}
        <motion.div variants={item}>
          <GlassCard className="p-0">
            <div className="px-6 pt-6 pb-2">
              <h3 className="text-base font-semibold">Giro de Estoque</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Entradas vs Saídas por produto</p>
            </div>
            <div className="px-4 pb-4 h-72">
              {d.giroEstoque.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={d.giroEstoque}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="entradas" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} name="Entradas" />
                    <Bar dataKey="saidas" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} name="Saídas" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  Nenhuma movimentação registrada
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
}
