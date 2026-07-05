import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type Task = {
  id: string;
  user_id: string;
  title: string;
  bucket: 'today' | 'next' | 'ideas';
  completed: boolean;
  due_date: string | null;
  created_at: string;
};

export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as Task[];
    },
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { title: string; bucket: Task['bucket'] }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const { error } = await supabase.from('tasks').insert({ ...input, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useToggleTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase.from('tasks').update({ completed }).eq('id', id);
      if (error) throw error;

      // Reward hook: if any wish is linked to this task and it's now completed, credit it
      if (completed) {
        const { data: wishes } = await supabase
          .from('wishlist')
          .select('id, saved_value, total_value, reward_type, reward_value, title')
          .eq('reward_task_id', id);
        if (wishes && wishes.length > 0) {
          for (const w of wishes) {
            const rewardValue = Number(w.reward_value) || 0;
            if (rewardValue <= 0) continue;
            const add = w.reward_type === 'percent'
              ? (Number(w.total_value) * rewardValue) / 100
              : rewardValue;
            const newSaved = Number(w.saved_value) + add;
            await supabase.from('wishlist').update({ saved_value: newSaved }).eq('id', w.id);
            toast.success(`🎁 +${add.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} para "${w.title}"`);
          }
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}
