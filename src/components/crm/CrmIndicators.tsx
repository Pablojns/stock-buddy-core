import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { TrendingUp, Users, Target, DollarSign, Percent } from 'lucide-react';
import { KANBAN_COLUMNS, type Lead } from '@/types/crm';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const COLORS = ['hsl(221,83%,53%)', 'hsl(199,89%,48%)', 'hsl(38,92%,50%)', 'hsl(160,60%,45%)', 'hsl(280,65%,60%)', 'hsl(0,84%,60%)'];
const tooltipStyle = {
  background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px', color: '#f8fafc', fontSize: '11px',
};

interface Props { leads: Lead[]; }

export function CrmIndicators({ leads }: Props) {
  const statusData = useMemo(() =>
    KANBAN_COLUMNS.map(col => ({
      name: col.label,
      value: leads.filter(l => l.status === col.id).length,
    })).filter(d => d.value > 0)
  , [leads]);

  const respData = useMemo(() => {
    const map = new Map<string, { total: number; fechados: number; valor: number }>();
    leads.forEach(l => {
      const r = l.responsavel || 'Sem resp.';
      const p = map.get(r) || { total: 0, fechados: 0, valor: 0 };
      map.set(r, {
        total: p.total + 1,
        fechados: p.fechados + (l.status === 'pedido_fechado' ? 1 : 0),
        valor: p.valor + (l.valor_estimado || 0),
      });
    });
    return Array.from(map.entries())
      .map(([name, v]) => ({
        name: name.length > 8 ? name.slice(0, 8) + '…' : name,
        ...v,
        taxa: v.total > 0 ? Math.round((v.fechados / v.total) * 100) : 0,
      }))
      .sort((a, b) => b.valor - a.valor);
  }, [leads]);

  const totalPipeline = leads.filter(l => !['perdido', 'pedido_fechado'].includes(l.status)).reduce((s, l) => s + (l.valor_estimado || 0), 0);
  const totalFechado = leads.filter(l => l.status === 'pedido_fechado').reduce((s, l) => s + (l.valor_estimado || 0), 0);
  const winRate = leads.length > 0 ? ((leads.filter(l => l.status === 'pedido_fechado').length / leads.length) * 100) : 0;
  const lossRate = leads.length > 0 ? ((leads.filter(l => l.status === 'perdido').length / leads.length) * 100) : 0;

  const metrics = [
    { label: 'Pipeline Total', value: fmt(totalPipeline), icon: Target, color: 'text-accent' },
    { label: 'Receita Fechada', value: fmt(totalFechado), icon: DollarSign, color: 'text-success' },
    { label: 'Win Rate', value: `${winRate.toFixed(1)}%`, icon: TrendingUp, color: 'text-primary' },
    { label: 'Loss Rate', value: `${lossRate.toFixed(1)}%`, icon: Percent, color: 'text-destructive' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-bold text-foreground">Indicadores</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Métricas de performance comercial</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {metrics.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <GlassCard className="!p-3.5">
              <m.icon className={`h-4 w-4 ${m.color} mb-1.5`} />
              <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{m.label}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Distribution Pie */}
        <GlassCard className="!p-0">
          <div className="px-4 pt-4 pb-2">
            <h3 className="text-sm font-semibold">Distribuição por Status</h3>
          </div>
          <div className="px-3 pb-3 h-56">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" nameKey="name" paddingAngle={3} stroke="none">
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} iconType="circle" iconSize={6} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-muted-foreground">Sem dados</div>
            )}
          </div>
        </GlassCard>

        {/* Responsável Performance */}
        <GlassCard className="!p-0">
          <div className="px-4 pt-4 pb-2">
            <h3 className="text-sm font-semibold">Performance por Vendedor</h3>
          </div>
          <div className="px-3 pb-3 h-56">
            {respData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={respData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={9} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="total" fill="hsl(199,89%,48%)" radius={[3, 3, 0, 0]} name="Total" />
                  <Bar dataKey="fechados" fill="hsl(160,60%,45%)" radius={[3, 3, 0, 0]} name="Fechados" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-muted-foreground">Sem dados</div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
