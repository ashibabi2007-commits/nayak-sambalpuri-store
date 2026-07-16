-- Run this once in Supabase SQL Editor if your products table already exists.
-- It adds support for multiple images per product without deleting existing products.

alter table public.products
add column if not exists images text[] default '{}';

update public.products
set images = array[image_url]
where image_url is not null
  and (images is null or array_length(images, 1) is null);
