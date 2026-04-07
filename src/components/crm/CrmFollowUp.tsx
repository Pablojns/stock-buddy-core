import { useMemo } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, FileText, Clock } from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { KANBAN_COLUMNS, type Lead } from '@/types/crm';
import { useContactHistory } from '@/hooks/useLeads';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const WhatsAppIconWrapper = (props: any) => <WhatsAppIcon className={props.className || 'h-4 w-4'} />;

const tipoIcons: Record<string, any> = {
  nota: FileText,
  whatsapp: WhatsAppIconWrapper,
  email: Mail,
  ligação: Phone,
};

interface Props {
  leads: Lead[];
  onSelect: (lead: Lead) => void;
}

export function CrmFollowUp({ leads, onSelect }: Props) {
  const pending = useMemo(() => {
    return leads
      .filter(l => ['em_contato', 'orcamento_enviado', 'negociacao'].includes(l.status))
      .sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime());
  }, [leads]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-foreground">Follow-up</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{pending.length} leads aguardando contato</p>
      </div>

      {pending.length === 0 ? (
        <GlassCard className="text-center py-12">
          <p className="text-sm text-muted-foreground">Nenhum follow-up pendente</p>
        </GlassCard>
      ) : (
        <div className="space-y-2">
          {pending.map(lead => {
            const col = KANBAN_COLUMNS.find(c => c.id === lead.status);
            const daysSinceUpdate = Math.floor((Date.now() - new Date(lead.updated_at).getTime()) / (1000 * 60 * 60 * 24));
            const urgent = daysSinceUpdate > 3;

            return (
              <GlassCard
                key={lead.id}
                hover
                className="cursor-pointer !p-3"
                onClick={() => onSelect(lead)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 rounded-full shrink-0" style={{ backgroundColor: col?.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-semibold text-foreground truncate">{lead.nome_cliente}</h4>
                      {urgent && <Badge variant="destructive" className="text-[9px] px-1 py-0">Urgente</Badge>}
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">{lead.empresa || lead.produto_solicitado || '—'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-accent">{fmt(lead.valor_estimado || 0)}</p>
                    <div className="flex items-center gap-1 text-[9px] text-muted-foreground mt-0.5">
                      <Clock className="h-2.5 w-2.5" />
                      {daysSinceUpdate === 0 ? 'Hoje' : `${daysSinceUpdate}d atrás`}
                    </div>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
