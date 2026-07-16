# Nayak Sambalpuri Bastralaya - Free Vercel E-commerce Website

A professional cloth store website for **Nayak Sambalpuri Bastralaya**.

## Features

- Professional responsive home page
- Product listing for sarees
- Admin login page
- Owner can add product photo, name, price, category, stock and description
- Owner can edit/delete products
- Products remain saved until the owner deletes them
- Add to cart
- Quantity update and remove cart item
- QR-code payment display
- WhatsApp order confirmation to `9337424250`
- Deployable on Vercel free plan
- Uses Supabase free plan for permanent database and image storage

## Important Free Hosting Note

Vercel's free hosting does **not** provide permanent file/database storage by itself. If products are saved only inside a Vercel project folder, they can be lost after redeploy. Therefore this project uses:

- **Vercel Free** = website hosting
- **Supabase Free** = product database + uploaded product photos

This is the correct fully-free setup for a workable e-commerce catalogue site.

---

## 1. Create Supabase Free Project

1. Go to <https://supabase.com>
2. Create a free account
3. Create a new project
4. Copy:
   - Project URL
   - anon public key

You will need these in Vercel environment variables.

---

## 2. Create Admin User in Supabase

1. Open your Supabase project
2. Go to **Authentication > Users**
3. Click **Add user**
4. Add the shop owner's email and password
5. Remember this email because it must match the SQL policies

Example:

```txt
owner@example.com
```

If you use a different email, replace `owner@example.com` inside `sql/supabase-setup.sql` before running it.

---

## 3. Run Supabase SQL Setup

1. Open Supabase dashboard
2. Go to **SQL Editor**
3. Open this project file:

```txt
sql/supabase-setup.sql
```

4. If needed, replace `owner@example.com` with the real admin email
5. Run the SQL

This creates:

- `products` table
- `product-images` storage bucket
- security policies so only the admin can add/edit/delete

---

## 4. Add Payment QR Code

A placeholder QR is already included at:

```txt
public/payment-qr.svg
```

To use the client's real QR code:

### Option A - easiest
Replace `public/payment-qr.svg` with the real QR image converted/saved as SVG.

### Option B - PNG/JPG
Add the real file to `public/payment-qr.png`, then edit this line in:

```txt
components/CartDrawer.tsx
```

Change:

```tsx
<img src="/payment-qr.svg"
```

to:

```tsx
<img src="/payment-qr.png"
```

---

## 5. Local Development

Install dependencies:

```bash
npm install
```

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Fill values:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SHOP_WHATSAPP=919337424250
NEXT_PUBLIC_ADMIN_EMAIL=owner@example.com
```

Start local server:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

Admin page:

```txt
http://localhost:3000/admin
```

---

## 6. Deploy on Vercel Free

1. Push this project to GitHub
2. Go to <https://vercel.com>
3. Import the GitHub repository
4. Add Environment Variables in Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SHOP_WHATSAPP=919337424250
NEXT_PUBLIC_ADMIN_EMAIL=owner@example.com
```

5. Click **Deploy**

The website will be live for free.

---

## Shop Details Used

```txt
Name: Nayak Sambalpuri Bastralaya
Tagline: Manufacturer Of Sambalpuri cotton and silk saree
Contact: 9337424250
Address: Sindurpank Chowk, Dist-Sambalpur, Odisha
```

---

## How Owner Adds Products

1. Open `/admin`
2. Login with the Supabase admin email/password
3. Add product name, price, description and photo
4. Click **Add Product**
5. The product appears on the website and stays saved permanently in Supabase
6. Owner can edit/delete it anytime

---

## Order Flow

1. Customer adds sarees to cart
2. Customer scans QR code and pays
3. Customer enters name, phone and address
4. Customer clicks **Place Order on WhatsApp**
5. WhatsApp opens with complete order details
6. Customer can send the payment screenshot manually on WhatsApp

