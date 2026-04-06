
-- Lead status enum
CREATE TYPE public.lead_status AS ENUM (
  'novo_lead', 'em_contato', 'orcamento_enviado', 'negociacao', 'pedido_fechado', 'perdido'
);

-- Leads table
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  nome_cliente TEXT NOT NULL,
  empresa TEXT,
  telefone TEXT,
  email TEXT,
  produto_solicitado TEXT,
  valor_estimado NUMERIC DEFAULT 0,
  responsavel TEXT,
  prazo DATE,
  observacoes TEXT,
  status lead_status NOT NULL DEFAULT 'novo_lead',
  posicao INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Contact history table
CREATE TABLE public.contact_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'nota',
  descricao TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_history ENABLE ROW LEVEL SECURITY;

-- RLS for leads: authenticated users can do everything
CREATE POLICY "Authenticated users can view leads" ON public.leads
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert leads" ON public.leads
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update leads" ON public.leads
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete leads" ON public.leads
  FOR DELETE TO authenticated USING (auth.uid() = user_id OR has_role(auth.uid(), 'gestao'));

-- RLS for contact_history
CREATE POLICY "Authenticated users can view contact history" ON public.contact_history
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert contact history" ON public.contact_history
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Updated_at trigger for leads
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for leads
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
