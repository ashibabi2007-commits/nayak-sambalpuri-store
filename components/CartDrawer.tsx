'use client';

import { useEffect, useMemo, useState } from 'react';
import { Minus, Plus, Trash2, X, MapPin, User, Phone } from 'lucide-react';
import { CartItem, cartTotal, getCart, saveCart } from '@/lib/cart';
import { supabase } from '@/lib/supabaseClient';

type Address = {
  name: string;
  phone: string;
  pincode: string;
  city: string;
  state: string;
  house: string;
  road: string;
  landmark: string;
};

const ADDRESS_KEY = 'nayak_sambalpuri_address';
const emptyAddress: Address = { name: '', phone: '', pincode: '', city: '', state: '', house: '', road: '', landmark: '' };

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [address, setAddress] = useState<Address>(emptyAddress);
  const [step, setStep] = useState<'cart' | 'address' | 'payment'>('cart');
  const [orderBusy, setOrderBusy] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const total = useMemo(() => cartTotal(items), [items]);

  useEffect(() => {
    const update = () => setItems(getCart());
    update();
    window.addEventListener('cart-updated', update);
    try {
      const saved = localStorage.getItem(ADDRESS_KEY);
      if (saved) setAddress(JSON.parse(saved));
    } catch {}
    return () => window.removeEventListener('cart-updated', update);
  }, [open]);

  function updateAddress(next: Address) {
    setAddress(next);
    localStorage.setItem(ADDRESS_KEY, JSON.stringify(next));
  }

  function changeQty(id: string, delta: number) {
    const next = items.map(i => i.cart_key === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i);
    setItems(next); saveCart(next);
  }
  function remove(id: string) {
    const next = items.filter(i => i.id !== id);
    setItems(next); saveCart(next);
  }
  function clearCart() { setItems([]); saveCart([]); }

  const fullAddress = `${address.house}, ${address.road}, ${address.landmark ? address.landmark + ', ' : ''}${address.city}, ${address.state} - ${address.pincode}`;

  function orderMessage(orderId?: string) {
    const lines = items.map((i, idx) => `${idx + 1}. ${i.name}${i.selected_size ? ` - Size ${i.selected_size}` : ''} - Qty ${i.quantity} - ₹${Number(i.price) * i.quantity}`).join('\n');
    return `New order from Nayak Sambalpuri Bastralaya website%0AOrder ID: ${orderId || 'Saving...'}%0A%0ACustomer: ${address.name}%0APhone: ${address.phone}%0AAddress: ${fullAddress}%0A%0AItems:%0A${encodeURIComponent(lines)}%0A%0ATotal: ₹${total.toLocaleString('en-IN')}%0A%0APayment: Customer will pay using QR code and send screenshot.`;
  }

  const whatsapp = process.env.NEXT_PUBLIC_SHOP_WHATSAPP || '919337424250';
  const addressComplete = address.name && address.phone && address.pincode && address.city && address.state && address.house && address.road;
  const canOrder = items.length > 0 && addressComplete;


  async function saveOrder(openWhatsappAfterSave = false) {
    if (!canOrder) return;
    setOrderBusy(true);
    try {
      let orderId = createdOrderId;
      if (!orderId) {
        const orderItems = items.map((item) => ({
          id: item.id,
          name: item.name,
          price: Number(item.price),
          quantity: item.quantity,
          image_url: item.image_url,
          selected_size: item.selected_size || null,
        }));

        // Use secure Supabase function instead of direct table insert.
        // This avoids RLS insert errors for public customers.
        const { data, error } = await supabase.rpc('place_order', {
          p_customer_name: address.name,
          p_customer_phone: address.phone,
          p_customer_address: fullAddress,
          p_order_items: orderItems,
          p_total: total,
        });
        if (error) throw error;

        orderId = data as string;
        setCreatedOrderId(orderId);
        setOrderPlaced(true);
        const saved = JSON.parse(localStorage.getItem('nayak_order_ids') || '[]');
        localStorage.setItem('nayak_order_ids', JSON.stringify([orderId, ...saved.filter((x: string) => x !== orderId)].slice(0, 20)));
      } else {
        setOrderPlaced(true);
      }

      if (openWhatsappAfterSave) {
        window.open(`https://wa.me/${whatsapp}?text=${orderMessage(orderId || undefined)}`, '_blank');
      }
    } catch (err: any) {
      alert(err.message || 'Order could not be saved. Please try again.');
    }
    setOrderBusy(false);
  }


  if (!open) return null;
  return (
    <div className="cart-panel">
      <div className="drawer">
        <div className="drawer-head">
          <strong>{step === 'cart' ? 'Shopping Cart' : step === 'address' ? 'Delivery Address' : 'Payment & Order'}</strong>
          <button className="btn btn-light" onClick={onClose}><X size={16}/> Close</button>
        </div>
        <div className="checkout-steps">
          <span className={step === 'cart' ? 'active' : ''}>1 Cart</span>
          <span className={step === 'address' ? 'active' : ''}>2 Address</span>
          <span className={step === 'payment' ? 'active' : ''}>3 Payment</span>
        </div>
        <div className="drawer-body">
          {items.length === 0 ? <p>Your cart is empty.</p> : null}

          {step === 'cart' && items.length > 0 && (
            <>
              {items.map(item => (
                <div className="cart-item" key={item.id}>
                  {item.image_url ? <img src={item.image_url} alt={item.name}/> : <div className="placeholder" style={{width:54,height:60,fontSize:10}}>Saree</div>}
                  <div>
                    <strong>{item.name}</strong><br/>
                    <small>₹{Number(item.price).toLocaleString('en-IN')}</small>{item.selected_size && <><br/><span className="cart-size">Size: {item.selected_size}</span></>}
                    <div className="qty">
                      <button onClick={() => changeQty(item.cart_key, -1)}><Minus size={14}/></button>
                      <span>{item.quantity}</span>
                      <button onClick={() => changeQty(item.cart_key, 1)}><Plus size={14}/></button>
                    </div>
                  </div>
                  <button className="btn btn-light" onClick={() => remove(item.cart_key)}><Trash2 size={16}/></button>
                </div>
              ))}
              <h3>Total: ₹{total.toLocaleString('en-IN')}</h3>
              <button className="btn btn-primary" style={{width:'100%', justifyContent:'center'}} onClick={() => setStep('address')}>Continue to Address</button>
              <button className="btn btn-light" style={{width:'100%', justifyContent:'center', marginTop:10}} onClick={clearCart}>Clear Cart</button>
            </>
          )}

          {step === 'address' && items.length > 0 && (
            <>
              <div className="address-title"><MapPin color="#781f2d"/> <strong>Add Delivery Address</strong></div>
              <div className="address-grid">
                <input className="input" placeholder="Full Name" value={address.name} onChange={e => updateAddress({...address, name:e.target.value})}/>
                <input className="input" placeholder="Mobile Number" value={address.phone} onChange={e => updateAddress({...address, phone:e.target.value})}/>
                <input className="input" placeholder="Pincode" value={address.pincode} onChange={e => updateAddress({...address, pincode:e.target.value})}/>
                <input className="input" placeholder="City / District" value={address.city} onChange={e => updateAddress({...address, city:e.target.value})}/>
                <input className="input" placeholder="State" value={address.state} onChange={e => updateAddress({...address, state:e.target.value})}/>
                <input className="input" placeholder="House No., Building Name" value={address.house} onChange={e => updateAddress({...address, house:e.target.value})}/>
                <input className="input" placeholder="Road name, Area, Colony" value={address.road} onChange={e => updateAddress({...address, road:e.target.value})}/>
                <input className="input" placeholder="Landmark optional" value={address.landmark} onChange={e => updateAddress({...address, landmark:e.target.value})}/>
              </div>
              <div className="address-actions">
                <button className="btn btn-light" onClick={() => setStep('cart')}>Back</button>
                <button className="btn btn-primary" disabled={!addressComplete} style={{opacity: addressComplete ? 1 : .5}} onClick={() => setStep('payment')}>Continue to Payment</button>
              </div>
            </>
          )}

          {step === 'payment' && items.length > 0 && (
            <>
              <div className="order-summary-box">
                <h3>Order Summary</h3>
                <p><User size={15}/> {address.name}</p>
                <p><Phone size={15}/> {address.phone}</p>
                <p><MapPin size={15}/> {fullAddress}</p>
                <strong>Total: ₹{total.toLocaleString('en-IN')}</strong>
              </div>
              <div className="alert">
                Pay using the shop owner's QR code below, then click WhatsApp Order and send payment screenshot on WhatsApp.
              </div>
              <div style={{textAlign:'center', margin:'12px 0'}}>
                <img src="/payment-qr.jpg" alt="Payment QR code" style={{width:190, maxWidth:'100%', borderRadius:18, border:'1px solid #ead8c0'}} />
                <p style={{margin:'8px 0 0', fontWeight:700}}>Scan to Pay</p>
              </div>
              {createdOrderId && <div className="success">Order placed successfully. Order ID: {createdOrderId}</div>}
              <button className="btn btn-primary" disabled={!canOrder || orderBusy || orderPlaced} style={{width:'100%', justifyContent:'center', opacity: canOrder && !orderPlaced ? 1 : .65}} onClick={() => saveOrder(false)}>
                {orderBusy ? 'Saving Order...' : orderPlaced ? 'Order Saved in Admin Panel' : 'Place Order'}
              </button>
              <button className="btn btn-gold" disabled={!canOrder || orderBusy} style={{width:'100%', justifyContent:'center', marginTop:10, opacity: canOrder ? 1 : .5}} onClick={() => saveOrder(true)}>
                Place Order & Send on WhatsApp
              </button>
              <a className="btn btn-light" style={{width:'100%', justifyContent:'center', marginTop:10}} href="/track">
                Track My Order
              </a>
              <button className="btn btn-light" style={{width:'100%', justifyContent:'center', marginTop:10}} onClick={() => setStep('address')}>Back to Address</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
