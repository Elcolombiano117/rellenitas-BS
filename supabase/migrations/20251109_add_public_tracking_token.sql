-- Migration: Añadir columna public_tracking_token a la tabla orders
-- Fecha: 2025-11-09

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS public_tracking_token TEXT;

-- Opcional: crear índice para búsquedas por token
CREATE INDEX IF NOT EXISTS idx_orders_public_tracking_token ON public.orders (public_tracking_token);
