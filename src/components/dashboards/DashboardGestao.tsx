import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { TrendingUp, DollarSign, Package, Users, AlertTriangle, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const kpis = [
  { label: 'Receita Mês', value: 'R$ 245.320', change: '+12.5%', icon: DollarSign, color: 'text-accent' },
  { label: 'Pedidos Pendentes', value: '47', change: '-3', icon: Clock, color: 'text-warning' },
  { label: 'Estoque Crítico', value: '8', change: '+2', icon: AlertTriangle, color: 'text-destructive' },
  { label: 'Lucro Líquido', value: 'R$ 78.450', change: '+8.2%', icon: TrendingUp, color: 'text-success' },
];

const revenueData = [
  { month: 'Jan', receita: 185000, custo: 120000 },
  { month: 'Fev', receita: 195000, custo: 125000 },
  { month: 'Mar', receita: 210000, custo: 130000 },
  { month: 'Abr', receita: 225000, custo: 135000 },
  { month: 'Mai', receita: 215000, custo: 128000 },
  { month: 'Jun', receita: 240000, custo: 140000 },
  { month: 'Jul', receita: 235000, custo: 138000 },
  { month: 'Ago', receita: 250000, custo: 142000 },
  { month: 'Set', receita: 230000, custo: 136000 },
  { month: 'Out', receita: 245000, custo: 145000 },
  { month: 'Nov', receita: 260000, custo: 148000 },
  { month: 'Dez', receita: 245320, custo: 150000 },
];

const departmentData = [
  { dept: 'Comercial', valor: 95000 },
  { dept: 'Marketing', valor: 45000 },
  { dept: 'Logística', valor: 62000 },
  { dept: 'Operações', valor: 43320 },
];

const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

export function DashboardGestao() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <motion.div key={kpi.label} variants={item}>
            <GlassCard hover glow className="relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <p className={`text-3xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
                  <p className="text-xs text-success mt-2">{kpi.change}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 blur-2xl" />
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <motion.div variants={item}>
        <GlassCard className="p-0">
          <Tabs defaultValue="geral" className="w-full">
            <div className="px-6 pt-6 pb-2 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Visão Geral</h2>
              <TabsList className="bg-white/5 border border-white/10 rounded-xl">
                <TabsTrigger value="geral" className="data-[state=active]:bg-primary/20 rounded-lg text-xs">Geral</TabsTrigger>
                <TabsTrigger value="financeiro" className="data-[state=active]:bg-primary/20 rounded-lg text-xs">Financeiro</TabsTrigger>
                <TabsTrigger value="logistica" className="data-[state=active]:bg-primary/20 rounded-lg text-xs">Logística</TabsTrigger>
                <TabsTrigger value="comercial" className="data-[state=active]:bg-primary/20 rounded-lg text-xs">Comercial</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="geral" className="px-6 pb-6">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="gradReceita" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickFormatter={(v) => `${v/1000}k`} />
                    <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f8fafc' }} />
                    <Area type="monotone" dataKey="receita" stroke="hsl(199, 89%, 48%)" fill="url(#gradReceita)" strokeWidth={2} />
                    <Area type="monotone" dataKey="custo" stroke="hsl(221, 83%, 53%)" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            <TabsContent value="financeiro" className="px-6 pb-6">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="dept" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickFormatter={(v) => `${v/1000}k`} />
                    <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f8fafc' }} />
                    <Bar dataKey="valor" fill="hsl(221, 83%, 53%)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            <TabsContent value="logistica" className="px-6 pb-6">
              <div className="h-72 flex items-center justify-center text-muted-foreground">Dados de logística em breve</div>
            </TabsContent>
            <TabsContent value="comercial" className="px-6 pb-6">
              <div className="h-72 flex items-center justify-center text-muted-foreground">Dados comerciais em breve</div>
            </TabsContent>
          </Tabs>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
