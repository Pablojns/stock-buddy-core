import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { KanbanColumn } from '@/components/crm/KanbanColumn';
import { LeadFormDialog } from '@/components/crm/LeadFormDialog';
import { LeadDetailPanel } from '@/components/crm/LeadDetailPanel';
import { useLeads } from '@/hooks/useLeads';
import { KANBAN_COLUMNS, type Lead, type LeadStatus } from '@/types/crm';
import { Loader2 } from 'lucide-react';

export default function Comercial() {
  const { leads, isLoading, createLead, moveLeadStatus } = useLeads();
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formStatus, setFormStatus] = useState<LeadStatus>('novo_lead');
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return leads;
    const q = search.toLowerCase();
    return leads.filter(
      (l) =>
        l.nome_cliente.toLowerCase().includes(q) ||
        l.empresa?.toLowerCase().includes(q) ||
        l.produto_solicitado?.toLowerCase().includes(q) ||
        l.responsavel?.toLowerCase().includes(q)
    );
  }, [leads, search]);

  const leadsByStatus = useMemo(() => {
    const map: Record<LeadStatus, Lead[]> = {
      novo_lead: [], em_contato: [], orcamento_enviado: [], negociacao: [], pedido_fechado: [], perdido: [],
    };
    filtered.forEach((l) => map[l.status]?.push(l));
    return map;
  }, [filtered]);

  const handleDragStart = useCallback((_e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead);
  }, []);

  const handleDrop = useCallback(
    (status: LeadStatus, position: number) => {
      if (!draggedLead || draggedLead.status === status) {
        setDraggedLead(null);
        return;
      }
      moveLeadStatus.mutate({ id: draggedLead.id, status, posicao: position });
      setDraggedLead(null);
    },
    [draggedLead, moveLeadStatus]
  );

  const handleAddClick = useCallback((status: LeadStatus) => {
    setFormStatus(status);
    setFormOpen(true);
  }, []);

  const totalPipeline = leads
    .filter((l) => l.status !== 'perdido' && l.status !== 'pedido_fechado')
    .reduce((s, l) => s + (l.valor_estimado || 0), 0);

  const totalFechado = leads
    .filter((l) => l.status === 'pedido_fechado')
    .reduce((s, l) => s + (l.valor_estimado || 0), 0);

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">CRM Comercial</h1>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
              <span>{leads.length} leads</span>
              <span>Pipeline: <span className="text-accent font-semibold">{fmt(totalPipeline)}</span></span>
              <span>Fechado: <span className="text-success font-semibold">{fmt(totalFechado)}</span></span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 w-44 text-xs bg-muted/30 border-border/50" />
            </div>
            <Button onClick={() => handleAddClick('novo_lead')} size="sm" className="gap-1.5 h-8 text-xs">
              <Plus className="h-3.5 w-3.5" /> Novo Lead
            </Button>
          </div>
        </div>

        {/* Kanban */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 lg:-mx-6 px-4 lg:px-6 pb-2">
            <div className="flex gap-3 min-w-max">
              {KANBAN_COLUMNS.map((col) => (
                <KanbanColumn
                  key={col.id}
                  {...col}
                  leads={leadsByStatus[col.id]}
                  onSelect={setSelectedLead}
                  onDragStart={handleDragStart}
                  onDrop={handleDrop}
                  onAddClick={handleAddClick}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <LeadFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={(data) => createLead.mutate(data)}
        defaultStatus={formStatus}
      />

      {selectedLead && (
        <LeadDetailPanel lead={selectedLead} onClose={() => setSelectedLead(null)} />
      )}
    </DashboardLayout>
  );
}
