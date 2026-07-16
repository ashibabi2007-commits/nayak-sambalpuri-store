'use client';

import { useState } from 'react';
import { MapPin, Phone, Sparkles, Truck, ShieldCheck, CreditCard } from 'lucide-react';
import Header from '@/components/Header';
import SplashScreen from '@/components/SplashScreen';
import ProductGrid from '@/components/ProductGrid';
import VideoShowcase from '@/components/VideoShowcase';
import CartDrawer from '@/components/CartDrawer';

export default function Home() {
  const [cartOpen, setCartOpen] = useState(false);
  return (
    <>
      <SplashScreen />
      <Header onCart={() => setCartOpen(true)} />
      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div>
              <span className="badge"><Sparkles size={16}/> Authentic Sambalpuri Collection</span>
              <h2>Elegant Cotton & Silk Sarees from Sambalpur</h2>
              <p>
                Welcome to Nayak Sambalpuri Bastralaya — Manufacturer Of Sambalpuri cotton and silk saree.
                Browse products, add your favourite sarees to cart, pay using QR code, and confirm your order on WhatsApp.
              </p>
              <div style={{display:'flex', gap:12, flexWrap:'wrap', marginTop:24}}>
                <a className="btn btn-primary" href="#products">Shop Now</a>
                <a className="btn btn-light" href="tel:9337424250"><Phone size={17}/> 9337424250</a>
              </div>
            </div>
            <div className="hero-card">
              <div className="hero-card-content">
                <div>
                  <h3>Nayak Sambalpuri Bastralaya</h3>
                  <p style={{color:'#ffe9c2'}}>Traditional sarees with beautiful Sambalpuri design and quality finishing.</p>
                </div>
                <div>
                  <div className="info-row"><MapPin/> <span>Sindurpank Chowk, Dist-Sambalpur, Odisha</span></div>
                  <div className="info-row"><Phone/> <span>9337424250</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container products" style={{gridTemplateColumns:'repeat(3, minmax(0,1fr))'}}>
            <div className="card card-body"><ShieldCheck color="#781f2d"/><h3>Trusted Store</h3><p className="desc">Direct manufacturer of Sambalpuri cotton and silk sarees.</p></div>
            <div className="card card-body"><CreditCard color="#781f2d"/><h3>QR Payment</h3><p className="desc">Customers can pay with the owner’s QR code and send screenshot.</p></div>
            <div className="card card-body"><Truck color="#781f2d"/><h3>Easy Ordering</h3><p className="desc">Cart order details are sent directly to the store WhatsApp number.</p></div>
          </div>
        </section>

        <VideoShowcase />
        <ProductGrid />
      </main>

      <footer className="footer">
        <div className="container footer-grid">
          <div><h3>Nayak Sambalpuri Bastralaya</h3><p>Manufacturer Of Sambalpuri cotton and silk saree</p></div>
          <div><h3>Contact</h3><p>Phone: <a href="tel:9337424250">9337424250</a></p><p>WhatsApp ordering available</p></div>
          <div><h3>Address</h3><p>Sindurpank Chowk,<br/>Dist-Sambalpur, Odisha</p></div>
        </div>
      </footer>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
