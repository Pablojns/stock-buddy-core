
-- Orders table
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL,
  client_name text NOT NULL,
  client_document text DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  notes text DEFAULT '',
  photo_url text DEFAULT '',
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users can view orders" ON public.orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can insert orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth users can update orders" ON public.orders FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth users can delete orders" ON public.orders FOR DELETE TO authenticated USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'gestao'::app_role));

-- Order items table
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id),
  product_name text NOT NULL,
  product_code text DEFAULT '',
  product_image text DEFAULT '',
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  is_separated boolean NOT NULL DEFAULT false,
  is_packed boolean NOT NULL DEFAULT false,
  is_shipped boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users can view order items" ON public.order_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can insert order items" ON public.order_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update order items" ON public.order_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth users can delete order items" ON public.order_items FOR DELETE TO authenticated USING (true);

-- Storage bucket for picking photos
INSERT INTO storage.buckets (id, name, public) VALUES ('order-photos', 'order-photos', true);

CREATE POLICY "Auth users can upload order photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'order-photos');
CREATE POLICY "Anyone can view order photos" ON storage.objects FOR SELECT USING (bucket_id = 'order-photos');
