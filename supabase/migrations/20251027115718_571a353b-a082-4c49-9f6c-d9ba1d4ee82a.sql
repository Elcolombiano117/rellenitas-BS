-- Fix critical security vulnerability: Remove public access to orders table
-- This prevents unauthorized access to sensitive customer data

-- Drop the insecure policy that allows public access
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

-- Create secure policy: Only authenticated users can view their own orders
CREATE POLICY "Authenticated users can view their own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Update order_items policy to remove public access
DROP POLICY IF EXISTS "Users can view items from their orders" ON public.order_items;

CREATE POLICY "Authenticated users can view items from their orders"
ON public.order_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

-- The admin policies remain unchanged as they use has_role function
-- Admins can still view all orders through "Admins can view all orders" policy
-- Admins can still view all order items through "Admins can view all order items" policy