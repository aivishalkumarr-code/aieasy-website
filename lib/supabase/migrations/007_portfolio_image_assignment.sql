ALTER TABLE public.portfolio_items
ADD COLUMN IF NOT EXISTS image_id uuid REFERENCES public.images(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_portfolio_items_image_id ON public.portfolio_items(image_id);
