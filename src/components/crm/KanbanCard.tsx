import { memo } from 'react';
import { Building2, Phone, Mail, DollarSign, User, GripVertical } from 'lucide-react';
import type { Lead } from '@/types/crm';

interface Props {
  lead: Lead;
  onSelect: (lead: Lead) => void;
  onDragStart: (e: React.DragEvent, lead: Lead) => void;
}

function KanbanCardBase({ lead, onSelect, onDragStart }: Props) {
  const valor = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.valor_estimado || 0);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead)}
      onClick={() => onSelect(lead)}
      className="group relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-4 cursor-pointer
                 hover:border-primary/40 hover:shadow-[0_0_20px_-5px_hsl(var(--primary)/0.2)] transition-all duration-200
                 active:scale-[0.98] select-none"
    >
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-60 transition-opacity">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      <h4 className="font-semibold text-foreground text-sm truncate pr-6">{lead.nome_cliente}</h4>

      {lead.empresa && (
        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
          <Building2 className="h-3 w-3 shrink-0" /> <span className="truncate">{lead.empresa}</span>
        </div>
      )}

      {lead.produto_solicitado && (
        <p className="text-xs text-muted-foreground mt-1 truncate">{lead.produto_solicitado}</p>
      )}

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/30">
        <span className="text-sm font-bold text-accent">{valor}</span>
        {lead.responsavel && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <User className="h-3 w-3" /> <span className="truncate max-w-[60px]">{lead.responsavel}</span>
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-2">
        {lead.telefone && <Phone className="h-3 w-3 text-muted-foreground" />}
        {lead.email && <Mail className="h-3 w-3 text-muted-foreground" />}
      </div>
    </div>
  );
}

export const KanbanCard = memo(KanbanCardBase);
