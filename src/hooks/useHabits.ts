import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type Habit = { id: string; user_id: string; name: string; color: string | null };
export type HabitLog = { id: string; habit_id: string; date: string };

export function useHabits() {
  return useQuery({
    queryKey: ['habits'],
    queryFn: async () => {
      const { data, error } = await supabase.from('habits').select('*').order('created_at');
      if (error) throw error;
      return data as Habit[];
    },
  });
}

export function useHabitLogs() {
  return useQuery({
    queryKey: ['habit_logs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('habit_logs').select('*');
      if (error) throw error;
      return data as HabitLog[];
    },
  });
}

export function useCreateHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const { error } = await supabase.from('habits').insert({ name, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['habits'] }),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useToggleHabitLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ habit_id, date, exists }: { habit_id: string; date: string; exists: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      if (exists) {
        const { error } = await supabase.from('habit_logs').delete().eq('habit_id', habit_id).eq('date', date);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('habit_logs').insert({ habit_id, date, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['habit_logs'] }),
  });
}

export function useDeleteHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('habits').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['habits'] });
      qc.invalidateQueries({ queryKey: ['habit_logs'] });
    },
  });
}
