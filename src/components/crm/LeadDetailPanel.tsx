import { useState } from 'react';
import { X, Phone, Mail, MessageCircle, FileText, DollarSign, Send, Calendar, Building2, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useContactHistory, useAddContactNote } from '@/hooks/useLeads';
import type { Lead } from '@/types/crm';
import { KANBAN_COLUMNS } from '@/types/crm';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
  lead: Lead;
  onClose: () => void;
}

export function LeadDetailPanel({ lead, onClose }: Props) {
  const { data: history = [] } = useContactHistory(lead.id);
  const addNote = useAddContactNote();
  const [nota, setNota] = useState('');
  const [tipoNota, setTipoNota] = useState('nota');

  const valor = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.valor_estimado || 0);
  const col = KANBAN_COLUMNS.find((c) => c.id === lead.status);

  const handleAddNote = () => {
    if (!nota.trim()) return;
    addNote.mutate({ lead_id: lead.id, tipo: tipoNota, descricao: nota });
    setNota('');
  };

  const openWhatsApp = () => {
    if (lead.telefone) {
      const num = lead.telefone.replace(/\D/g, '');
      window.open(`https://wa.me/55${num}`, '_blank');
    }
  };

  const openEmail = () => {
    if (lead.email) window.open(`mailto:${lead.email}`, '_blank');
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-card/95 backdrop-blur-xl border-l border-border/50 z-50 shadow-2xl flex flex-col animate-in slide-in-from-right-full duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
        <div>
          <h2 className="text-lg font-bold text-foreground">{lead.nome_cliente}</h2>
          {lead.empresa && <p className="text-sm text-muted-foreground">{lead.empresa}</p>}
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Status & Value */}
          <div className="flex items-center justify-between">
            <Badge style={{ backgroundColor: col?.color, color: '#fff' }}>{col?.label}</Badge>
            <span className="text-xl font-bold text-accent">{valor}</span>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" size="sm" onClick={openWhatsApp} className="border-border/50 gap-1.5">
              <MessageCircle className="h-4 w-4 text-green-400" /> WhatsApp
            </Button>
            <Button variant="outline" size="sm" onClick={openEmail} className="border-border/50 gap-1.5">
              <Mail className="h-4 w-4 text-primary" /> Email
            </Button>
            <Button variant="outline" size="sm" className="border-border/50 gap-1.5">
              <FileText className="h-4 w-4 text-warning" /> Orçamento
            </Button>
          </div>

          <Separator className="bg-border/30" />

          {/* Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Detalhes</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {lead.telefone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 shrink-0" /> {lead.telefone}
                </div>
              )}
              {lead.email && (
                <div className="flex items-center gap-2 text-muted-foreground truncate">
                  <Mail className="h-3.5 w-3.5 shrink-0" /> {lead.email}
                </div>
              )}
              {lead.responsavel && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-3.5 w-3.5 shrink-0" /> {lead.responsavel}
                </div>
              )}
              {lead.prazo && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 shrink-0" /> {format(new Date(lead.prazo), 'dd/MM/yyyy')}
                </div>
              )}
            </div>
            {lead.produto_solicitado && (
              <p className="text-sm text-muted-foreground"><span className="text-foreground font-medium">Produto:</span> {lead.produto_solicitado}</p>
            )}
            {lead.observacoes && (
              <p className="text-sm text-muted-foreground"><span className="text-foreground font-medium">Obs:</span> {lead.observacoes}</p>
            )}
          </div>

          <Separator className="bg-border/30" />

          {/* Add note */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Adicionar Nota</h3>
            <div className="flex gap-2">
              {['nota', 'whatsapp', 'email', 'ligação'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTipoNota(t)}
                  className={`text-xs px-2 py-1 rounded-lg transition-colors capitalize ${
                    tipoNota === t ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-white/5'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Textarea value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Escreva uma nota..." rows={2} className="bg-muted/30 border-border/50 flex-1" />
              <Button size="icon" onClick={handleAddNote} disabled={!nota.trim()} className="self-end rounded-xl">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator className="bg-border/30" />

          {/* History */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Histórico de Contato</h3>
            {history.length === 0 && <p className="text-sm text-muted-foreground">Nenhum registro ainda.</p>}
            {history.map((h) => (
              <div key={h.id} className="bg-muted/20 rounded-xl p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs capitalize border-border/50">{h.tipo}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(h.created_at), "dd/MM HH:mm", { locale: ptBR })}
                  </span>
                </div>
                <p className="text-sm text-foreground">{h.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
