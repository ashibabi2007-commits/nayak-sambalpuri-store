'use client';

import { useEffect, useMemo, useState } from 'react';
import { Minus, Plus, Trash2, X } from 'lucide-react';
import { CartItem, cartTotal, getCart, saveCart } from '@/lib/cart';

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });

  const total = useMemo(() => cartTotal(items), [items]);

  useEffect(() => {
    const update = () => setItems(getCart());
    update();
    window.addEventListener('cart-updated', update);
    return () => window.removeEventListener('cart-updated', update);
  }, [open]);

  function changeQty(id: string, delta: number) {
    const next = items.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i);
    setItems(next); saveCart(next);
  }
  function remove(id: string) {
    const next = items.filter(i => i.id !== id);
    setItems(next); saveCart(next);
  }
  function clearCart() { setItems([]); saveCart([]); }

  function orderMessage() {
    const lines = items.map((i, idx) => `${idx + 1}. ${i.name} - Qty ${i.quantity} - ₹${Number(i.price) * i.quantity}`).join('\n');
    return `New order from Nayak Sambalpuri Bastralaya website%0A%0ACustomer: ${customer.name}%0APhone: ${customer.phone}%0AAddress: ${customer.address}%0A%0AItems:%0A${encodeURIComponent(lines)}%0A%0ATotal: ₹${total.toLocaleString('en-IN')}%0A%0APayment: Customer will pay using QR code and send screenshot.`;
  }

  const whatsapp = process.env.NEXT_PUBLIC_SHOP_WHATSAPP || '919337424250';
  const canOrder = items.length > 0 && customer.name && customer.phone && customer.address;

  if (!open) return null;
  return (
    <div className="cart-panel">
      <div className="drawer">
        <div className="drawer-head">
          <strong>Your Cart</strong>
          <button className="btn btn-light" onClick={onClose}><X size={16}/> Close</button>
        </div>
        <div className="drawer-body">
          {items.length === 0 ? <p>Your cart is empty.</p> : items.map(item => (
            <div className="cart-item" key={item.id}>
              {item.image_url ? <img src={item.image_url} alt={item.name}/> : <div className="placeholder" style={{width:54,height:60,fontSize:10}}>Saree</div>}
              <div>
                <strong>{item.name}</strong><br/>
                <small>₹{Number(item.price).toLocaleString('en-IN')}</small>
                <div className="qty">
                  <button onClick={() => changeQty(item.id, -1)}><Minus size={14}/></button>
                  <span>{item.quantity}</span>
                  <button onClick={() => changeQty(item.id, 1)}><Plus size={14}/></button>
                </div>
              </div>
              <button className="btn btn-light" onClick={() => remove(item.id)}><Trash2 size={16}/></button>
            </div>
          ))}

          {items.length > 0 && (
            <>
              <h3>Total: ₹{total.toLocaleString('en-IN')}</h3>
              <div className="alert">
                Pay using the shop owner's QR code below, then click WhatsApp Order and send payment screenshot on WhatsApp.
              </div>
              <div style={{textAlign:'center', margin:'12px 0'}}>
                <img src="/payment-qr.svg" alt="Payment QR code" style={{width:190, maxWidth:'100%', borderRadius:18, border:'1px solid #ead8c0'}} />
                <p style={{margin:'8px 0 0', fontWeight:700}}>Scan to Pay</p>
              </div>
              <input className="input" placeholder="Your Name" value={customer.name} onChange={e => setCustomer({...customer, name:e.target.value})}/><br/><br/>
              <input className="input" placeholder="Phone Number" value={customer.phone} onChange={e => setCustomer({...customer, phone:e.target.value})}/><br/><br/>
              <textarea className="textarea" rows={3} placeholder="Delivery Address" value={customer.address} onChange={e => setCustomer({...customer, address:e.target.value})}/><br/><br/>
              <a className={`btn btn-primary ${!canOrder ? 'disabled' : ''}`} style={{width:'100%', justifyContent:'center', opacity: canOrder ? 1 : .5, pointerEvents: canOrder ? 'auto' : 'none'}} href={`https://wa.me/${whatsapp}?text=${orderMessage()}`} target="_blank">
                Place Order on WhatsApp
              </a>
              <button className="btn btn-light" style={{width:'100%', justifyContent:'center', marginTop:10}} onClick={clearCart}>Clear Cart</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
