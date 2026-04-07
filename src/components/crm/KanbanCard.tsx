import { memo, useRef } from 'react';
import { Building2, Phone, Mail, User, MapPin, Calendar, Clock } from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { Badge } from '@/components/ui/badge';
import type { Lead } from '@/types/crm';
import { PRIORITY_CONFIG } from '@/types/crm';
import { useKanbanDnd } from './KanbanDndContext';
import { getWhatsAppUrl } from '@/lib/utils';
import { format } from 'date-fns';

interface Props {
  lead: Lead;
  onSelect: (lead: Lead) => void;
}

function KanbanCardBase({ lead, onSelect }: Props) {
  const { startDrag } = useKanbanDnd();
  const valor = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.valor_estimado || 0);
  const prio = PRIORITY_CONFIG[lead.prioridade] || PRIORITY_CONFIG.normal;
  const whatsappUrl = getWhatsAppUrl(lead.telefone);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    startDrag(lead, e);
  };

  return (
    <div
      data-kanban-card
      onPointerDown={handlePointerDown}
      onClick={(e) => { e.stopPropagation(); onSelect(lead); }}
      className="group relative bg-card/80 border border-border/40 rounded-xl p-3 cursor-grab
                 hover:border-primary/30 transition-all duration-150 select-none touch-none"
    >
      <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full" style={{ backgroundColor: prio.color }} />

      <div className="pl-2.5">
        <div className="flex items-start justify-between gap-1">
          <h4 className="text-xs font-semibold text-foreground truncate">{lead.nome_cliente}</h4>
          <Badge variant="outline" className={`text-[8px] px-1 py-0 shrink-0 border ${prio.bg}`}>
            {prio.label}
          </Badge>
        </div>

        {(lead.empresa || lead.cidade) && (
          <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
            {lead.empresa && (
              <span className="flex items-center gap-0.5 truncate">
                <Building2 className="h-2.5 w-2.5 shrink-0" /> {lead.empresa}
              </span>
            )}
            {lead.cidade && (
              <span className="flex items-center gap-0.5 truncate">
                <MapPin className="h-2.5 w-2.5 shrink-0" /> {lead.cidade}
              </span>
            )}
          </div>
        )}

        {lead.produto_solicitado && (
          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{lead.produto_solicitado}</p>
        )}

        <p className="text-sm font-bold text-accent mt-1.5">{valor}</p>

        <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-border/20">
          <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
            {lead.responsavel && (
              <span className="flex items-center gap-0.5 truncate max-w-[60px]">
                <User className="h-2.5 w-2.5 shrink-0" /> {lead.responsavel}
              </span>
            )}
            {lead.prazo && (
              <span className="flex items-center gap-0.5">
                <Calendar className="h-2.5 w-2.5 shrink-0" />
                {format(new Date(lead.prazo), 'dd/MM')}
              </span>
            )}
          </div>
          <div className="flex gap-1">
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                onPointerDown={e => e.stopPropagation()}
                className="hover:text-emerald-400 transition-colors"
              >
                <WhatsAppIcon className="h-2.5 w-2.5 text-emerald-400" />
              </a>
            )}
            {lead.email && <Mail className="h-2.5 w-2.5 text-muted-foreground" />}
          </div>
        </div>

        <div className="flex items-center gap-1 mt-1 text-[8px] text-muted-foreground/60">
          <Clock className="h-2 w-2" />
          Atualizado {format(new Date(lead.updated_at), 'dd/MM HH:mm')}
        </div>
      </div>
    </div>
  );
}

export const KanbanCard = memo(KanbanCardBase);
