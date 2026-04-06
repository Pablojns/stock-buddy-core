
-- Products table for inventory
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  code text NOT NULL,
  sku text,
  name text NOT NULL,
  description text DEFAULT '',
  category text NOT NULL DEFAULT 'Outros',
  supplier text DEFAULT '',
  ncm text DEFAULT '',
  location_street text DEFAULT '',
  location_shelf text DEFAULT '',
  location_level text DEFAULT '',
  current_quantity integer NOT NULL DEFAULT 0,
  reserved_quantity integer NOT NULL DEFAULT 0,
  minimum_quantity integer NOT NULL DEFAULT 0,
  cost_price numeric NOT NULL DEFAULT 0,
  sale_price numeric NOT NULL DEFAULT 0,
  restock_date date,
  entry_date date DEFAULT CURRENT_DATE,
  last_movement timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Stock movements table
CREATE TABLE public.stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  type text NOT NULL DEFAULT 'entry',
  quantity integer NOT NULL,
  previous_quantity integer NOT NULL DEFAULT 0,
  new_quantity integer NOT NULL DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Auth users can view products" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth users can update products" ON public.products FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth users can delete products" ON public.products FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'gestao'));

-- Stock movements policies
CREATE POLICY "Auth users can view movements" ON public.stock_movements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can insert movements" ON public.stock_movements FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at on products
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
