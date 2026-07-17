-- Run this in Supabase SQL Editor to add product size options.
-- This will not delete old products.

alter table public.products
add column if not exists sizes text[] default '{}';

-- Optional: existing sarees can stay without sizes.
-- If you want default free size for all old products, uncomment and run:
-- update public.products set sizes = array['Free Size'] where sizes is null or array_length(sizes, 1) is null;
