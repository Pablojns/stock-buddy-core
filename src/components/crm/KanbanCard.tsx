import { memo, useRef } from 'react';
import { Building2, Phone, Mail, User, GripVertical } from 'lucide-react';
import type { Lead } from '@/types/crm';

interface Props {
  lead: Lead;
  onSelect: (lead: Lead) => void;
  onDragStart: (e: React.DragEvent, lead: Lead) => void;
}

function KanbanCardBase({ lead, onSelect, onDragStart }: Props) {
  const valor = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.valor_estimado || 0);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent) => {
    // Set drag image to the card itself for accurate cursor tracking
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      e.dataTransfer.setDragImage(cardRef.current, e.clientX - rect.left, e.clientY - rect.top);
    }
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(e, lead);
  };

  return (
    <div
      ref={cardRef}
      data-kanban-card
      draggable
      onDragStart={handleDragStart}
      onClick={() => onSelect(lead)}
      className="group relative bg-card/80 border border-border/40 rounded-lg p-3 cursor-pointer
                 hover:border-primary/30 transition-all duration-150 active:opacity-70 select-none"
    >
      <div className="absolute top-2.5 right-2 opacity-0 group-hover:opacity-50 transition-opacity cursor-grab active:cursor-grabbing">
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
      </div>

      <h4 className="font-medium text-foreground text-xs truncate pr-5">{lead.nome_cliente}</h4>

      {lead.empresa && (
        <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
          <Building2 className="h-2.5 w-2.5 shrink-0" />
          <span className="truncate">{lead.empresa}</span>
        </div>
      )}

      {lead.produto_solicitado && (
        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{lead.produto_solicitado}</p>
      )}

      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-border/20">
        <span className="text-xs font-bold text-accent">{valor}</span>
        {lead.responsavel && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <User className="h-2.5 w-2.5" />
            <span className="truncate max-w-[50px]">{lead.responsavel}</span>
          </div>
        )}
      </div>

      {(lead.telefone || lead.email) && (
        <div className="flex gap-1.5 mt-1.5">
          {lead.telefone && <Phone className="h-2.5 w-2.5 text-muted-foreground" />}
          {lead.email && <Mail className="h-2.5 w-2.5 text-muted-foreground" />}
        </div>
      )}
    </div>
  );
}

export const KanbanCard = memo(KanbanCardBase);
