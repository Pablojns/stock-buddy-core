import { useMemo, useState } from 'react';
import {
  X,
  Phone,
  Mail,
  FileText,
  Send,
  Calendar,
  Building2,
  User,
  MapPin,
  Tag,
  Target,
  TrendingUp,
  Clock,
  Plus,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Activity,
  type LucideIcon,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useContactHistory, useAddContactNote } from '@/hooks/useLeads';
import { getWhatsAppUrl } from '@/lib/utils';
import type { Lead } from '@/types/crm';
import { KANBAN_COLUMNS, PRIORITY_CONFIG } from '@/types/crm';

interface Props {
  lead: Lead;
  onClose: () => void;
}

const TIMELINE_STAGES = [
  { status: 'novo_lead', label: 'Lead Criado' },
  { status: 'primeiro_contato', label: 'Primeiro Contato' },
  { status: 'qualificacao', label: 'Qualificação' },
  { status: 'orcamento_enviado', label: 'Orçamento Enviado' },
  { status: 'negociacao', label: 'Negociação' },
  { status: 'fechamento', label: 'Fechamento' },
  { status: 'ganho', label: 'Ganho' },
] as const;

const TIPO_ICONS: Record<string, LucideIcon | ((props: { className?: string }) => JSX.Element)> = {
  nota: FileText,
  whatsapp: ({ className }) => <WhatsAppIcon className={className} />,
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

function SectionHeader({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string | null | undefined }) {
  return (
    <div className="py-2">
      <div className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground/70">
        <Icon className="h-3 w-3" />
        <span>{label}</span>
      </div>
      <p className="text-sm text-foreground/90">{value || '—'}</p>
    </div>
  );
}

export function LeadDetailPanel({ lead, onClose }: Props) {
  const [showAddNote, setShowAddNote] = useState(false);
  const [nota, setNota] = useState('');
  const [tipoNota, setTipoNota] = useState('nota');

  const { data: history = [] } = useContactHistory(lead.id);
  const addNote = useAddContactNote();

  const valor = useMemo(
    () => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.valor_estimado || 0),
    [lead.valor_estimado]
  );

  const stageIndex = TIMELINE_STAGES.findIndex((stage) => stage.status === lead.status);
  const isLost = lead.status === 'perdido';
  const col = KANBAN_COLUMNS.find((column) => column.id === lead.status);
  const prioConfig = PRIORITY_CONFIG[lead.prioridade] || PRIORITY_CONFIG.normal;
  const whatsappUrl = getWhatsAppUrl(lead.telefone);

  const handleAddNote = () => {
    if (!nota.trim()) return;

    addNote.mutate({
      lead_id: lead.id,
      tipo: tipoNota,
      descricao: nota.trim(),
    });

    setNota('');
    setShowAddNote(false);
  };

  const openWhatsApp = () => {
    if (whatsappUrl) {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const openEmail = () => {
    if (lead.email) {
      window.open(`mailto:${lead.email}`, '_blank', 'noopener,noreferrer');
    }
  };

  const openPhone = () => {
    if (lead.telefone) {
      window.open(`tel:${lead.telefone.replace(/\D/g, '')}`, '_self');
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[480px] flex-col border-l border-border/30 bg-card/98 shadow-2xl backdrop-blur-2xl animate-in slide-in-from-right-full duration-300">
      <div className="relative border-b border-border/20 px-6 pb-4 pt-5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <Badge
                variant="outline"
                style={{
                  backgroundColor: `${col?.color ?? '#3b82f6'}20`,
                  color: col?.color ?? '#3b82f6',
                  borderColor: `${col?.color ?? '#3b82f6'}40`,
                }}
                className="text-[10px] font-semibold"
              >
                {col?.label || 'Lead'}
              </Badge>
              <Badge variant="outline" className={`text-[10px] ${prioConfig.bg}`}>
                {prioConfig.label}
              </Badge>
            </div>
            <h2 className="truncate text-lg font-bold text-foreground">{lead.nome_cliente}</h2>
            {lead.empresa && (
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Building2 className="h-3 w-3" />
                {lead.empresa}
              </p>
            )}
            <p className="mt-2 text-2xl font-bold text-accent">{valor}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="-mr-2 -mt-1 shrink-0 rounded-xl hover:bg-destructive/10">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-1.5 xl:grid-cols-4">
          <Button
            variant="outline"
            size="sm"
            onClick={openWhatsApp}
            disabled={!whatsappUrl}
            className="h-8 flex-1 gap-1.5 border-emerald-500/30 text-xs text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50"
          >
            <WhatsAppIcon className="h-3.5 w-3.5" />
            WhatsApp
          </Button>
          <Button variant="outline" size="sm" onClick={openEmail} className="h-8 flex-1 gap-1.5 border-primary/30 text-xs text-primary hover:bg-primary/10">
            <Mail className="h-3.5 w-3.5" />
            Email
          </Button>
          <Button variant="outline" size="sm" onClick={openPhone} className="h-8 flex-1 gap-1.5 border-accent/30 text-xs text-accent hover:bg-accent/10">
            <Phone className="h-3.5 w-3.5" />
            Ligar
          </Button>
          <Button variant="outline" size="sm" className="h-8 flex-1 gap-1.5 border-warning/30 text-xs text-warning hover:bg-warning/10">
            <FileText className="h-3.5 w-3.5" />
            Orçamento
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-5 p-6">
          <section>
            <SectionHeader icon={User} title="Dados Principais" />
            <div className="glass-card p-4">
              <div className="grid grid-cols-2 gap-x-4">
                <InfoRow icon={User} label="Nome" value={lead.nome_cliente} />
                <InfoRow icon={Building2} label="Empresa" value={lead.empresa} />
                <InfoRow icon={Phone} label="Telefone" value={lead.telefone} />
                <InfoRow icon={Mail} label="Email" value={lead.email} />
                <InfoRow icon={MapPin} label="Cidade" value={lead.cidade} />
                <InfoRow icon={User} label="Responsável" value={lead.responsavel} />
                <InfoRow icon={Calendar} label="Prazo" value={lead.prazo ? format(new Date(lead.prazo), 'dd/MM/yyyy') : null} />
                <InfoRow icon={Tag} label="Segmento" value="Brindes Corporativos" />
              </div>
            </div>
          </section>

          <Separator className="bg-border/15" />

          <section>
            <SectionHeader icon={Target} title="Oportunidade" />
            <div className="glass-card p-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-accent/10 bg-accent/5 p-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">Valor Estimado</p>
                  <p className="text-lg font-bold text-accent">{valor}</p>
                </div>
                <div className="rounded-xl border border-primary/10 bg-primary/5 p-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">Probabilidade</p>
                  <p className="text-lg font-bold text-primary">
                    {isLost ? '0%' : stageIndex >= 0 ? `${Math.min(Math.round(((stageIndex + 1) / TIMELINE_STAGES.length) * 100), 100)}%` : '10%'}
                  </p>
                </div>
                <InfoRow icon={Tag} label="Produto Solicitado" value={lead.produto_solicitado} />
                <InfoRow
                  icon={TrendingUp}
                  label="Margem Prevista"
                  value={lead.valor_estimado ? `~${Math.round((lead.valor_estimado || 0) * 0.3).toLocaleString('pt-BR')} (30%)` : null}
                />
              </div>

              {lead.observacoes && (
                <div className="mt-3 border-t border-border/15 pt-3">
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">Observações</p>
                  <p className="text-sm text-foreground/80">{lead.observacoes}</p>
                </div>
              )}
            </div>
          </section>

          <Separator className="bg-border/15" />

          <section>
            <SectionHeader icon={Activity} title="Timeline Comercial" />
            <div className="glass-card p-4">
              <div className="relative">
                {TIMELINE_STAGES.map((stage, index) => {
                  const isCompleted = !isLost && stageIndex >= index;
                  const isCurrent = !isLost && stageIndex === index;
                  const stageColumn = KANBAN_COLUMNS.find((column) => column.id === stage.status);

                  return (
                    <div key={stage.status} className="relative flex items-start gap-3">
                      {index < TIMELINE_STAGES.length - 1 && (
                        <div
                          className="absolute left-[11px] top-6 h-full w-0.5"
                          style={{
                            backgroundColor: isCompleted ? `${stageColumn?.color ?? '#3b82f6'}40` : 'hsl(var(--border) / 0.2)',
                          }}
                        />
                      )}

                      <div
                        className={`relative z-10 mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 transition-all ${isCurrent ? 'scale-110 shadow-lg' : ''}`}
                        style={{
                          borderColor: isCompleted ? stageColumn?.color : 'hsl(var(--border) / 0.3)',
                          backgroundColor: isCompleted ? `${stageColumn?.color ?? '#3b82f6'}25` : 'transparent',
                        }}
                      >
                        {isCompleted && <div className="h-2 w-2 rounded-full" style={{ backgroundColor: stageColumn?.color }} />}
                      </div>

                      <div className="min-w-0 pb-4">
                        <p className={`text-sm font-medium ${isCompleted ? 'text-foreground' : 'text-muted-foreground/40'}`}>
                          {stage.label}
                        </p>
                        {isCurrent && (
                          <p className="mt-0.5 text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(lead.updated_at), { addSuffix: true, locale: ptBR })}
                          </p>
                        )}
                        {index === 0 && (
                          <p className="mt-0.5 text-[10px] text-muted-foreground">
                            {format(new Date(lead.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}

                {isLost && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 border-destructive bg-destructive/20">
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

          <section>
            <SectionHeader icon={Plus} title="Registrar Interação">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddNote((prev) => !prev)}
                className="h-7 gap-1 text-xs text-primary hover:text-primary"
              >
                {showAddNote ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {showAddNote ? 'Fechar' : 'Nova'}
              </Button>
            </SectionHeader>

            {showAddNote && (
              <div className="glass-card space-y-3 p-4">
                <Select value={tipoNota} onValueChange={setTipoNota}>
                  <SelectTrigger className="h-8 border-border/30 bg-muted/20 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TIPO_ICONS).map(([key, Icon]) => (
                      <SelectItem key={key} value={key} className="text-xs capitalize">
                        <span className="flex items-center gap-2">
                          <Icon className="h-3 w-3" />
                          {key}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Textarea
                  value={nota}
                  onChange={(event) => setNota(event.target.value)}
                  placeholder="Descreva a interação..."
                  rows={3}
                  className="resize-none border-border/30 bg-muted/20 text-sm"
                />

                <Button onClick={handleAddNote} disabled={!nota.trim() || addNote.isPending} size="sm" className="h-8 w-full gap-1.5 text-xs">
                  <Send className="h-3 w-3" />
                  Registrar Interação
                </Button>
              </div>
            )}
          </section>

          <Separator className="bg-border/15" />

          <section>
            <SectionHeader icon={Clock} title="Histórico de Interações" />
            {history.length === 0 ? (
              <div className="glass-card p-6 text-center">
                <Clock className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground/60">Nenhuma interação registrada</p>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((item) => {
                  const TipoIcon = TIPO_ICONS[item.tipo] || FileText;
                  const tipoColor = TIPO_COLORS[item.tipo] || TIPO_COLORS.nota;

                  return (
                    <div key={item.id} className="glass-card space-y-1.5 p-3 transition-colors hover:border-primary/20">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline" className={`gap-1 text-[10px] capitalize ${tipoColor}`}>
                          <TipoIcon className="h-2.5 w-2.5" />
                          {item.tipo}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground/60">
                          {format(new Date(item.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-foreground/85">{item.descricao}</p>
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
