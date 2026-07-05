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
    mutationFn: async (input: { title: string; total_value: number; saved_value?: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const { error } = await supabase.from('wishlist').insert({
        user_id: user.id,
        title: input.title,
        total_value: input.total_value,
        saved_value: input.saved_value ?? 0,
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
    mutationFn: async ({ id, saved_value }: { id: string; saved_value: number }) => {
      const { error } = await supabase.from('wishlist').update({ saved_value }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist'] }),
  });
}

export function useDeleteWishlistItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('wishlist').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Valor liberado para o saldo geral');
    },
  });
}
