
-- Clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  nome_cliente TEXT NOT NULL,
  empresa TEXT,
  telefone TEXT,
  email TEXT,
  cidade TEXT,
  responsavel TEXT,
  produto_recorrente TEXT,
  total_comprado NUMERIC NOT NULL DEFAULT 0,
  total_pedidos INTEGER NOT NULL DEFAULT 0,
  ultimo_pedido TIMESTAMP WITH TIME ZONE,
  frequencia_compra TEXT DEFAULT 'novo',
  classificacao TEXT NOT NULL DEFAULT 'normal',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Authenticated users can view clients" ON public.clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert clients" ON public.clients FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'logistica'::app_role));
CREATE POLICY "Authenticated users can update clients" ON public.clients FOR UPDATE TO authenticated USING (auth.uid() = user_id OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'logistica'::app_role)) WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'logistica'::app_role));
CREATE POLICY "Authenticated users can delete clients" ON public.clients FOR DELETE TO authenticated USING (auth.uid() = user_id OR has_role(auth.uid(), 'gestao'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create client when lead moves to 'ganho'
CREATE OR REPLACE FUNCTION public.auto_create_client_on_ganho()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'ganho' AND (OLD.status IS NULL OR OLD.status <> 'ganho') THEN
    INSERT INTO public.clients (user_id, lead_id, nome_cliente, empresa, telefone, email, cidade, responsavel, produto_recorrente, total_comprado, total_pedidos)
    VALUES (NEW.user_id, NEW.id, NEW.nome_cliente, NEW.empresa, NEW.telefone, NEW.email, NEW.cidade, NEW.responsavel, NEW.produto_solicitado, COALESCE(NEW.valor_estimado, 0), 1)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_create_client
AFTER UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION auto_create_client_on_ganho();
