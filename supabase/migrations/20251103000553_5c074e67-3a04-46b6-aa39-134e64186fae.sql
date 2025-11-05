-- Fix critical security issues: Add explicit DENY policies for anonymous users

-- Block anonymous access to profiles table
CREATE POLICY "Block anonymous access to profiles" 
ON public.profiles 
FOR ALL
TO anon
USING (false);

-- Block anonymous access to orders table  
CREATE POLICY "Block anonymous access to orders" 
ON public.orders 
FOR SELECT
TO anon
USING (false);

-- Block anonymous access to order_items table
CREATE POLICY "Block anonymous access to order_items" 
ON public.order_items 
FOR SELECT
TO anon
USING (false);

-- Block anonymous access to order_status_history table
CREATE POLICY "Block anonymous access to order_status_history" 
ON public.order_status_history 
FOR ALL
TO anon
USING (false);

-- Block anonymous access to user_roles table
CREATE POLICY "Block anonymous access to user_roles" 
ON public.user_roles 
FOR ALL
TO anon
USING (false);