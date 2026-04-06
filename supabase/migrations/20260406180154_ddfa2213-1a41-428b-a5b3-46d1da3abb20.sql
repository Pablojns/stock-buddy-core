
-- Fix leads UPDATE policy: restrict to owner or gestao
DROP POLICY IF EXISTS "Authenticated users can update leads" ON public.leads;
CREATE POLICY "Authenticated users can update leads"
  ON public.leads FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'gestao'::app_role))
  WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'gestao'::app_role));

-- Fix products UPDATE policy: restrict to owner or gestao
DROP POLICY IF EXISTS "Auth users can update products" ON public.products;
CREATE POLICY "Auth users can update products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'gestao'::app_role))
  WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'gestao'::app_role));

-- Fix order_items UPDATE policy: restrict via order ownership
DROP POLICY IF EXISTS "Auth users can update order items" ON public.order_items;
CREATE POLICY "Auth users can update order items"
  ON public.order_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR has_role(auth.uid(), 'gestao'::app_role))
    )
  );

-- Fix order_items DELETE policy: restrict via order ownership
DROP POLICY IF EXISTS "Auth users can delete order items" ON public.order_items;
CREATE POLICY "Auth users can delete order items"
  ON public.order_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR has_role(auth.uid(), 'gestao'::app_role))
    )
  );

-- Fix order_items INSERT policy: restrict via order ownership
DROP POLICY IF EXISTS "Auth users can insert order items" ON public.order_items;
CREATE POLICY "Auth users can insert order items"
  ON public.order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR has_role(auth.uid(), 'gestao'::app_role))
    )
  );
