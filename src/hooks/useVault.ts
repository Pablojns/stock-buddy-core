import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type Vault = { user_id: string; balance: number };

async function getOrCreateVault(userId: string): Promise<Vault> {
  const { data, error } = await supabase
    .from('opportunity_vault')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  if (data) return data as Vault;
  const { data: created, error: err2 } = await supabase
    .from('opportunity_vault')
    .insert({ user_id: userId, balance: 0 })
    .select()
    .single();
  if (err2) throw err2;
  return created as Vault;
}

export function useVault() {
  return useQuery({
    queryKey: ['vault'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { user_id: '', balance: 0 } as Vault;
      return getOrCreateVault(user.id);
    },
  });
}

export function useAddToVault() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (amount: number) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const current = await getOrCreateVault(user.id);
      const { error } = await supabase
        .from('opportunity_vault')
        .update({ balance: Number(current.balance) + amount })
        .eq('user_id', user.id);
      if (error) throw error;
      return amount;
    },
    onSuccess: (amount) => {
      qc.invalidateQueries({ queryKey: ['vault'] });
      if (amount > 0) {
        toast.success(`+ ${amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} no Cofre de Oportunidades`);
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
