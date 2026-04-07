import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Users, User, Save, Loader2 } from 'lucide-react';
import { useTeamMembers } from '@/hooks/useChat';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const ROLES = [
  { value: 'gestao', label: 'Gestão (Admin)', description: 'Acesso total a todas as funções' },
  { value: 'comercial', label: 'Comercial', description: 'CRM, leads, propostas e vendas' },
  { value: 'logistica', label: 'Logística', description: 'Estoque, separação e expedição' },
  { value: 'marketing', label: 'Marketing', description: 'Dashboard de marketing e métricas' },
] as const;

const ROLE_COLORS: Record<string, string> = {
  gestao: 'bg-accent/15 text-accent border-accent/30',
  comercial: 'bg-primary/15 text-primary border-primary/30',
  logistica: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  marketing: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
};

export default function Admin() {
  const { role: myRole, loading: roleLoading } = useUserRole();
  const { data: members = [], isLoading } = useTeamMembers();
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const qc = useQueryClient();

  const isAdmin = myRole === 'gestao';

  const handleSave = async (userId: string) => {
    const newRole = edits[userId];
    if (!newRole) return;

    setSaving(userId);
    try {
      // Update the user's role
      const { error: delErr } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);
      if (delErr) throw delErr;

      const { error: insErr } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole as any });
      if (insErr) throw insErr;

      toast.success('Permissão atualizada com sucesso!');
      setEdits(prev => { const next = { ...prev }; delete next[userId]; return next; });
      qc.invalidateQueries({ queryKey: ['team-members'] });
    } catch (err: any) {
      toast.error('Erro ao atualizar: ' + err.message);
    } finally {
      setSaving(null);
    }
  };

  if (roleLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
          <Shield className="h-12 w-12 mb-4 text-destructive/50" />
          <h2 className="text-lg font-bold">Acesso Restrito</h2>
          <p className="text-sm mt-1">Apenas administradores (Gestão) podem acessar este painel.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Administração</h1>
            <p className="text-sm text-muted-foreground">Gerencie permissões e papéis da equipe</p>
          </div>
        </div>

        <GlassCard>
          <div className="flex items-center gap-2 mb-5">
            <Users className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Membros da Equipe</h2>
            <Badge variant="outline" className="ml-auto text-xs">{members.length} membros</Badge>
          </div>

          <div className="space-y-3">
            {members.map(member => {
              const currentRole = edits[member.user_id] ?? member.role;
              const hasChanged = edits[member.user_id] !== undefined;
              const roleColor = ROLE_COLORS[member.role] ?? '';

              return (
                <div key={member.user_id} className="flex items-center gap-4 p-4 rounded-xl border border-border/20 bg-muted/5 hover:border-primary/20 transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                    {(member.display_name ?? '?')[0]?.toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {member.display_name ?? 'Sem nome'}
                    </p>
                    <Badge variant="outline" className={`text-[9px] capitalize mt-0.5 ${roleColor}`}>
                      {member.role}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select
                      value={currentRole}
                      onValueChange={val => setEdits(prev => ({ ...prev, [member.user_id]: val }))}
                    >
                      <SelectTrigger className="w-44 h-9 text-xs border-border/30 bg-muted/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map(r => (
                          <SelectItem key={r.value} value={r.value} className="text-xs">
                            <div>
                              <p className="font-medium">{r.label}</p>
                              <p className="text-[10px] text-muted-foreground">{r.description}</p>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      size="sm"
                      variant={hasChanged ? 'default' : 'ghost'}
                      disabled={!hasChanged || saving === member.user_id}
                      onClick={() => handleSave(member.user_id)}
                      className="h-9 gap-1.5"
                    >
                      {saving === member.user_id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Save className="h-3.5 w-3.5" />
                      )}
                      Salvar
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-sm font-semibold text-foreground mb-3">Legenda de Permissões</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ROLES.map(r => (
              <div key={r.value} className="flex items-start gap-3 p-3 rounded-lg border border-border/15 bg-muted/5">
                <Badge variant="outline" className={`text-[10px] capitalize shrink-0 ${ROLE_COLORS[r.value]}`}>
                  {r.value}
                </Badge>
                <div>
                  <p className="text-xs font-medium text-foreground">{r.label}</p>
                  <p className="text-[10px] text-muted-foreground">{r.description}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
