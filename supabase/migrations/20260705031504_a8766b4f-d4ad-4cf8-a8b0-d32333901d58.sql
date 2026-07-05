
CREATE TABLE public.opportunity_vault (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.opportunity_vault TO authenticated;
GRANT ALL ON public.opportunity_vault TO service_role;
ALTER TABLE public.opportunity_vault ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own vault" ON public.opportunity_vault FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_opportunity_vault_updated_at BEFORE UPDATE ON public.opportunity_vault FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.wishlist
  ADD COLUMN reward_task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  ADD COLUMN reward_type TEXT NOT NULL DEFAULT 'fixed' CHECK (reward_type IN ('fixed','percent')),
  ADD COLUMN reward_value NUMERIC NOT NULL DEFAULT 0;
CREATE INDEX idx_wishlist_reward_task ON public.wishlist(reward_task_id) WHERE reward_task_id IS NOT NULL;
