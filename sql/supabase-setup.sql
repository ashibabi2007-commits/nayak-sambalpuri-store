-- Run this in Supabase SQL Editor after creating your free Supabase project.

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  image_url text,
  images text[] default '{}',
  image_path text,
  category text default 'Saree',
  stock integer default 1,
  sizes text[] default '{}',
  created_at timestamptz default now()
);

alter table public.products enable row level security;

-- Anyone can view products.
drop policy if exists "Public can view products" on public.products;
create policy "Public can view products"
on public.products for select
using (true);

-- Only logged-in admin can manage products.
-- Important: replace owner@example.com with your admin email before running,
-- or run it as-is and use owner@example.com as the Supabase Auth user.
drop policy if exists "Admin can insert products" on public.products;
create policy "Admin can insert products"
on public.products for insert
to authenticated
with check ((auth.jwt() ->> 'email') = 'nayaksambalpuribastralaya26@gmail.com');

drop policy if exists "Admin can update products" on public.products;
create policy "Admin can update products"
on public.products for update
to authenticated
using ((auth.jwt() ->> 'email') = 'nayaksambalpuribastralaya26@gmail.com')
with check ((auth.jwt() ->> 'email') = 'nayaksambalpuribastralaya26@gmail.com');

drop policy if exists "Admin can delete products" on public.products;
create policy "Admin can delete products"
on public.products for delete
to authenticated
using ((auth.jwt() ->> 'email') = 'nayaksambalpuribastralaya26@gmail.com');

-- Create a public bucket named product-images in Supabase Storage first.
-- Storage policies for product image bucket:
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

-- Public image viewing.
drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images"
on storage.objects for select
using (bucket_id = 'product-images');

-- Only logged-in admin can upload/update/delete images.
drop policy if exists "Admin can upload product images" on storage.objects;
create policy "Admin can upload product images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'product-images' and (auth.jwt() ->> 'email') = 'nayaksambalpuribastralaya26@gmail.com');

drop policy if exists "Admin can update product images" on storage.objects;
create policy "Admin can update product images"
on storage.objects for update
to authenticated
using (bucket_id = 'product-images' and (auth.jwt() ->> 'email') = 'nayaksambalpuribastralaya26@gmail.com');

drop policy if exists "Admin can delete product images" on storage.objects;
create policy "Admin can delete product images"
on storage.objects for delete
to authenticated
using (bucket_id = 'product-images' and (auth.jwt() ->> 'email') = 'nayaksambalpuribastralaya26@gmail.com');
