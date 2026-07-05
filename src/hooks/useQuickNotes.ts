import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type QuickNote = {
  id: string;
  user_id: string;
  text: string;
  created_at: string;
};

export function useQuickNotes() {
  return useQuery({
    queryKey: ['quick_notes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('quick_notes').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as QuickNote[];
    },
  });
}

export function useCreateQuickNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (text: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const { error } = await supabase.from('quick_notes').insert({ user_id: user.id, text });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quick_notes'] }),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteQuickNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('quick_notes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quick_notes'] }),
  });
}

/** Converte quick_note em task e apaga a note. */
export function useConvertQuickNoteToTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, text, due_date }: { id: string; text: string; due_date?: string | null }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const bucket = due_date ? 'today' : 'ideas';
      const { error: e1 } = await supabase.from('tasks').insert({
        user_id: user.id, title: text, bucket, due_date: due_date ?? null,
      });
      if (e1) throw e1;
      const { error: e2 } = await supabase.from('quick_notes').delete().eq('id', id);
      if (e2) throw e2;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quick_notes'] });
      qc.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Enviado para Rotina & Foco');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Converte quick_note em nota estruturada e apaga a quick_note. */
export function useArchiveQuickNoteToNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, text }: { id: string; text: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const title = text.slice(0, 60) || 'Nota rápida';
      const { error: e1 } = await supabase.from('notes').insert({ user_id: user.id, title, content: text });
      if (e1) throw e1;
      const { error: e2 } = await supabase.from('quick_notes').delete().eq('id', id);
      if (e2) throw e2;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quick_notes'] });
      qc.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Arquivado no Segundo Cérebro');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
