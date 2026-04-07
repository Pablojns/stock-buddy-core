import { useState, useRef, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import {
  Send, Hash, Users, MessageCircle, User, Circle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useChatMessages, useSendMessage, useTeamMembers, type TeamMember } from '@/hooks/useChat';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

const CHANNELS = [
  { id: 'geral', label: 'Geral', icon: Hash },
  { id: 'comercial', label: 'Comercial', icon: Hash },
  { id: 'logistica', label: 'Logística', icon: Hash },
  { id: 'marketing', label: 'Marketing', icon: Hash },
];

const ROLE_COLORS: Record<string, string> = {
  gestao: 'text-accent',
  comercial: 'text-primary',
  logistica: 'text-emerald-400',
  marketing: 'text-purple-400',
};

export default function Chat() {
  const { user } = useAuth();
  const [activeChannel, setActiveChannel] = useState('geral');
  const [activeDm, setActiveDm] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: members = [] } = useTeamMembers();
  const otherMembers = useMemo(() => members.filter(m => m.user_id !== user?.id), [members, user]);

  const recipientId = activeDm;
  const { data: messages = [], isLoading } = useChatMessages(activeChannel, recipientId);
  const sendMessage = useSendMessage();

  const memberMap = useMemo(() => {
    const map = new Map<string, TeamMember>();
    members.forEach(m => map.set(m.user_id, m));
    return map;
  }, [members]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessage.mutate({ content: message.trim(), channel: activeChannel, recipientId });
    setMessage('');
  };

  const selectChannel = (id: string) => {
    setActiveChannel(id);
    setActiveDm(null);
  };

  const selectDm = (userId: string) => {
    setActiveDm(userId);
  };

  const activeMember = activeDm ? memberMap.get(activeDm) : null;
  const chatTitle = activeDm
    ? activeMember?.display_name ?? 'Mensagem Direta'
    : `#${activeChannel}`;

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
        {/* Sidebar */}
        <div className="w-60 shrink-0 border-r border-border/20 bg-card/40 flex flex-col">
          <div className="p-4 border-b border-border/20">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" />
              Chat Interno
            </h2>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-2 px-2">Canais</p>
              <div className="space-y-0.5 mb-4">
                {CHANNELS.map(ch => (
                  <button
                    key={ch.id}
                    onClick={() => selectChannel(ch.id)}
                    className={cn(
                      'flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-sm transition-colors',
                      !activeDm && activeChannel === ch.id
                        ? 'bg-primary/15 text-primary font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/10'
                    )}
                  >
                    <ch.icon className="h-3.5 w-3.5" />
                    {ch.label}
                  </button>
                ))}
              </div>

              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-2 px-2 flex items-center gap-1">
                <Users className="h-3 w-3" /> Equipe
              </p>
              <div className="space-y-0.5">
                {otherMembers.map(m => (
                  <button
                    key={m.user_id}
                    onClick={() => selectDm(m.user_id)}
                    className={cn(
                      'flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-sm transition-colors',
                      activeDm === m.user_id
                        ? 'bg-primary/15 text-primary font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/10'
                    )}
                  >
                    <Circle className={cn('h-2 w-2 fill-current', ROLE_COLORS[m.role] ?? 'text-muted-foreground')} />
                    <span className="truncate">{m.display_name ?? 'Usuário'}</span>
                    <Badge variant="outline" className="ml-auto text-[8px] px-1 py-0 capitalize border-border/30">
                      {m.role}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="h-12 shrink-0 border-b border-border/20 flex items-center px-5 bg-card/30">
            <h3 className="text-sm font-semibold text-foreground">{chatTitle}</h3>
            {activeMember && (
              <Badge variant="outline" className={cn('ml-2 text-[9px] capitalize', ROLE_COLORS[activeMember.role])}>
                {activeMember.role}
              </Badge>
            )}
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-5">
            <div className="space-y-3 max-w-3xl">
              <AnimatePresence initial={false}>
                {messages.map(msg => {
                  const sender = memberMap.get(msg.user_id);
                  const isMe = msg.user_id === user?.id;

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className={cn('flex gap-3', isMe && 'flex-row-reverse')}
                    >
                      <div className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full shrink-0 text-xs font-bold',
                        isMe ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent'
                      )}>
                        {(sender?.display_name ?? '?')[0]?.toUpperCase()}
                      </div>
                      <div className={cn('max-w-[70%]', isMe && 'text-right')}>
                        <div className="flex items-baseline gap-2 mb-0.5" style={{ flexDirection: isMe ? 'row-reverse' : 'row' }}>
                          <span className={cn('text-xs font-semibold', ROLE_COLORS[sender?.role ?? ''] ?? 'text-foreground')}>
                            {sender?.display_name ?? 'Usuário'}
                          </span>
                          <span className="text-[9px] text-muted-foreground/50">
                            {format(new Date(msg.created_at), 'HH:mm', { locale: ptBR })}
                          </span>
                        </div>
                        <div className={cn(
                          'inline-block rounded-xl px-3.5 py-2 text-sm leading-relaxed',
                          isMe
                            ? 'bg-primary/15 text-foreground rounded-tr-sm'
                            : 'glass-card rounded-tl-sm'
                        )}>
                          {msg.content}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {messages.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/40">
                  <MessageCircle className="h-10 w-10 mb-3" />
                  <p className="text-sm">Nenhuma mensagem ainda</p>
                  <p className="text-xs mt-1">Comece a conversa!</p>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="shrink-0 border-t border-border/20 p-4 bg-card/30">
            <form
              onSubmit={e => { e.preventDefault(); handleSend(); }}
              className="flex gap-2 max-w-3xl"
            >
              <Input
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={`Mensagem para ${chatTitle}...`}
                className="flex-1 border-border/30 bg-muted/10 text-sm"
              />
              <Button type="submit" size="icon" disabled={!message.trim() || sendMessage.isPending} className="shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
