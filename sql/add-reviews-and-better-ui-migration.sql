-- Run this in Supabase SQL Editor to add customer reviews with image upload support.
-- This does not delete existing products.

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  customer_name text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text not null,
  image_urls text[] default '{}',
  created_at timestamptz default now()
);

alter table public.reviews enable row level security;

-- Anyone can view reviews.
drop policy if exists "Public can view reviews" on public.reviews;
create policy "Public can view reviews"
on public.reviews for select
using (true);

-- Anyone can submit a review.
-- If you want owner approval later, add an approved column and filter approved=true.
drop policy if exists "Public can submit reviews" on public.reviews;
create policy "Public can submit reviews"
on public.reviews for insert
to anon, authenticated
with check (true);

-- Review image storage bucket.
insert into storage.buckets (id, name, public)
values ('review-images', 'review-images', true)
on conflict (id) do update set public = true;

-- Anyone can view review images.
drop policy if exists "Public can view review images" on storage.objects;
create policy "Public can view review images"
on storage.objects for select
using (bucket_id = 'review-images');

-- Anyone can upload review images.
drop policy if exists "Public can upload review images" on storage.objects;
create policy "Public can upload review images"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'review-images');
