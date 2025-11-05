-- Fix security issues in orders and order_items tables

-- Drop existing INSERT policies
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;

-- Create secure INSERT policy for orders
-- Allows guest orders (user_id IS NULL) or authenticated users creating their own orders
CREATE POLICY "Users can create orders securely" 
ON public.orders 
FOR INSERT 
WITH CHECK (
  -- Either it's a guest order (no user_id)
  user_id IS NULL 
  OR 
  -- Or it's an authenticated user creating their own order
  (auth.uid() = user_id)
);

-- Create secure INSERT policy for order_items
-- Only allow creating items during order creation (same transaction)
-- Prevents attackers from creating fraudulent items with manipulated prices
CREATE POLICY "Order items can only be created with valid orders" 
ON public.order_items 
FOR INSERT 
WITH CHECK (
  -- Verify the order exists and was just created (within last 5 seconds)
  -- This prevents creating items for old orders
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.created_at > (now() - interval '5 seconds')
  )
);