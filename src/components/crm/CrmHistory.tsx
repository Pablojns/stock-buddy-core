import { useMemo, useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { KANBAN_COLUMNS, type Lead } from '@/types/crm';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

interface Props {
  leads: Lead[];
  onSelect: (lead: Lead) => void;
}

export function CrmHistory({ leads, onSelect }: Props) {
  const sorted = useMemo(() =>
    [...leads].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
  , [leads]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-foreground">Histórico</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Todos os leads ordenados por última atualização</p>
      </div>

      <GlassCard className="!p-0 overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_100px_100px_80px_100px] gap-2 px-4 py-2 border-b border-border/20 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          <span>Lead</span>
          <span>Status</span>
          <span>Valor</span>
          <span>Resp.</span>
          <span>Atualização</span>
        </div>
        <ScrollArea className="max-h-[calc(100vh-16rem)]">
          {sorted.map(lead => {
            const col = KANBAN_COLUMNS.find(c => c.id === lead.status);
            return (
              <button
                key={lead.id}
                onClick={() => onSelect(lead)}
                className="grid grid-cols-[1fr_100px_100px_80px_100px] gap-2 px-4 py-2.5 w-full text-left hover:bg-white/[0.03] transition-colors border-b border-border/10 last:border-0"
              >
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{lead.nome_cliente}</p>
                  <p className="text-[9px] text-muted-foreground truncate">{lead.empresa || '—'}</p>
                </div>
                <div>
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0" style={{ borderColor: col?.color, color: col?.color }}>
                    {col?.label}
                  </Badge>
                </div>
                <span className="text-xs font-semibold text-accent">{fmt(lead.valor_estimado || 0)}</span>
                <span className="text-[10px] text-muted-foreground truncate">{lead.responsavel || '—'}</span>
                <span className="text-[10px] text-muted-foreground">
                  {format(new Date(lead.updated_at), 'dd/MM HH:mm', { locale: ptBR })}
                </span>
              </button>
            );
          })}
          {sorted.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-8">Nenhum lead no histórico</p>
          )}
        </ScrollArea>
      </GlassCard>
    </div>
  );
}
