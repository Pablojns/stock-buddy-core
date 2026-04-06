import { Plus } from 'lucide-react';
import { KanbanCard } from './KanbanCard';
import { useKanbanDnd } from './KanbanDndContext';
import type { Lead, LeadStatus } from '@/types/crm';

interface Props {
  id: LeadStatus;
  label: string;
  color: string;
  leads: Lead[];
  onSelect: (lead: Lead) => void;
  onAddClick: (status: LeadStatus) => void;
}

export function KanbanColumn({ id, label, color, leads, onSelect, onAddClick }: Props) {
  const { dragState } = useKanbanDnd();
  const isOver = dragState.isDragging && dragState.lead?.status !== id;

  const total = leads.reduce((s, l) => s + (l.valor_estimado || 0), 0);
  const totalFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total);

  return (
    <div
      data-kanban-col={id}
      className={`flex flex-col w-[250px] shrink-0 rounded-xl border transition-colors ${
        isOver ? 'border-primary/40 bg-primary/[0.03]' : 'border-border/20 bg-card/20'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/15">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
          <h3 className="text-[11px] font-semibold text-foreground truncate">{label}</h3>
          <span className="text-[9px] text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded shrink-0">{leads.length}</span>
        </div>
        <button
          onClick={() => onAddClick(id)}
          className="p-0.5 rounded hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground shrink-0"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>

      {/* Total */}
      <div className="px-3 py-1 text-[9px] text-muted-foreground border-b border-border/10">
        <span className="font-semibold text-accent">{totalFormatted}</span>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto px-1.5 pb-1.5 pt-1 space-y-1.5 max-h-[calc(100vh-15rem)]">
        {leads.map((lead) => (
          <KanbanCard key={lead.id} lead={lead} onSelect={onSelect} />
        ))}
        {leads.length === 0 && (
          <div className="text-center py-6">
            <p className="text-[9px] text-muted-foreground/40">Sem leads</p>
          </div>
        )}
      </div>
    </div>
  );
}
