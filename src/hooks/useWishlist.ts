import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type WishlistItem = {
  id: string;
  user_id: string;
  title: string;
  total_value: number;
  saved_value: number;
  image_url: string | null;
  reward_task_id: string | null;
  reward_type: 'fixed' | 'percent';
  reward_value: number;
  created_at: string;
  updated_at: string;
};

export function useWishlist() {
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const { data, error } = await supabase.from('wishlist').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as WishlistItem[];
    },
  });
}

export function useCreateWishlistItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      title: string;
      total_value: number;
      saved_value?: number;
      reward_task_id?: string | null;
      reward_type?: 'fixed' | 'percent';
      reward_value?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const { error } = await supabase.from('wishlist').insert({
        user_id: user.id,
        title: input.title,
        total_value: input.total_value,
        saved_value: input.saved_value ?? 0,
        reward_task_id: input.reward_task_id ?? null,
        reward_type: input.reward_type ?? 'fixed',
        reward_value: input.reward_value ?? 0,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Sonho adicionado');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateWishlistItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Pick<WishlistItem, 'saved_value' | 'reward_task_id' | 'reward_type' | 'reward_value' | 'title' | 'total_value'>>) => {
      const { error } = await supabase.from('wishlist').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist'] }),
  });
}

// Delete AND move saved_value to Opportunity Vault
export function useGiveUpWishlistItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: { id: string; saved_value: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      if (item.saved_value > 0) {
        const { data: existing } = await supabase
          .from('opportunity_vault')
          .select('balance')
          .eq('user_id', user.id)
          .maybeSingle();
        const current = Number(existing?.balance ?? 0);
        const newBalance = current + Number(item.saved_value);
        if (existing) {
          const { error } = await supabase
            .from('opportunity_vault')
            .update({ balance: newBalance })
            .eq('user_id', user.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('opportunity_vault')
            .insert({ user_id: user.id, balance: newBalance });
          if (error) throw error;
        }
      }

      const { error } = await supabase.from('wishlist').delete().eq('id', item.id);
      if (error) throw error;
      return item.saved_value;
    },
    onSuccess: (moved) => {
      qc.invalidateQueries({ queryKey: ['wishlist'] });
      qc.invalidateQueries({ queryKey: ['vault'] });
      if (moved > 0) {
        toast.success(`💰 ${moved.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} realocado para o Cofre de Oportunidades`);
      } else {
        toast.success('Sonho removido');
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
