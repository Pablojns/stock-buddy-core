import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type Installment = {
  id: string;
  user_id: string;
  transaction_id: string;
  credit_card_id: string | null;
  installment_number: number;
  total_installments: number;
  amount: number;
  due_date: string;
  paid: boolean;
  created_at: string;
  updated_at: string;
};

export function useInstallments() {
  return useQuery({
    queryKey: ['installments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('installments')
        .select('*')
        .order('due_date');
      if (error) throw error;
      return data as Installment[];
    },
  });
}
