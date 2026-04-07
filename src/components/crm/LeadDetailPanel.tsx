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
import { getWhatsAppUrl } from '@/lib/utils';
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
...
  const openWhatsApp = () => {
    const whatsappUrl = getWhatsAppUrl(lead.telefone);
    if (whatsappUrl) {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  };
...
        <div className="flex gap-1.5 mt-3">
          <Button variant="outline" size="sm" onClick={openWhatsApp} disabled={!getWhatsAppUrl(lead.telefone)} className="h-8 text-xs gap-1.5 border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-400 flex-1 disabled:opacity-50">
            <WhatsAppIcon className="h-3.5 w-3.5" /> WhatsApp
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
