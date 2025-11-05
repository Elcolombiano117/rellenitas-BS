-- Drop existing restrictive SELECT policies that are preventing proper access control
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can view their own orders" ON public.orders;

-- Recreate as permissive policies (they will combine with OR logic)
-- This ensures anonymous users cannot access any orders
CREATE POLICY "Admins can view all orders" 
ON public.orders 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view their own orders" 
ON public.orders 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);