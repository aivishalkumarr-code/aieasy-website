-- Portfolio Image Assignments Migration
-- Run this after image and portfolio management migrations to assign uploaded Images records to portfolio items

ALTER TABLE public.portfolio_items
ADD COLUMN IF NOT EXISTS image_id UUID REFERENCES public.images(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS portfolio_items_image_id_idx ON public.portfolio_items(image_id);
