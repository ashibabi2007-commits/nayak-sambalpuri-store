import { createClient } from '@supabase/supabase-js';

// Build-safe fallbacks are used only when environment variables are missing.
// In production, set the real values in Vercel Environment Variables.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


export type Category = {
  id: string;
  name: string;
  description: string | null;
  sort_order: number | null;
  created_at: string;
};

export type Order = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  order_items: any[];
  total: number;
  payment_status: string;
  order_status: string;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
};

export type Review = {
  id: string;
  product_id: string;
  customer_name: string;
  rating: number;
  comment: string;
  image_urls: string[] | null;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  images?: string[] | null;
  category: string | null;
  stock: number | null;
  sizes?: string[] | null;
  created_at: string;
};
