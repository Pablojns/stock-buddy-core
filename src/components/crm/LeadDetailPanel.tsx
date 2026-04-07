import { useState } from 'react';
import {
  X, Phone, Mail, FileText, Send, Calendar, Building2,
  User, MapPin, Tag, Target, TrendingUp, Clock, Plus, ChevronDown,
  ChevronUp, Briefcase, Hash, Globe, Activity
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useContactHistory, useAddContactNote } from '@/hooks/useLeads';
import type { Lead } from '@/types/crm';
import { KANBAN_COLUMNS, PRIORITY_CONFIG } from '@/types/crm';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
  lead: Lead;
  onClose: () => void;
}

const WhatsAppIconWrapper = (props: any) => <WhatsAppIcon className={props.className || 'h-4 w-4'} />;

const TIPO_ICONS: Record<string, any> = {
  nota: FileText,
  whatsapp: WhatsAppIconWrapper,
  email: Mail,
  ligação: Phone,
  reunião: Briefcase,
};

const TIPO_COLORS: Record<string, string> = {
  nota: 'bg-muted/40 text-muted-foreground border-border/40',
  whatsapp: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  email: 'bg-primary/15 text-primary border-primary/30',
  ligação: 'bg-accent/15 text-accent border-accent/30',
  reunião: 'bg-warning/15 text-warning border-warning/30',
};

const TIMELINE_STAGES = [
  { status: 'novo_lead', label: 'Lead Criado' },
  { status: 'primeiro_contato', label: 'Primeiro Contato' },
  { status: 'qualificacao', label: 'Qualificação' },
  { status: 'orcamento_enviado', label: 'Orçamento Enviado' },
  { status: 'negociacao', label: 'Negociação' },
  { status: 'fechamento', label: 'Fechamento' },
  { status: 'ganho', label: 'Ganho' },
];

function SectionHeader({ icon: Icon, title, children }: { icon: typeof Phone; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-3.5 w-3.5 text-primary" />
        </div>
        <h3 className="text-sm font-semibold text-foreground tracking-wide">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Phone; label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-1.5">
      <Icon className="h-3.5 w-3.5 mt-0.5 text-muted-foreground/70 shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium">{label}</p>
        <p className="text-sm text-foreground/90 truncate">{value}</p>
      </div>
    </div>
  );
}

export function LeadDetailPanel({ lead, onClose }: Props) {
  const { data: history = [] } = useContactHistory(lead.id);
  const addNote = useAddContactNote();
  const [nota, setNota] = useState('');
  const [tipoNota, setTipoNota] = useState('nota');
  const [showAddNote, setShowAddNote] = useState(false);

  const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const valor = fmt.format(lead.valor_estimado || 0);
  const col = KANBAN_COLUMNS.find((c) => c.id === lead.status);
  const prioConfig = PRIORITY_CONFIG[lead.prioridade || 'normal'];

  // Timeline: determine which stages are completed
  const stageIndex = TIMELINE_STAGES.findIndex(s => s.status === lead.status);
  const isLost = lead.status === 'perdido';

  const handleAddNote = () => {
    if (!nota.trim()) return;
    addNote.mutate({ lead_id: lead.id, tipo: tipoNota, descricao: nota });
    setNota('');
    setShowAddNote(false);
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
    <div className="fixed inset-y-0 right-0 w-full max-w-[480px] bg-card/98 backdrop-blur-2xl border-l border-border/30 z-50 shadow-2xl flex flex-col animate-in slide-in-from-right-full duration-300">
      {/* Header */}
      <div className="relative px-6 pt-5 pb-4 border-b border-border/20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="relative flex items-start justify-between">
          <div className="flex-1 min-w-0 mr-4">
            <div className="flex items-center gap-2 mb-1">
              <Badge
                style={{ backgroundColor: col?.color + '20', color: col?.color, borderColor: col?.color + '40' }}
                variant="outline"
                className="text-[10px] font-semibold"
              >
                {col?.label}
              </Badge>
              <Badge variant="outline" className={`text-[10px] ${prioConfig.bg}`}>
                {prioConfig.label}
              </Badge>
            </div>
            <h2 className="text-lg font-bold text-foreground truncate">{lead.nome_cliente}</h2>
            {lead.empresa && (
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <Building2 className="h-3 w-3" /> {lead.empresa}
              </p>
            )}
            <p className="text-2xl font-bold text-accent mt-2">{valor}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl shrink-0 -mt-1 -mr-2 hover:bg-destructive/10">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-1.5 mt-3">
          <Button variant="outline" size="sm" onClick={openWhatsApp} className="h-8 text-xs gap-1.5 border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-400 flex-1">
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
          </Button>
          <Button variant="outline" size="sm" onClick={openEmail} className="h-8 text-xs gap-1.5 border-primary/30 hover:bg-primary/10 text-primary flex-1">
            <Mail className="h-3.5 w-3.5" /> Email
          </Button>
          <Button variant="outline" size="sm" onClick={() => lead.telefone && window.open(`tel:${lead.telefone.replace(/\D/g, '')}`, '_self')} className="h-8 text-xs gap-1.5 border-accent/30 hover:bg-accent/10 text-accent flex-1">
            <Phone className="h-3.5 w-3.5" /> Ligar
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-warning/30 hover:bg-warning/10 text-warning flex-1">
            <FileText className="h-3.5 w-3.5" /> Orçamento
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-5">

          {/* DADOS PRINCIPAIS */}
          <section>
            <SectionHeader icon={User} title="Dados Principais" />
            <div className="glass-card p-4 space-y-0.5">
              <div className="grid grid-cols-2 gap-x-4">
                <InfoRow icon={User} label="Nome" value={lead.nome_cliente} />
                <InfoRow icon={Building2} label="Empresa" value={lead.empresa} />
                <InfoRow icon={Phone} label="Telefone" value={lead.telefone} />
                <InfoRow icon={Mail} label="Email" value={lead.email} />
                <InfoRow icon={MapPin} label="Cidade" value={lead.cidade} />
                <InfoRow icon={User} label="Responsável" value={lead.responsavel} />
                <InfoRow icon={Calendar} label="Prazo" value={lead.prazo ? format(new Date(lead.prazo), 'dd/MM/yyyy') : null} />
                <InfoRow icon={Tag} label="Segmento" value={lead.observacoes ? 'Brindes Corporativos' : 'Brindes Corporativos'} />
              </div>
            </div>
          </section>

          <Separator className="bg-border/15" />

          {/* OPORTUNIDADE */}
          <section>
            <SectionHeader icon={Target} title="Oportunidade" />
            <div className="glass-card p-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-accent/5 rounded-xl p-3 border border-accent/10">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium">Valor Estimado</p>
                  <p className="text-lg font-bold text-accent">{valor}</p>
                </div>
                <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium">Probabilidade</p>
                  <p className="text-lg font-bold text-primary">
                    {isLost ? '0%' : stageIndex >= 0 ? `${Math.min(Math.round(((stageIndex + 1) / TIMELINE_STAGES.length) * 100), 100)}%` : '10%'}
                  </p>
                </div>
                <InfoRow icon={Tag} label="Produto Solicitado" value={lead.produto_solicitado} />
                <InfoRow icon={TrendingUp} label="Margem Prevista" value={lead.valor_estimado ? `~${Math.round((lead.valor_estimado || 0) * 0.3).toLocaleString('pt-BR')} (30%)` : null} />
              </div>
              {lead.observacoes && (
                <div className="mt-3 pt-3 border-t border-border/15">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium mb-1">Observações</p>
                  <p className="text-sm text-foreground/80">{lead.observacoes}</p>
                </div>
              )}
            </div>
          </section>

          <Separator className="bg-border/15" />

          {/* TIMELINE */}
          <section>
            <SectionHeader icon={Activity} title="Timeline Comercial" />
            <div className="glass-card p-4">
              <div className="relative">
                {TIMELINE_STAGES.map((stage, idx) => {
                  const isCompleted = stageIndex >= idx;
                  const isCurrent = stageIndex === idx;
                  const stageCol = KANBAN_COLUMNS.find(c => c.id === stage.status);
                  return (
                    <div key={stage.status} className="flex items-start gap-3 relative">
                      {/* Vertical line */}
                      {idx < TIMELINE_STAGES.length - 1 && (
                        <div
                          className="absolute left-[11px] top-6 w-0.5 h-full"
                          style={{ backgroundColor: isCompleted ? (stageCol?.color || 'hsl(var(--primary))') + '40' : 'hsl(var(--border) / 0.2)' }}
                        />
                      )}
                      {/* Dot */}
                      <div
                        className={`relative z-10 mt-0.5 h-[22px] w-[22px] rounded-full flex items-center justify-center border-2 shrink-0 transition-all ${
                          isCurrent
                            ? 'scale-110 shadow-lg'
                            : ''
                        }`}
                        style={{
                          borderColor: isCompleted ? stageCol?.color : 'hsl(var(--border) / 0.3)',
                          backgroundColor: isCompleted ? stageCol?.color + '25' : 'transparent',
                        }}
                      >
                        {isCompleted && (
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: stageCol?.color }}
                          />
                        )}
                      </div>
                      {/* Label */}
                      <div className="pb-4 min-w-0">
                        <p className={`text-sm font-medium ${isCompleted ? 'text-foreground' : 'text-muted-foreground/40'}`}>
                          {stage.label}
                        </p>
                        {isCurrent && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {formatDistanceToNow(new Date(lead.updated_at), { addSuffix: true, locale: ptBR })}
                          </p>
                        )}
                        {idx === 0 && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {format(new Date(lead.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
                {isLost && (
                  <div className="flex items-start gap-3">
                    <div className="h-[22px] w-[22px] rounded-full flex items-center justify-center border-2 border-destructive bg-destructive/20 shrink-0">
                      <X className="h-2.5 w-2.5 text-destructive" />
                    </div>
                    <div className="pb-2">
                      <p className="text-sm font-medium text-destructive">Perdido</p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(lead.updated_at), { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          <Separator className="bg-border/15" />

          {/* REGISTRAR INTERAÇÃO */}
          <section>
            <SectionHeader icon={Plus} title="Registrar Interação">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddNote(!showAddNote)}
                className="h-7 text-xs gap-1 text-primary hover:text-primary"
              >
                {showAddNote ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {showAddNote ? 'Fechar' : 'Nova'}
              </Button>
            </SectionHeader>
            {showAddNote && (
              <div className="glass-card p-4 space-y-3">
                <Select value={tipoNota} onValueChange={setTipoNota}>
                  <SelectTrigger className="h-8 text-xs bg-muted/20 border-border/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TIPO_ICONS).map(([key, Icon]) => (
                      <SelectItem key={key} value={key} className="text-xs">
                        <span className="flex items-center gap-2 capitalize">
                          <Icon className="h-3 w-3" /> {key}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  placeholder="Descreva a interação..."
                  rows={3}
                  className="bg-muted/20 border-border/30 text-sm resize-none"
                />
                <Button
                  onClick={handleAddNote}
                  disabled={!nota.trim() || addNote.isPending}
                  size="sm"
                  className="w-full h-8 text-xs gap-1.5"
                >
                  <Send className="h-3 w-3" /> Registrar Interação
                </Button>
              </div>
            )}
          </section>

          <Separator className="bg-border/15" />

          {/* HISTÓRICO */}
          <section>
            <SectionHeader icon={Clock} title="Histórico de Interações" />
            {history.length === 0 ? (
              <div className="glass-card p-6 text-center">
                <Clock className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground/60">Nenhuma interação registrada</p>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((h) => {
                  const TipoIcon = TIPO_ICONS[h.tipo] || FileText;
                  const tipoColor = TIPO_COLORS[h.tipo] || TIPO_COLORS.nota;
                  return (
                    <div key={h.id} className="glass-card p-3 space-y-1.5 hover:border-primary/20 transition-colors">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className={`text-[10px] capitalize gap-1 ${tipoColor}`}>
                          <TipoIcon className="h-2.5 w-2.5" />
                          {h.tipo}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground/60">
                          {format(new Date(h.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/85 leading-relaxed">{h.descricao}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </ScrollArea>
    </div>
  );
}
