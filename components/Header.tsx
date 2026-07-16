'use client';

import Link from 'next/link';
import { ShoppingBag, Phone, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getCart } from '@/lib/cart';

export default function Header({ onCart }: { onCart?: () => void }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const update = () => setCount(getCart().reduce((s, i) => s + i.quantity, 0));
    update();
    window.addEventListener('cart-updated', update);
    return () => window.removeEventListener('cart-updated', update);
  }, []);
  return (
    <header className="header">
      <div className="container nav">
        <Link href="/" className="brand">
          <div className="logo">NSB</div>
          <div>
            <h1>Nayak Sambalpuri Bastralaya</h1>
            <p>Manufacturer Of Sambalpuri cotton and silk saree</p>
          </div>
        </Link>
        <nav className="navlinks">
          <a className="btn btn-light" href="tel:9337424250"><Phone size={17}/> Call</a>
          <button className="btn btn-primary" onClick={onCart}><ShoppingBag size={17}/> Cart {count ? `(${count})` : ''}</button>
          <Link className="btn btn-gold" href="/admin"><Settings size={17}/> Admin</Link>
        </nav>
      </div>
    </header>
  );
}
