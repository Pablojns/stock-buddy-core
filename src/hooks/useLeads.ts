import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Lead, LeadStatus, ContactHistory } from '@/types/crm';
import { toast } from 'sonner';

export function useLeads() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const leadsQuery = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('posicao', { ascending: true });
      if (error) throw error;
      return data as Lead[];
    },
    enabled: !!user,
  });

  const createLead = useMutation({
    mutationFn: async (lead: Partial<Lead>) => {
      const { data, error } = await supabase
        .from('leads')
        .insert({ ...lead, user_id: user!.id } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['leads'] }); toast.success('Lead criado!'); },
    onError: (e) => toast.error('Erro ao criar lead: ' + e.message),
  });

  const updateLead = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Lead> & { id: string }) => {
      const { error } = await supabase
        .from('leads')
        .update(updates as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
    onError: (e) => toast.error('Erro ao atualizar lead: ' + e.message),
  });

  const deleteLead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['leads'] }); toast.success('Lead removido'); },
  });

  const moveLeadStatus = useMutation({
    mutationFn: async ({ id, status, posicao }: { id: string; status: LeadStatus; posicao: number }) => {
      const { error } = await supabase
        .from('leads')
        .update({ status, posicao } as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
  });

  return { leads: leadsQuery.data ?? [], isLoading: leadsQuery.isLoading, createLead, updateLead, deleteLead, moveLeadStatus };
}

export function useContactHistory(leadId: string | null) {
  return useQuery({
    queryKey: ['contact_history', leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_history')
        .select('*')
        .eq('lead_id', leadId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ContactHistory[];
    },
    enabled: !!leadId,
  });
}

export function useAddContactNote() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ lead_id, tipo, descricao }: { lead_id: string; tipo: string; descricao: string }) => {
      const { error } = await supabase
        .from('contact_history')
        .insert({ lead_id, user_id: user!.id, tipo, descricao } as any);
      if (error) throw error;
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['contact_history', v.lead_id] });
      toast.success('Nota adicionada');
    },
  });
}
