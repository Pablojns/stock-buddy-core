import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import {
  DollarSign, Users, TrendingUp, Target, Clock, CheckCircle,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import type { Lead } from '@/types/crm';
import { KANBAN_COLUMNS } from '@/types/crm';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const tooltipStyle = {
  background: 'rgba(15,23,42,0.95)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px',
  color: '#f8fafc',
  fontSize: '11px',
};
const COLORS = ['hsl(221,83%,53%)', 'hsl(199,89%,48%)', 'hsl(38,92%,50%)', 'hsl(160,60%,45%)', 'hsl(280,65%,60%)', 'hsl(0,84%,60%)'];
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

interface Props {
  leads: Lead[];
}

export function CrmDashboard({ leads }: Props) {
  const stats = useMemo(() => {
    const pipeline = leads.filter(l => !['perdido', 'pedido_fechado'].includes(l.status));
    const fechados = leads.filter(l => l.status === 'pedido_fechado');
    const perdidos = leads.filter(l => l.status === 'perdido');
    const pipelineVal = pipeline.reduce((s, l) => s + (l.valor_estimado || 0), 0);
    const fechadoVal = fechados.reduce((s, l) => s + (l.valor_estimado || 0), 0);
    const conversionRate = leads.length > 0 ? (fechados.length / leads.length) * 100 : 0;
    const avgTicket = fechados.length > 0 ? fechadoVal / fechados.length : 0;
    return { pipeline, fechados, perdidos, pipelineVal, fechadoVal, conversionRate, avgTicket, total: leads.length };
  }, [leads]);

  const funnelData = useMemo(() => {
    return KANBAN_COLUMNS.map(col => ({
      name: col.label,
      value: leads.filter(l => l.status === col.id).length,
      amount: leads.filter(l => l.status === col.id).reduce((s, l) => s + (l.valor_estimado || 0), 0),
    }));
  }, [leads]);

  const responsavelData = useMemo(() => {
    const map = new Map<string, { leads: number; valor: number }>();
    leads.forEach(l => {
      const r = l.responsavel || 'Sem responsável';
      const prev = map.get(r) || { leads: 0, valor: 0 };
      map.set(r, { leads: prev.leads + 1, valor: prev.valor + (l.valor_estimado || 0) });
    });
    return Array.from(map.entries())
      .map(([name, v]) => ({ name: name.length > 10 ? name.slice(0, 10) + '…' : name, ...v }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 6);
  }, [leads]);

  const kpis = [
    { label: 'Total de Leads', value: String(stats.total), icon: Users, color: 'text-primary', up: true },
    { label: 'Pipeline', value: fmt(stats.pipelineVal), icon: Target, color: 'text-accent', up: true },
    { label: 'Fechados', value: fmt(stats.fechadoVal), icon: CheckCircle, color: 'text-success', up: true },
    { label: 'Taxa Conversão', value: `${stats.conversionRate.toFixed(1)}%`, icon: TrendingUp, color: 'text-primary', up: stats.conversionRate > 20 },
    { label: 'Ticket Médio', value: fmt(stats.avgTicket), icon: DollarSign, color: 'text-accent', up: true },
    { label: 'Perdidos', value: String(stats.perdidos.length), icon: Clock, color: 'text-destructive', up: false },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map(kpi => (
          <motion.div key={kpi.label} variants={item}>
            <GlassCard hover className="!p-3.5">
              <div className="flex items-center justify-between mb-1">
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                {kpi.up
                  ? <ArrowUpRight className="w-3 h-3 text-success" />
                  : <ArrowDownRight className="w-3 h-3 text-destructive" />
                }
              </div>
              <p className={`text-lg font-bold ${kpi.color} truncate`}>{kpi.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.label}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Funnel */}
        <motion.div variants={item}>
          <GlassCard className="!p-0">
            <div className="px-4 pt-4 pb-2">
              <h3 className="text-sm font-semibold">Funil de Vendas</h3>
              <p className="text-[10px] text-muted-foreground">Leads por etapa</p>
            </div>
            <div className="px-3 pb-3 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" stroke="rgba(255,255,255,0.3)" fontSize={10} />
                  <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={9} width={90} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Leads">
                    {funnelData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        {/* Performance by Responsável */}
        <motion.div variants={item}>
          <GlassCard className="!p-0">
            <div className="px-4 pt-4 pb-2">
              <h3 className="text-sm font-semibold">Performance Comercial</h3>
              <p className="text-[10px] text-muted-foreground">Por responsável</p>
            </div>
            <div className="px-3 pb-3 h-56">
              {responsavelData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={responsavelData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={9} />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="leads" fill="hsl(199,89%,48%)" radius={[4, 4, 0, 0]} name="Leads" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-muted-foreground">Sem dados</div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Recent Leads */}
      <motion.div variants={item}>
        <GlassCard className="!p-0">
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Leads Recentes</h3>
              <p className="text-[10px] text-muted-foreground">Últimas atualizações</p>
            </div>
          </div>
          <div className="px-4 pb-4">
            <div className="space-y-1.5">
              {leads.slice(0, 8).map(lead => {
                const col = KANBAN_COLUMNS.find(c => c.id === lead.status);
                return (
                  <div key={lead.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.03] transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: col?.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{lead.nome_cliente}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{lead.empresa || lead.produto_solicitado || '—'}</p>
                    </div>
                    <span className="text-xs font-semibold text-accent shrink-0">{fmt(lead.valor_estimado || 0)}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">{col?.label}</span>
                  </div>
                );
              })}
              {leads.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-6">Nenhum lead encontrado</p>
              )}
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
