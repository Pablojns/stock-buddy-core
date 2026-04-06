import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { LeadStatus, LeadPriority } from '@/types/crm';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  defaultStatus?: LeadStatus;
}

export function LeadFormDialog({ open, onClose, onSubmit, defaultStatus = 'novo_lead' }: Props) {
  const [form, setForm] = useState({
    nome_cliente: '', empresa: '', telefone: '', email: '',
    produto_solicitado: '', valor_estimado: '', responsavel: '',
    prazo: '', observacoes: '', cidade: '', prioridade: 'normal' as LeadPriority,
  });

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...form,
      valor_estimado: parseFloat(form.valor_estimado) || 0,
      prazo: form.prazo || null,
      cidade: form.cidade || null,
      status: defaultStatus,
      posicao: 0,
    });
    setForm({
      nome_cliente: '', empresa: '', telefone: '', email: '',
      produto_solicitado: '', valor_estimado: '', responsavel: '',
      prazo: '', observacoes: '', cidade: '', prioridade: 'normal',
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border/50 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground text-base">Novo Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Nome do Cliente *</Label><Input required value={form.nome_cliente} onChange={(e) => set('nome_cliente', e.target.value)} className="bg-muted/30 border-border/50 h-8 text-xs" /></div>
            <div><Label className="text-xs">Empresa</Label><Input value={form.empresa} onChange={(e) => set('empresa', e.target.value)} className="bg-muted/30 border-border/50 h-8 text-xs" /></div>
            <div><Label className="text-xs">Telefone</Label><Input value={form.telefone} onChange={(e) => set('telefone', e.target.value)} className="bg-muted/30 border-border/50 h-8 text-xs" /></div>
            <div><Label className="text-xs">Email</Label><Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className="bg-muted/30 border-border/50 h-8 text-xs" /></div>
            <div><Label className="text-xs">Cidade</Label><Input value={form.cidade} onChange={(e) => set('cidade', e.target.value)} className="bg-muted/30 border-border/50 h-8 text-xs" /></div>
            <div><Label className="text-xs">Produto de Interesse</Label><Input value={form.produto_solicitado} onChange={(e) => set('produto_solicitado', e.target.value)} className="bg-muted/30 border-border/50 h-8 text-xs" /></div>
            <div><Label className="text-xs">Valor Estimado (R$)</Label><Input type="number" step="0.01" value={form.valor_estimado} onChange={(e) => set('valor_estimado', e.target.value)} className="bg-muted/30 border-border/50 h-8 text-xs" /></div>
            <div><Label className="text-xs">Responsável</Label><Input value={form.responsavel} onChange={(e) => set('responsavel', e.target.value)} className="bg-muted/30 border-border/50 h-8 text-xs" /></div>
            <div><Label className="text-xs">Prazo</Label><Input type="date" value={form.prazo} onChange={(e) => set('prazo', e.target.value)} className="bg-muted/30 border-border/50 h-8 text-xs" /></div>
            <div>
              <Label className="text-xs">Prioridade</Label>
              <Select value={form.prioridade} onValueChange={(v) => set('prioridade', v)}>
                <SelectTrigger className="bg-muted/30 border-border/50 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">🟢 Normal</SelectItem>
                  <SelectItem value="medio">🟡 Médio</SelectItem>
                  <SelectItem value="urgente">🔴 Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div><Label className="text-xs">Observações</Label><Textarea value={form.observacoes} onChange={(e) => set('observacoes', e.target.value)} className="bg-muted/30 border-border/50 text-xs" rows={2} /></div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
            <Button type="submit" size="sm">Criar Lead</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
