
-- Allow logistica role to INSERT, UPDATE, DELETE on orders
DROP POLICY IF EXISTS "Auth users can insert orders" ON public.orders;
CREATE POLICY "Auth users can insert orders" ON public.orders FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'logistica'::app_role));

DROP POLICY IF EXISTS "Auth users can update orders" ON public.orders;
CREATE POLICY "Auth users can update orders" ON public.orders FOR UPDATE TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'logistica'::app_role))
WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'logistica'::app_role));

DROP POLICY IF EXISTS "Auth users can delete orders" ON public.orders;
CREATE POLICY "Auth users can delete orders" ON public.orders FOR DELETE TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'logistica'::app_role));

-- Allow logistica role on order_items
DROP POLICY IF EXISTS "Auth users can insert order items" ON public.order_items;
CREATE POLICY "Auth users can insert order items" ON public.order_items FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'logistica'::app_role))));

DROP POLICY IF EXISTS "Auth users can update order items" ON public.order_items;
CREATE POLICY "Auth users can update order items" ON public.order_items FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'logistica'::app_role))));

DROP POLICY IF EXISTS "Auth users can delete order items" ON public.order_items;
CREATE POLICY "Auth users can delete order items" ON public.order_items FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'logistica'::app_role))));

-- Allow logistica role on products
DROP POLICY IF EXISTS "Auth users can insert products" ON public.products;
CREATE POLICY "Auth users can insert products" ON public.products FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'logistica'::app_role));

DROP POLICY IF EXISTS "Auth users can update products" ON public.products;
CREATE POLICY "Auth users can update products" ON public.products FOR UPDATE TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'logistica'::app_role))
WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'logistica'::app_role));

DROP POLICY IF EXISTS "Auth users can delete products" ON public.products;
CREATE POLICY "Auth users can delete products" ON public.products FOR DELETE TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'logistica'::app_role));

-- Allow logistica role on stock_movements
DROP POLICY IF EXISTS "Auth users can insert movements" ON public.stock_movements;
CREATE POLICY "Auth users can insert movements" ON public.stock_movements FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'logistica'::app_role));

-- Allow logistica role on leads
DROP POLICY IF EXISTS "Authenticated users can insert leads" ON public.leads;
CREATE POLICY "Authenticated users can insert leads" ON public.leads FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'logistica'::app_role));

DROP POLICY IF EXISTS "Authenticated users can update leads" ON public.leads;
CREATE POLICY "Authenticated users can update leads" ON public.leads FOR UPDATE TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'logistica'::app_role))
WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'logistica'::app_role));

DROP POLICY IF EXISTS "Authenticated users can delete leads" ON public.leads;
CREATE POLICY "Authenticated users can delete leads" ON public.leads FOR DELETE TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'logistica'::app_role));

-- Allow logistica to insert contact history
DROP POLICY IF EXISTS "Authenticated users can insert contact history" ON public.contact_history;
CREATE POLICY "Authenticated users can insert contact history" ON public.contact_history FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'logistica'::app_role));
