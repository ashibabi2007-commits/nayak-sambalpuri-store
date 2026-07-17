'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, PackageCheck, Search, Truck } from 'lucide-react';
import Header from '@/components/Header';
import CartDrawer from '@/components/CartDrawer';
import { Order, supabase } from '@/lib/supabaseClient';

const statuses = ['Order placed', 'Payment verified', 'Packed', 'Shipped', 'Delivered'];

function OrderTimeline({ status }: { status: string }) {
  const current = Math.max(0, statuses.indexOf(status));
  return (
    <div className="track-timeline">
      {statuses.map((s, idx) => (
        <div className={`track-step ${idx <= current ? 'done' : ''}`} key={s}>
          <span className="track-dot" />
          <div><strong>{s}</strong>{idx === current && <small> Current status</small>}</div>
        </div>
      ))}
    </div>
  );
}

export default function TrackOrdersPage() {
  const [cartOpen, setCartOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [orderId, setOrderId] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    try {
      const savedAddress = localStorage.getItem('nayak_sambalpuri_address');
      if (savedAddress) {
        const parsed = JSON.parse(savedAddress);
        if (parsed.phone) setPhone(parsed.phone);
      }
    } catch {}
  }, []);

  async function track(e?: React.FormEvent) {
    e?.preventDefault();
    if (!phone) {
      setMessage('Please enter mobile number used during order.');
      return;
    }
    setLoading(true);
    setMessage('');
    const cleanOrderId = orderId.trim() || null;
    const { data, error } = await supabase.rpc('track_orders', {
      p_phone: phone,
      p_order_id: cleanOrderId,
    });
    if (error) setMessage(error.message);
    else {
      setOrders((data || []) as Order[]);
      if (!data || data.length === 0) setMessage('No orders found for this phone/order ID.');
    }
    setLoading(false);
  }

  return (
    <>
      <Header onCart={() => setCartOpen(true)} />
      <main className="container section">
        <Link href="/" className="back-link"><ArrowLeft size={18}/> Back to shop</Link>
        <div className="section-title">
          <div>
            <span className="badge"><Truck size={16}/> Order Tracking</span>
            <h2>Track Your Orders</h2>
          </div>
        </div>

        <div className="admin-card">
          <form onSubmit={track}>
            <div className="form-grid">
              <div>
                <label>Mobile Number used in order</label>
                <input className="input" placeholder="9337424250" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div>
                <label>Order ID optional</label>
                <input className="input" placeholder="Paste order ID if available" value={orderId} onChange={e => setOrderId(e.target.value)} />
              </div>
            </div>
            <br />
            <button className="btn btn-primary" disabled={loading}><Search size={17}/> {loading ? 'Searching...' : 'Track Order'}</button>
          </form>
          {message && <div className="alert">{message}</div>}
        </div>

        {orders.map((order) => (
          <div className="track-card" key={order.id}>
            <div className="order-admin-head">
              <div>
                <h3>Order #{order.id.slice(0, 8)}</h3>
                <p className="desc">Placed on {new Date(order.created_at).toLocaleString('en-IN')}</p>
              </div>
              <span className="order-status-pill">{order.order_status}</span>
            </div>
            <p><MapPin size={15}/> {order.customer_address}</p>
            <div className="order-items-mini">
              {(order.order_items || []).map((item: any, idx: number) => (
                <div key={idx}>{item.name}{item.selected_size ? ` - Size: ${item.selected_size}` : ''} × {item.quantity} — ₹{Number(item.price) * Number(item.quantity)}</div>
              ))}
            </div>
            <strong>Total: ₹{Number(order.total).toLocaleString('en-IN')}</strong><br />
            <small>Payment: {order.payment_status}</small>
            {order.admin_note && <div className="alert"><PackageCheck size={16}/> {order.admin_note}</div>}
            <OrderTimeline status={order.order_status} />
          </div>
        ))}
      </main>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
