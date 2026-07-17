'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Home, LogOut, Plus, Trash2, Pencil, Save, PackageCheck, RefreshCw } from 'lucide-react';
import { supabase, Product, Order } from '@/lib/supabaseClient';

type ProductForm = {
  name: string;
  description: string;
  price: string;
  category: string;
  stock: string;
  sizes: string;
  images: File[];
};

const emptyForm: ProductForm = { name: '', description: '', price: '', category: 'Saree', stock: '1', sizes: '', images: [] };

export default function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState(process.env.NEXT_PUBLIC_ADMIN_EMAIL || '');
  const [password, setPassword] = useState('');
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderDateFilter, setOrderDateFilter] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{type:'success'|'error'|'alert', text:string} | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => { if (session) { loadProducts(); loadOrders(); } }, [session]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderDate = new Date(order.created_at).toISOString().slice(0, 10);
      const dateOk = !orderDateFilter || orderDate === orderDateFilter;
      const statusOk = orderStatusFilter === 'All' || order.order_status === orderStatusFilter;
      return dateOk && statusOk;
    });
  }, [orders, orderDateFilter, orderStatusFilter]);

  const filteredTotal = useMemo(() => {
    return filteredOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  }, [filteredOrders]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage({type:'error', text:error.message});
    else setMessage({type:'success', text:'Logged in successfully.'});
    setBusy(false);
  }

  async function logout() { await supabase.auth.signOut(); }

  async function loadProducts() {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) setMessage({type:'error', text:error.message});
    else setProducts((data || []) as Product[]);
  }

  async function loadOrders() {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) {
      // Orders table may not exist until migration is run.
      console.warn(error.message);
    } else setOrders((data || []) as Order[]);
  }

  async function updateOrder(id: string, updates: Partial<Order>) {
    setBusy(true);
    const { error } = await supabase.from('orders').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) setMessage({type:'error', text:error.message});
    else { setMessage({type:'success', text:'Order updated.'}); await loadOrders(); }
    setBusy(false);
  }

  async function deleteOrder(id: string) {
    if (!confirm('Delete this order record?')) return;
    setBusy(true);
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) setMessage({type:'error', text:error.message});
    else { setMessage({type:'success', text:'Order deleted.'}); await loadOrders(); }
    setBusy(false);
  }

  async function uploadImage(file: File) {
    const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '-');
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`;
    const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from('product-images').getPublicUrl(path);
    return data.publicUrl;
  }

  async function uploadImages(files: File[]) {
    const urls: string[] = [];
    for (const file of files) {
      urls.push(await uploadImage(file));
    }
    return urls;
  }

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMessage(null);
    try {
      const newImageUrls = form.images.length ? await uploadImages(form.images) : [];
      const currentProduct = editingId ? products.find((p) => p.id === editingId) : null;
      const existingGallery = currentProduct
        ? (Array.isArray(currentProduct.images) && currentProduct.images.length
            ? currentProduct.images
            : currentProduct.image_url
              ? [currentProduct.image_url]
              : [])
        : [];
      const finalGallery = editingId ? [...existingGallery, ...newImageUrls] : newImageUrls;
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        stock: Number(form.stock || 1),
        sizes: form.sizes.split(',').map(s => s.trim()).filter(Boolean),
        images: finalGallery,
        image_url: finalGallery[0] || null,
      };
      if (editingId) {
        const { error } = await supabase.from('products').update(payload).eq('id', editingId);
        if (error) throw error;
        setMessage({type:'success', text:'Product updated successfully.'});
      } else {
        const { error } = await supabase.from('products').insert(payload);
        if (error) throw error;
        setMessage({type:'success', text:'Product added successfully.'});
      }
      setForm(emptyForm); setEditingId(null); await loadProducts();
    } catch (err: any) {
      setMessage({type:'error', text:err.message || 'Something went wrong.'});
    }
    setBusy(false);
  }

  function editProduct(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description || '',
      price: String(product.price),
      category: product.category || 'Saree',
      stock: String(product.stock || 1),
      sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : '',
      images: [],
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function deleteProduct(id: string) {
    if (!confirm('Delete this product permanently?')) return;
    setBusy(true);
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) setMessage({type:'error', text:error.message});
    else { setMessage({type:'success', text:'Product deleted.'}); await loadProducts(); }
    setBusy(false);
  }

  if (!session) {
    return (
      <div className="admin-wrap">
        <div className="admin-card" style={{maxWidth:480, margin:'60px auto'}}>
          <h1>Admin Login</h1>
          <p className="desc">Owner can login and add saree photos, price and description. Data stays saved in Supabase until deleted.</p>
          {message && <div className={message.type}>{message.text}</div>}
          <form onSubmit={login}>
            <label>Email</label><input className="input" value={email} onChange={e => setEmail(e.target.value)} required/><br/><br/>
            <label>Password</label><input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required/><br/><br/>
            <button className="btn btn-primary" disabled={busy}>{busy ? 'Please wait...' : 'Login'}</button>
            <Link className="btn btn-light" href="/" style={{marginLeft:10}}><Home size={16}/> Home</Link>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-wrap">
      <div style={{display:'flex', justifyContent:'space-between', gap:12, alignItems:'center', flexWrap:'wrap'}}>
        <div><h1>Product Admin</h1><p className="desc">Add, update and delete store products.</p></div>
        <div><Link className="btn btn-light" href="/"><Home size={16}/> Home</Link> <button className="btn btn-danger" onClick={logout}><LogOut size={16}/> Logout</button></div>
      </div>
      {message && <div className={message.type}>{message.text}</div>}


      <div className="admin-card">
        <div style={{display:'flex', justifyContent:'space-between', gap:12, alignItems:'center', flexWrap:'wrap'}}>
          <div>
            <h2><PackageCheck size={22}/> Order Records</h2>
            <p className="desc">Track all customer orders, payment status and delivery status.</p>
          </div>
          <button className="btn btn-light" onClick={loadOrders}><RefreshCw size={16}/> Refresh Orders</button>
        </div>
        <div className="form-grid">
          <div>
            <label>Filter by Date</label>
            <input className="input" type="date" value={orderDateFilter} onChange={e => setOrderDateFilter(e.target.value)} />
          </div>
          <div>
            <label>Filter by Status</label>
            <select className="select" value={orderStatusFilter} onChange={e => setOrderStatusFilter(e.target.value)}>
              <option>All</option>
              <option>Order placed</option>
              <option>Payment verified</option>
              <option>Packed</option>
              <option>Shipped</option>
              <option>Delivered</option>
              <option>Cancelled</option>
            </select>
          </div>
        </div>
        <br />
        <div className="alert success">
          <strong>Total Orders:</strong> {orders.length} | <strong>Showing:</strong> {filteredOrders.length} | <strong>Showing Sales:</strong> ₹{filteredTotal.toLocaleString('en-IN')}
        </div>
        {orders.length === 0 ? <p>No order records yet. Orders will appear after customers place order from checkout.</p> : filteredOrders.length === 0 ? <p>No orders found for this date/status filter.</p> : filteredOrders.map((order) => (
          <div className="admin-card order-admin-card" key={order.id}>
            <div className="order-admin-head">
              <div>
                <h3>Order #{order.id.slice(0, 8)}</h3>
                <p className="desc">{new Date(order.created_at).toLocaleString('en-IN')}</p>
                <p><strong>{order.customer_name}</strong> — {order.customer_phone}</p>
                <p>{order.customer_address}</p>
              </div>
              <div>
                <span className="order-status-pill">₹{Number(order.total).toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className="order-items-mini">
              {(order.order_items || []).map((item: any, idx: number) => (
                <div key={idx}>{idx + 1}. {item.name}{item.selected_size ? ` - Size: ${item.selected_size}` : ''} × {item.quantity} — ₹{Number(item.price) * Number(item.quantity)}</div>
              ))}
            </div>
            <div className="form-grid">
              <div>
                <label>Order Status</label>
                <select className="select" value={order.order_status} onChange={e => updateOrder(order.id, { order_status: e.target.value } as any)}>
                  <option>Order placed</option>
                  <option>Payment verified</option>
                  <option>Packed</option>
                  <option>Shipped</option>
                  <option>Delivered</option>
                  <option>Cancelled</option>
                </select>
              </div>
              <div>
                <label>Payment Status</label>
                <select className="select" value={order.payment_status} onChange={e => updateOrder(order.id, { payment_status: e.target.value } as any)}>
                  <option>Payment screenshot pending</option>
                  <option>Payment received</option>
                  <option>Payment failed</option>
                  <option>Refunded</option>
                </select>
              </div>
              <div style={{gridColumn:'1 / -1'}}>
                <label>Admin Delivery Note</label>
                <textarea className="textarea" rows={2} defaultValue={order.admin_note || ''} onBlur={e => updateOrder(order.id, { admin_note: e.target.value } as any)} placeholder="Example: Sent by courier, expected delivery tomorrow" />
              </div>
            </div>
            <br />
            <button className="btn btn-danger" disabled={busy} onClick={() => deleteOrder(order.id)}><Trash2 size={16}/> Delete Order</button>
          </div>
        ))}
      </div>

      <div className="admin-card">
        <h2>{editingId ? 'Edit Product' : 'Add New Product'}</h2>
        <form onSubmit={saveProduct}>
          <div className="form-grid">
            <div><label>Product Name</label><input className="input" value={form.name} onChange={e => setForm({...form, name:e.target.value})} required placeholder="Sambalpuri Silk Saree"/></div>
            <div><label>Price ₹</label><input className="input" type="number" min="0" value={form.price} onChange={e => setForm({...form, price:e.target.value})} required placeholder="2499"/></div>
            <div><label>Category</label><input className="input" value={form.category} onChange={e => setForm({...form, category:e.target.value})} placeholder="Cotton Saree"/></div>
            <div><label>Stock</label><input className="input" type="number" min="0" value={form.stock} onChange={e => setForm({...form, stock:e.target.value})}/></div>
            <div style={{gridColumn:'1 / -1'}}><label>Available Sizes</label><input className="input" value={form.sizes} onChange={e => setForm({...form, sizes:e.target.value})} placeholder="Free Size, S, M, L, XL, 6.3m"/><small className="gallery-count">Write sizes separated by comma. Leave blank if no size selection needed.</small></div>
            <div style={{gridColumn:'1 / -1'}}><label>Description</label><textarea className="textarea" rows={4} value={form.description} onChange={e => setForm({...form, description:e.target.value})} placeholder="Write saree fabric, colour, design, size, etc."/></div>
            <div style={{gridColumn:'1 / -1'}}><label>Photos {editingId ? '(select more photos to add to this product)' : ''}</label><input className="input" type="file" accept="image/*" multiple onChange={e => setForm({...form, images:Array.from(e.target.files || [])})}/><small className="gallery-count">You can select multiple photos at once.</small></div>
          </div>
          <br/>
          <button className="btn btn-primary" disabled={busy}>{editingId ? <Save size={16}/> : <Plus size={16}/>} {busy ? 'Saving...' : editingId ? 'Update Product' : 'Add Product'}</button>
          {editingId && <button type="button" className="btn btn-light" onClick={() => {setEditingId(null); setForm(emptyForm);}} style={{marginLeft:10}}>Cancel Edit</button>}
        </form>
      </div>

      <div className="admin-card">
        <h2>Products</h2>
        <div style={{overflowX:'auto'}}>
          <table className="table">
            <thead><tr><th>Photo</th><th>Name</th><th>Price</th><th>Description</th><th>Actions</th></tr></thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>{p.image_url ? <><img className="admin-img" src={p.image_url} alt={p.name}/><br/><small>{(Array.isArray(p.images) && p.images.length) ? p.images.length : 1} photo(s)</small></> : 'No image'}</td>
                  <td><strong>{p.name}</strong><br/><small>{p.category}</small><br/><small>Sizes: {Array.isArray(p.sizes) && p.sizes.length ? p.sizes.join(', ') : 'Not set'}</small></td>
                  <td>₹{Number(p.price).toLocaleString('en-IN')}</td>
                  <td>{p.description}</td>
                  <td>
                    <button className="btn btn-light" onClick={() => editProduct(p)}><Pencil size={16}/> Edit</button>{' '}
                    <button className="btn btn-danger" onClick={() => deleteProduct(p.id)} disabled={busy}><Trash2 size={16}/> Delete</button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && <tr><td colSpan={5}>No products yet. Add your first saree above.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
