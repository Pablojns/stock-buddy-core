import {
  createContext, useContext, useState, useCallback, useRef,
  useEffect, ReactNode,
} from 'react';
import type { Lead, LeadStatus } from '@/types/crm';

interface DragState {
  lead: Lead | null;
  offsetX: number;
  offsetY: number;
  mouseX: number;
  mouseY: number;
  isDragging: boolean;
}

interface KanbanDndContextType {
  dragState: DragState;
  startDrag: (lead: Lead, e: React.PointerEvent) => void;
  endDrag: () => void;
  onDropZone: ((status: LeadStatus, position: number) => void) | null;
  setOnDrop: (fn: (status: LeadStatus, position: number) => void) => void;
}

const KanbanDndContext = createContext<KanbanDndContextType | null>(null);

export function useKanbanDnd() {
  const ctx = useContext(KanbanDndContext);
  if (!ctx) throw new Error('useKanbanDnd must be used within KanbanDndProvider');
  return ctx;
}

export function KanbanDndProvider({ children }: { children: ReactNode }) {
  const [dragState, setDragState] = useState<DragState>({
    lead: null, offsetX: 0, offsetY: 0, mouseX: 0, mouseY: 0, isDragging: false,
  });
  const onDropRef = useRef<((status: LeadStatus, position: number) => void) | null>(null);

  const startDrag = useCallback((lead: Lead, e: React.PointerEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragState({
      lead,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      mouseX: e.clientX,
      mouseY: e.clientY,
      isDragging: true,
    });
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';
  }, []);

  const endDrag = useCallback(() => {
    setDragState(prev => ({ ...prev, lead: null, isDragging: false }));
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }, []);

  useEffect(() => {
    if (!dragState.isDragging) return;

    const onMove = (e: PointerEvent) => {
      setDragState(prev => ({ ...prev, mouseX: e.clientX, mouseY: e.clientY }));
    };

    const onUp = () => {
      // Find the drop target column
      const el = document.elementFromPoint(dragState.mouseX, dragState.mouseY);
      const colEl = el?.closest('[data-kanban-col]');
      if (colEl && dragState.lead) {
        const status = colEl.getAttribute('data-kanban-col') as LeadStatus;
        // Calculate position based on Y
        const cards = colEl.querySelectorAll('[data-kanban-card]');
        let position = cards.length;
        for (let i = 0; i < cards.length; i++) {
          const rect = cards[i].getBoundingClientRect();
          if (dragState.mouseY < rect.top + rect.height / 2) {
            position = i;
            break;
          }
        }
        onDropRef.current?.(status, position);
      }
      endDrag();
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [dragState.isDragging, dragState.mouseX, dragState.mouseY, dragState.lead, endDrag]);

  const setOnDrop = useCallback((fn: (status: LeadStatus, position: number) => void) => {
    onDropRef.current = fn;
  }, []);

  return (
    <KanbanDndContext.Provider value={{ dragState, startDrag, endDrag, onDropZone: onDropRef.current, setOnDrop }}>
      {children}
      {/* Floating ghost card */}
      {dragState.isDragging && dragState.lead && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: dragState.mouseX - dragState.offsetX,
            top: dragState.mouseY - dragState.offsetY,
            width: 240,
          }}
        >
          <div className="bg-card border border-primary/40 rounded-xl p-3 shadow-2xl shadow-primary/20 opacity-90 scale-[1.02]">
            <p className="text-xs font-semibold text-foreground truncate">{dragState.lead.nome_cliente}</p>
            <p className="text-[10px] text-muted-foreground truncate">{dragState.lead.empresa || '—'}</p>
            <p className="text-xs font-bold text-accent mt-1">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dragState.lead.valor_estimado || 0)}
            </p>
          </div>
        </div>
      )}
    </KanbanDndContext.Provider>
  );
}
