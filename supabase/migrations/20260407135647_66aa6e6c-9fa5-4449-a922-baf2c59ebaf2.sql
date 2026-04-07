
-- Chat messages table for team communication
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel TEXT NOT NULL DEFAULT 'geral',
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view messages in group channels or their own DMs
CREATE POLICY "Users can view chat messages" ON public.chat_messages
FOR SELECT TO authenticated
USING (
  recipient_id IS NULL
  OR user_id = auth.uid()
  OR recipient_id = auth.uid()
);

-- All authenticated users can send messages
CREATE POLICY "Users can send chat messages" ON public.chat_messages
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own messages
CREATE POLICY "Users can delete own messages" ON public.chat_messages
FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
