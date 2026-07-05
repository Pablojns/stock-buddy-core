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

async function setVaultBalance(userId: string, newBalance: number) {
  const { error } = await supabase
    .from('opportunity_vault')
    .update({ balance: newBalance })
    .eq('user_id', userId);
  if (error) throw error;
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
      await setVaultBalance(user.id, Number(current.balance) + amount);
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

// Transfer from vault into a wishlist item's saved_value
export function useTransferVaultToWish() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ wishId, amount }: { wishId: string; amount: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      if (amount <= 0) throw new Error('Valor inválido');

      const vault = await getOrCreateVault(user.id);
      if (Number(vault.balance) < amount) throw new Error('Saldo insuficiente no cofre');

      const { data: wish, error: wErr } = await supabase
        .from('wishlist')
        .select('saved_value, total_value, title')
        .eq('id', wishId)
        .single();
      if (wErr) throw wErr;

      const newSaved = Math.min(Number(wish.total_value), Number(wish.saved_value) + amount);
      const applied = newSaved - Number(wish.saved_value);

      const { error: uErr } = await supabase
        .from('wishlist')
        .update({ saved_value: newSaved })
        .eq('id', wishId);
      if (uErr) throw uErr;

      await setVaultBalance(user.id, Number(vault.balance) - applied);
      return { applied, title: wish.title };
    },
    onSuccess: ({ applied, title }) => {
      qc.invalidateQueries({ queryKey: ['vault'] });
      qc.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success(`Transferido ${applied.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} para "${title}"`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// Withdraw from vault into general balance (creates an income transaction)
export function useWithdrawVault() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (amount: number) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      if (amount <= 0) throw new Error('Valor inválido');

      const vault = await getOrCreateVault(user.id);
      if (Number(vault.balance) < amount) throw new Error('Saldo insuficiente no cofre');

      const { error: txErr } = await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'income',
        amount,
        description: 'Resgate do Cofre de Oportunidades',
        category: 'Cofre',
        date: new Date().toISOString().slice(0, 10),
        payment_method: 'cash',
      });
      if (txErr) throw txErr;

      await setVaultBalance(user.id, Number(vault.balance) - amount);
      return amount;
    },
    onSuccess: (amount) => {
      qc.invalidateQueries({ queryKey: ['vault'] });
      qc.invalidateQueries({ queryKey: ['transactions'] });
      toast.success(`Resgatado ${amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} para o saldo geral`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
