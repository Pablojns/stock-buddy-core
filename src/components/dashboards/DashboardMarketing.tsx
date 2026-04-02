import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { Globe, MousePointerClick, TrendingUp, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Progress } from '@/components/ui/progress';

const kpis = [
  { label: 'Visitas Mês', value: '12.450', icon: Globe, color: 'text-accent' },
  { label: 'Conversões', value: '3.2%', icon: MousePointerClick, color: 'text-success' },
  { label: 'Leads Qualificados', value: '89', icon: Target, color: 'text-primary' },
  { label: 'ROI Campanhas', value: '340%', icon: TrendingUp, color: 'text-warning' },
];

const trafficData = [
  { day: 'Seg', visitas: 1800, conversoes: 54 },
  { day: 'Ter', visitas: 2200, conversoes: 72 },
  { day: 'Qua', visitas: 1900, conversoes: 61 },
  { day: 'Qui', visitas: 2400, conversoes: 85 },
  { day: 'Sex', visitas: 2100, conversoes: 68 },
  { day: 'Sáb', visitas: 1200, conversoes: 35 },
  { day: 'Dom', visitas: 850, conversoes: 22 },
];

const campaigns = [
  { name: 'Google Ads - Brindes', budget: 5000, spent: 3200, leads: 45, status: 'Ativa' },
  { name: 'Meta - Corporativo', budget: 3000, spent: 2800, leads: 32, status: 'Ativa' },
  { name: 'LinkedIn - B2B', budget: 4000, spent: 1500, leads: 12, status: 'Ativa' },
  { name: 'E-mail - Reativação', budget: 500, spent: 500, leads: 28, status: 'Concluída' },
];

const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

export function DashboardMarketing() {
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

      {/* Traffic Chart */}
      <motion.div variants={item}>
        <GlassCard>
          <h3 className="text-lg font-semibold mb-4">Tráfego Semanal</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
                <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f8fafc' }} />
                <Line type="monotone" dataKey="visitas" stroke="hsl(199, 89%, 48%)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="conversoes" stroke="hsl(160, 60%, 45%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </motion.div>

      {/* Campaigns */}
      <motion.div variants={item}>
        <GlassCard>
          <h3 className="text-lg font-semibold mb-4">Campanhas Ativas</h3>
          <div className="space-y-4">
            {campaigns.map((c) => (
              <div key={c.name} className="p-4 rounded-xl bg-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">{c.name}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-success/20 text-success">{c.status}</span>
                </div>
                <Progress value={(c.spent / c.budget) * 100} className="h-1.5 bg-white/5" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>R$ {c.spent.toLocaleString()} / R$ {c.budget.toLocaleString()}</span>
                  <span className="text-accent">{c.leads} leads</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
