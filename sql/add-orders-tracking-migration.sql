-- Run this in Supabase SQL Editor to add order records and tracking.
-- Replace owner@example.com with your real admin email before running if needed.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text not null,
  customer_address text not null,
  order_items jsonb not null default '[]'::jsonb,
  total numeric(10,2) not null default 0,
  payment_status text not null default 'Payment screenshot pending',
  order_status text not null default 'Order placed',
  admin_note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.orders enable row level security;

-- Customers/public can create orders.
drop policy if exists "Public can create orders" on public.orders;
create policy "Public can create orders"
on public.orders for insert
to anon, authenticated
with check (true);

-- Only admin can directly view all orders.
drop policy if exists "Admin can view all orders" on public.orders;
create policy "Admin can view all orders"
on public.orders for select
to authenticated
using ((auth.jwt() ->> 'email') = 'nayaksambalpuribastralaya26@gmail.com');

-- Only admin can update order status/payment status/notes.
drop policy if exists "Admin can update orders" on public.orders;
create policy "Admin can update orders"
on public.orders for update
to authenticated
using ((auth.jwt() ->> 'email') = 'nayaksambalpuribastralaya26@gmail.com')
with check ((auth.jwt() ->> 'email') = 'nayaksambalpuribastralaya26@gmail.com');

-- Optional: admin can delete wrong/test orders.
drop policy if exists "Admin can delete orders" on public.orders;
create policy "Admin can delete orders"
on public.orders for delete
to authenticated
using ((auth.jwt() ->> 'email') = 'nayaksambalpuribastralaya26@gmail.com');

-- Customers can track only by phone number and optional order id through this safe function.
create or replace function public.track_orders(p_phone text, p_order_id uuid default null)
returns table (
  id uuid,
  customer_name text,
  customer_phone text,
  customer_address text,
  order_items jsonb,
  total numeric,
  payment_status text,
  order_status text,
  admin_note text,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select o.id, o.customer_name, o.customer_phone, o.customer_address, o.order_items,
         o.total, o.payment_status, o.order_status, o.admin_note, o.created_at, o.updated_at
  from public.orders o
  where regexp_replace(o.customer_phone, '[^0-9]', '', 'g') = regexp_replace(p_phone, '[^0-9]', '', 'g')
    and (p_order_id is null or o.id = p_order_id)
  order by o.created_at desc;
$$;

grant execute on function public.track_orders(text, uuid) to anon, authenticated;
