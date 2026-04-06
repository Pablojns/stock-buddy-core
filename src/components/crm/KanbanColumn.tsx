import { useState, useCallback } from 'react';
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

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsOver(false), []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    onDrop(id, leads.length);
  }, [id, leads.length, onDrop]);

  const total = leads.reduce((s, l) => s + (l.valor_estimado || 0), 0);
  const totalFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total);

  return (
    <div
      className={`flex flex-col min-w-[280px] max-w-[320px] rounded-2xl border transition-all duration-200 ${
        isOver ? 'border-primary/60 bg-primary/5' : 'border-border/30 bg-card/30'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
          <h3 className="text-sm font-semibold text-foreground">{label}</h3>
          <span className="text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-md">{leads.length}</span>
        </div>
        <button
          onClick={() => onAddClick(id)}
          className="p-1 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Total */}
      <div className="px-4 py-2 text-xs text-muted-foreground">
        Total: <span className="font-semibold text-accent">{totalFormatted}</span>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2 max-h-[calc(100vh-280px)]">
        {leads.map((lead) => (
          <KanbanCard key={lead.id} lead={lead} onSelect={onSelect} onDragStart={onDragStart} />
        ))}
      </div>
    </div>
  );
}
