import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { Users, TrendingUp, Target, Handshake } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const kpis = [
  { label: 'Pipeline Ativo', value: 'R$ 520.000', icon: Target, color: 'text-accent' },
  { label: 'Conversão', value: '34%', icon: TrendingUp, color: 'text-success' },
  { label: 'Novos Leads', value: '23', icon: Users, color: 'text-primary' },
  { label: 'Fechados Mês', value: '12', icon: Handshake, color: 'text-warning' },
];

const pipeline = [
  { stage: 'Prospecção', count: 45, value: 180000, color: 'bg-primary/30' },
  { stage: 'Qualificação', count: 28, value: 140000, color: 'bg-accent/30' },
  { stage: 'Proposta', count: 15, value: 120000, color: 'bg-warning/30' },
  { stage: 'Negociação', count: 8, value: 80000, color: 'bg-success/30' },
];

const topClients = [
  { name: 'Petrobras', value: 'R$ 45.000', status: 'Ativo' },
  { name: 'Vale S.A.', value: 'R$ 38.000', status: 'Ativo' },
  { name: 'Ambev', value: 'R$ 32.000', status: 'Proposta' },
  { name: 'JBS', value: 'R$ 28.000', status: 'Negociação' },
  { name: 'Itaú', value: 'R$ 25.000', status: 'Ativo' },
];

const pipelineChart = [
  { name: 'Sem 1', prospects: 12, fechados: 3 },
  { name: 'Sem 2', prospects: 15, fechados: 5 },
  { name: 'Sem 3', prospects: 10, fechados: 4 },
  { name: 'Sem 4', prospects: 18, fechados: 6 },
];

const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

export function DashboardComercial() {
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
        {/* Pipeline */}
        <motion.div variants={item}>
          <GlassCard>
            <h3 className="text-lg font-semibold mb-4">Pipeline de Vendas</h3>
            <div className="space-y-4">
              {pipeline.map((p) => (
                <div key={p.stage} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{p.stage} <span className="text-muted-foreground">({p.count})</span></span>
                    <span className="text-accent font-medium">R$ {(p.value / 1000).toFixed(0)}k</span>
                  </div>
                  <Progress value={(p.count / 45) * 100} className="h-2 bg-white/5" />
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Top Clients */}
        <motion.div variants={item}>
          <GlassCard>
            <h3 className="text-lg font-semibold mb-4">Top Clientes</h3>
            <div className="space-y-3">
              {topClients.map((c, i) => (
                <div key={c.name} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    <span className="font-medium text-sm">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-accent font-medium">{c.value}</span>
                    <Badge variant="outline" className="border-white/10 text-xs">{c.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Chart */}
      <motion.div variants={item}>
        <GlassCard>
          <h3 className="text-lg font-semibold mb-4">Desempenho Semanal</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
                <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f8fafc' }} />
                <Bar dataKey="prospects" fill="hsl(221, 83%, 53%)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="fechados" fill="hsl(160, 60%, 45%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
