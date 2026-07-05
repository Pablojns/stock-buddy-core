import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type Transaction = {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  payment_method: 'cash' | 'credit';
  credit_card_id: string | null;
  installments_count: number;
  created_at: string;
};

export type CreateTransactionInput = {
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  payment_method?: 'cash' | 'credit';
  credit_card_id?: string | null;
  installments_count?: number;
};

export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      return data as Transaction[];
    },
  });
}

function addMonths(iso: string, months: number): string {
  const d = new Date(iso + 'T00:00:00');
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateTransactionInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const payment_method = input.payment_method ?? 'cash';
      const installments_count = payment_method === 'credit' ? Math.max(1, input.installments_count ?? 1) : 1;

      const { data: tx, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: input.type,
          amount: input.amount,
          description: input.description,
          category: input.category,
          date: input.date,
          payment_method,
          credit_card_id: input.credit_card_id ?? null,
          installments_count,
        })
        .select('id')
        .single();
      if (error) throw error;

      if (payment_method === 'credit' && installments_count >= 1) {
        const per = Math.round((input.amount / installments_count) * 100) / 100;
        const rows = Array.from({ length: installments_count }, (_, i) => ({
          user_id: user.id,
          transaction_id: tx.id,
          credit_card_id: input.credit_card_id ?? null,
          installment_number: i + 1,
          total_installments: installments_count,
          amount: per,
          due_date: addMonths(input.date, i + 1),
        }));
        const { error: iErr } = await supabase.from('installments').insert(rows);
        if (iErr) throw iErr;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['installments'] });
      toast.success('Transação adicionada');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['installments'] });
    },
  });
}
