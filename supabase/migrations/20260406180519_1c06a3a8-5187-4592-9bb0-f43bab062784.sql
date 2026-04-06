
DROP POLICY IF EXISTS "Auth users can update orders" ON public.orders;
CREATE POLICY "Auth users can update orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'gestao'::app_role))
WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'gestao'::app_role));
