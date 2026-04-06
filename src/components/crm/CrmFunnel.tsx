import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { KANBAN_COLUMNS, type Lead } from '@/types/crm';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

interface Props {
  leads: Lead[];
  onSelect: (lead: Lead) => void;
}

export function CrmFunnel({ leads, onSelect }: Props) {
  const stages = useMemo(() => {
    return KANBAN_COLUMNS.map(col => {
      const stageLeads = leads.filter(l => l.status === col.id);
      const total = stageLeads.reduce((s, l) => s + (l.valor_estimado || 0), 0);
      return { ...col, leads: stageLeads, total, count: stageLeads.length };
    });
  }, [leads]);

  const maxCount = Math.max(...stages.map(s => s.count), 1);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-bold text-foreground">Funil de Vendas</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Visualização por etapa do pipeline</p>
      </div>

      {/* Funnel visualization */}
      <div className="space-y-2">
        {stages.map((stage, i) => {
          const widthPct = Math.max(20, (stage.count / maxCount) * 100);
          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-28 shrink-0 text-right">
                  <p className="text-xs font-medium text-foreground">{stage.label}</p>
                  <p className="text-[10px] text-muted-foreground">{stage.count} leads</p>
                </div>
                <div className="flex-1 relative">
                  <div
                    className="h-10 rounded-lg flex items-center px-3 transition-all duration-500"
                    style={{
                      width: `${widthPct}%`,
                      backgroundColor: stage.color,
                      opacity: 0.8,
                    }}
                  >
                    <span className="text-xs font-bold text-white drop-shadow-sm">{fmt(stage.total)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Stage detail cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mt-6">
        {stages.filter(s => s.count > 0).map(stage => (
          <GlassCard key={stage.id} className="!p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
              <h4 className="text-xs font-semibold text-foreground">{stage.label}</h4>
              <span className="text-[10px] text-muted-foreground ml-auto">{stage.count}</span>
            </div>
            <div className="space-y-1">
              {stage.leads.slice(0, 4).map(lead => (
                <button
                  key={lead.id}
                  onClick={() => onSelect(lead)}
                  className="w-full flex items-center justify-between p-1.5 rounded hover:bg-white/5 transition-colors text-left"
                >
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-foreground truncate">{lead.nome_cliente}</p>
                    <p className="text-[9px] text-muted-foreground truncate">{lead.empresa || '—'}</p>
                  </div>
                  <span className="text-[10px] font-bold text-accent shrink-0 ml-2">{fmt(lead.valor_estimado || 0)}</span>
                </button>
              ))}
              {stage.leads.length > 4 && (
                <p className="text-[9px] text-muted-foreground text-center pt-1">+{stage.leads.length - 4} mais</p>
              )}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
