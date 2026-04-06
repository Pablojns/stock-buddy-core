import { useState, useCallback, useRef } from 'react';
import { Plus } from 'lucide-react';
import { KanbanCard } from './KanbanCard';
import type { Lead, LeadStatus } from '@/types/crm';

interface Props {
  id: LeadStatus;
  label: string;
  color: string;
  leads: Lead[];
  onSelect: (lead: Lead) => void;
  onDragStart: (e: React.DragEvent, lead: Lead) => void;
  onDrop: (status: LeadStatus, position: number) => void;
  onAddClick: (status: LeadStatus) => void;
}

export function KanbanColumn({ id, label, color, leads, onSelect, onDragStart, onDrop, onAddClick }: Props) {
  const [isOver, setIsOver] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only leave if we actually left the column
    if (dropRef.current && !dropRef.current.contains(e.relatedTarget as Node)) {
      setIsOver(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOver(false);

    // Calculate drop position based on cursor Y
    const cards = dropRef.current?.querySelectorAll('[data-kanban-card]');
    let position = leads.length;
    if (cards) {
      for (let i = 0; i < cards.length; i++) {
        const rect = cards[i].getBoundingClientRect();
        if (e.clientY < rect.top + rect.height / 2) {
          position = i;
          break;
        }
      }
    }
    onDrop(id, position);
  }, [id, leads.length, onDrop]);

  const total = leads.reduce((s, l) => s + (l.valor_estimado || 0), 0);
  const totalFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total);

  return (
    <div
      ref={dropRef}
      className={`flex flex-col w-[260px] shrink-0 rounded-xl border transition-colors ${
        isOver ? 'border-primary/50 bg-primary/5' : 'border-border/30 bg-card/30'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/20">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
          <h3 className="text-xs font-semibold text-foreground truncate">{label}</h3>
          <span className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded shrink-0">{leads.length}</span>
        </div>
        <button
          onClick={() => onAddClick(id)}
          className="p-0.5 rounded hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Total */}
      <div className="px-3 py-1.5 text-[10px] text-muted-foreground border-b border-border/10">
        Total: <span className="font-semibold text-accent">{totalFormatted}</span>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 pt-1 space-y-1.5 max-h-[calc(100vh-14rem)]">
        {leads.map((lead) => (
          <KanbanCard key={lead.id} lead={lead} onSelect={onSelect} onDragStart={onDragStart} />
        ))}
      </div>
    </div>
  );
}
