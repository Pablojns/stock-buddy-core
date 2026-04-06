import { useState, useCallback, useMemo, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CrmLayout } from '@/components/crm/CrmLayout';
import { CrmDashboard } from '@/components/crm/CrmDashboard';
import { CrmFunnel } from '@/components/crm/CrmFunnel';
import { CrmClients } from '@/components/crm/CrmClients';
import { CrmFollowUp } from '@/components/crm/CrmFollowUp';
import { CrmHistory } from '@/components/crm/CrmHistory';
import { CrmIndicators } from '@/components/crm/CrmIndicators';
import { CrmPlaceholder } from '@/components/crm/CrmPlaceholder';
import { KanbanColumn } from '@/components/crm/KanbanColumn';
import { KanbanDndProvider, useKanbanDnd } from '@/components/crm/KanbanDndContext';
import { LeadFormDialog } from '@/components/crm/LeadFormDialog';
import { LeadDetailPanel } from '@/components/crm/LeadDetailPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLeads } from '@/hooks/useLeads';
import { KANBAN_COLUMNS, type Lead, type LeadStatus } from '@/types/crm';
import { Loader2 } from 'lucide-react';

function KanbanBoard({
  leads, search, setSearch, onSelect, onAddClick, moveLeadStatus,
}: {
  leads: Lead[];
  search: string;
  setSearch: (v: string) => void;
  onSelect: (lead: Lead) => void;
  onAddClick: (status: LeadStatus) => void;
  moveLeadStatus: any;
}) {
  const { setOnDrop } = useKanbanDnd();

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
    const map: Record<LeadStatus, Lead[]> = {} as any;
    KANBAN_COLUMNS.forEach(col => { map[col.id] = []; });
    filtered.forEach((l) => map[l.status]?.push(l));
    return map;
  }, [filtered]);

  const handleDrop = useCallback(
    (status: LeadStatus, position: number) => {
      const { dragState } = (window as any).__kanbanDragRef || {};
      // This is handled via the context
    },
    []
  );

  // Register drop handler
  useEffect(() => {
    setOnDrop((status: LeadStatus, position: number) => {
      // The drag state lead is accessed via the KanbanDndContext internally
      // We need the lead from the drag state
    });
  }, [setOnDrop]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Buscar leads..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 w-44 text-xs bg-muted/30 border-border/50" />
        </div>
        <Button onClick={() => onAddClick('novo_lead')} size="sm" className="gap-1.5 h-8 text-xs">
          <Plus className="h-3.5 w-3.5" /> Novo Lead
        </Button>
      </div>
      <div className="overflow-x-auto -mx-4 lg:-mx-5 px-4 lg:px-5 pb-2">
        <div className="flex gap-2.5 min-w-max">
          {KANBAN_COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              {...col}
              leads={leadsByStatus[col.id] || []}
              onSelect={onSelect}
              onAddClick={onAddClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Comercial() {
  const { leads, isLoading, createLead, moveLeadStatus } = useLeads();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formStatus, setFormStatus] = useState<LeadStatus>('novo_lead');

  const handleAddClick = useCallback((status: LeadStatus) => {
    setFormStatus(status);
    setFormOpen(true);
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <CrmDashboard leads={leads} />;
      case 'leads':
        return (
          <KanbanDndProviderWithDrop leads={leads} search={search} setSearch={setSearch}
            onSelect={setSelectedLead} onAddClick={handleAddClick} moveLeadStatus={moveLeadStatus} />
        );
      case 'funil':
        return <CrmFunnel leads={leads} onSelect={setSelectedLead} />;
      case 'clientes':
        return <CrmClients />;
      case 'followup':
        return <CrmFollowUp leads={leads} onSelect={setSelectedLead} />;
      case 'historico':
        return <CrmHistory leads={leads} onSelect={setSelectedLead} />;
      case 'indicadores':
        return <CrmIndicators leads={leads} />;
      case 'propostas':
        return <CrmPlaceholder view="propostas" />;
      case 'agenda':
        return <CrmPlaceholder view="agenda" />;
      case 'metas':
        return <CrmPlaceholder view="metas" />;
      default:
        return <CrmDashboard leads={leads} />;
    }
  };

  return (
    <DashboardLayout>
      <CrmLayout activeTab={activeTab} onTabChange={setActiveTab}>
        {renderContent()}
      </CrmLayout>

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

// Wrapper that integrates DnD provider with drop handling
function KanbanDndProviderWithDrop({ leads, search, setSearch, onSelect, onAddClick, moveLeadStatus }: {
  leads: Lead[]; search: string; setSearch: (v: string) => void;
  onSelect: (lead: Lead) => void; onAddClick: (status: LeadStatus) => void; moveLeadStatus: any;
}) {
  return (
    <KanbanDndProvider>
      <KanbanBoardWithDrop leads={leads} search={search} setSearch={setSearch}
        onSelect={onSelect} onAddClick={onAddClick} moveLeadStatus={moveLeadStatus} />
    </KanbanDndProvider>
  );
}

function KanbanBoardWithDrop({ leads, search, setSearch, onSelect, onAddClick, moveLeadStatus }: {
  leads: Lead[]; search: string; setSearch: (v: string) => void;
  onSelect: (lead: Lead) => void; onAddClick: (status: LeadStatus) => void; moveLeadStatus: any;
}) {
  const { setOnDrop, dragState } = useKanbanDnd();

  useEffect(() => {
    setOnDrop((status: LeadStatus, position: number) => {
      if (dragState.lead && dragState.lead.status !== status) {
        moveLeadStatus.mutate({ id: dragState.lead.id, status, posicao: position });
      }
    });
  }, [setOnDrop, dragState.lead, moveLeadStatus]);

  return (
    <KanbanBoard leads={leads} search={search} setSearch={setSearch}
      onSelect={onSelect} onAddClick={onAddClick} moveLeadStatus={moveLeadStatus} />
  );
}
