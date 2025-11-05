-- Create products table for catalog management
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category TEXT DEFAULT 'galletas',
  is_active BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_city TEXT NOT NULL DEFAULT 'Valledupar',
  delivery_department TEXT NOT NULL DEFAULT 'Cesar',
  payment_method TEXT NOT NULL CHECK (payment_method IN ('efectivo', 'transferencia', 'online')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  order_status TEXT NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'preparing', 'ready', 'in_delivery', 'delivered', 'cancelled')),
  subtotal DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  coupon_code TEXT,
  delivery_zone TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  product_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create coupons table
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_purchase_amount DECIMAL(10,2) DEFAULT 0,
  max_uses INTEGER,
  times_used INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create delivery_zones table
CREATE TABLE public.delivery_zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Valledupar',
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  estimated_time_minutes INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_status_history table for tracking
CREATE TABLE public.order_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  notes TEXT,
  changed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products
CREATE POLICY "Anyone can view active products"
ON public.products FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage products"
ON public.products FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for orders
CREATE POLICY "Users can view their own orders"
ON public.orders FOR SELECT
USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Anyone can create orders"
ON public.orders FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all orders"
ON public.orders FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update orders"
ON public.orders FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for order_items
CREATE POLICY "Users can view items from their orders"
ON public.order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND (orders.user_id = auth.uid() OR auth.uid() IS NULL)
  )
);

CREATE POLICY "Anyone can create order items"
ON public.order_items FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all order items"
ON public.order_items FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for coupons
CREATE POLICY "Anyone can view active coupons"
ON public.coupons FOR SELECT
USING (is_active = true AND (valid_until IS NULL OR valid_until > now()));

CREATE POLICY "Admins can manage coupons"
ON public.coupons FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for delivery_zones
CREATE POLICY "Anyone can view active zones"
ON public.delivery_zones FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage zones"
ON public.delivery_zones FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for order_status_history
CREATE POLICY "Users can view history of their orders"
ON public.order_status_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_status_history.order_id
    AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all history"
ON public.order_status_history FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can create history entries"
ON public.order_status_history FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_order_number ON public.orders(order_number);
CREATE INDEX idx_orders_status ON public.orders(order_status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_status_history_order_id ON public.order_status_history(order_id);

-- Create trigger for updating updated_at
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial products based on current catalog
INSERT INTO public.products (name, description, price, image_url, is_active, stock_quantity) VALUES
('Rellenita de Manjar', 'Deliciosa galleta artesanal rellena de manjar', 2500, '/src/assets/rellenita-manjar.png', true, 100),
('Rellenita de M&M', 'Galleta con trozos de M&M y relleno cremoso', 3000, '/src/assets/rellenita-mm.png', true, 100),
('Rellenita de Oreo', 'Galleta rellena con crema de Oreo', 3000, '/src/assets/rellenita-oreo.png', true, 100),
('Rellenita Sorpresa', 'Nuestra galleta especial con relleno secreto', 3500, '/src/assets/rellenita-sorpresa.png', true, 100);

-- Insert initial delivery zones for Valledupar
INSERT INTO public.delivery_zones (name, city, delivery_fee, estimated_time_minutes) VALUES
('Centro', 'Valledupar', 0, 20),
('Norte', 'Valledupar', 3000, 30),
('Sur', 'Valledupar', 3000, 30),
('Zona Rural', 'Valledupar', 5000, 45);

-- Create a welcome coupon
INSERT INTO public.coupons (code, discount_type, discount_value, min_purchase_amount, max_uses, is_active) VALUES
('BIENVENIDA', 'percentage', 10, 10000, 100, true);