import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Users } from 'lucide-react';
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
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">CRM Comercial</h1>
            <p className="text-sm text-muted-foreground">Pipeline de vendas • {leads.length} leads</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">Pipeline: <span className="text-accent font-bold">{fmt(totalPipeline)}</span></span>
              <span className="text-muted-foreground">Fechado: <span className="text-green-400 font-bold">{fmt(totalFechado)}</span></span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar leads..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-56 bg-muted/30 border-border/50" />
            </div>
            <Button onClick={() => handleAddClick('novo_lead')} className="gap-2">
              <Plus className="h-4 w-4" /> Novo Lead
            </Button>
          </div>
        </motion.div>

        {/* Kanban */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max">
              {KANBAN_COLUMNS.map((col, i) => (
                <motion.div key={col.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <KanbanColumn
                    {...col}
                    leads={leadsByStatus[col.id]}
                    onSelect={setSelectedLead}
                    onDragStart={handleDragStart}
                    onDrop={handleDrop}
                    onAddClick={handleAddClick}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lead Form */}
      <LeadFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={(data) => createLead.mutate(data)}
        defaultStatus={formStatus}
      />

      {/* Lead Detail Panel */}
      {selectedLead && (
        <LeadDetailPanel lead={selectedLead} onClose={() => setSelectedLead(null)} />
      )}
    </DashboardLayout>
  );
}
