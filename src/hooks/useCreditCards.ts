import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type CreditCard = {
  id: string;
  user_id: string;
  name: string;
  brand: string | null;
  limit_amount: number;
  closing_day: number;
  due_day: number;
  color: string | null;
  created_at: string;
  updated_at: string;
};

export function useCreditCards() {
  return useQuery({
    queryKey: ['credit_cards'],
    queryFn: async () => {
      const { data, error } = await supabase.from('credit_cards').select('*').order('created_at');
      if (error) throw error;
      return data as CreditCard[];
    },
  });
}

export function useCreateCreditCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<CreditCard, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const { error } = await supabase.from('credit_cards').insert({ ...input, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['credit_cards'] });
      toast.success('Cartão adicionado');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteCreditCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('credit_cards').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['credit_cards'] });
      qc.invalidateQueries({ queryKey: ['installments'] });
    },
  });
}
