import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export interface ChatMessage {
  id: string;
  user_id: string;
  channel: string;
  recipient_id: string | null;
  content: string;
  created_at: string;
}

export interface TeamMember {
  user_id: string;
  display_name: string | null;
  role: string;
  email?: string;
}

export function useTeamMembers() {
  return useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('user_id, display_name');
      if (pErr) throw pErr;

      const { data: roles, error: rErr } = await supabase
        .from('user_roles')
        .select('user_id, role');
      if (rErr) throw rErr;

      const roleMap = new Map(roles?.map(r => [r.user_id, r.role]) ?? []);

      return (profiles ?? []).map(p => ({
        user_id: p.user_id,
        display_name: p.display_name,
        role: roleMap.get(p.user_id) ?? 'gestao',
      })) as TeamMember[];
    },
  });
}

export function useChatMessages(channel: string, recipientId: string | null) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const queryKey = recipientId ? ['chat', 'dm', recipientId] : ['chat', 'channel', channel];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      let q = supabase.from('chat_messages').select('*').order('created_at', { ascending: true });

      if (recipientId) {
        // DM: messages between me and recipient
        q = q.is('channel', null).or(
          `and(user_id.eq.${user!.id},recipient_id.eq.${recipientId}),and(user_id.eq.${recipientId},recipient_id.eq.${user!.id})`
        );
      } else {
        q = q.eq('channel', channel).is('recipient_id', null);
      }

      const { data, error } = await q;
      if (error) throw error;
      return data as ChatMessage[];
    },
    enabled: !!user,
  });

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const sub = supabase
      .channel(`chat-${channel}-${recipientId ?? 'group'}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, () => {
        qc.invalidateQueries({ queryKey });
      })
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [user, channel, recipientId, qc, queryKey]);

  return query;
}

export function useSendMessage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ content, channel, recipientId }: { content: string; channel: string; recipientId: string | null }) => {
      const payload: any = {
        user_id: user!.id,
        content,
        channel: recipientId ? 'dm' : channel,
        recipient_id: recipientId,
      };
      const { error } = await supabase.from('chat_messages').insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chat'] });
    },
  });
}
