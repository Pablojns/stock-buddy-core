import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Client {
  id: string;
  user_id: string;
  lead_id: string | null;
  nome_cliente: string;
  empresa: string | null;
  telefone: string | null;
  email: string | null;
  cidade: string | null;
  responsavel: string | null;
  produto_recorrente: string | null;
  total_comprado: number;
  total_pedidos: number;
  ultimo_pedido: string | null;
  frequencia_compra: string;
  classificacao: string;
  created_at: string;
  updated_at: string;
}

export function useClients() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const clientsQuery = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients' as any)
        .select('*')
        .order('total_comprado', { ascending: false });
      if (error) throw error;
      return (data as any[]) as Client[];
    },
    enabled: !!user,
  });

  const updateClient = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Client> & { id: string }) => {
      const { error } = await supabase
        .from('clients' as any)
        .update(updates as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Cliente atualizado');
    },
    onError: (e) => toast.error('Erro: ' + e.message),
  });

  return { clients: clientsQuery.data ?? [], isLoading: clientsQuery.isLoading, updateClient };
}
