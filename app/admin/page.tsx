'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Home, LogOut, Plus, Trash2, Pencil, Save } from 'lucide-react';
import { supabase, Product } from '@/lib/supabaseClient';

type ProductForm = {
  name: string;
  description: string;
  price: string;
  category: string;
  stock: string;
  images: File[];
};

const emptyForm: ProductForm = { name: '', description: '', price: '', category: 'Saree', stock: '1', images: [] };

export default function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState(process.env.NEXT_PUBLIC_ADMIN_EMAIL || '');
  const [password, setPassword] = useState('');
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{type:'success'|'error'|'alert', text:string} | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => { if (session) loadProducts(); }, [session]);

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
        <h2>{editingId ? 'Edit Product' : 'Add New Product'}</h2>
        <form onSubmit={saveProduct}>
          <div className="form-grid">
            <div><label>Product Name</label><input className="input" value={form.name} onChange={e => setForm({...form, name:e.target.value})} required placeholder="Sambalpuri Silk Saree"/></div>
            <div><label>Price ₹</label><input className="input" type="number" min="0" value={form.price} onChange={e => setForm({...form, price:e.target.value})} required placeholder="2499"/></div>
            <div><label>Category</label><input className="input" value={form.category} onChange={e => setForm({...form, category:e.target.value})} placeholder="Cotton Saree"/></div>
            <div><label>Stock</label><input className="input" type="number" min="0" value={form.stock} onChange={e => setForm({...form, stock:e.target.value})}/></div>
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
                  <td><strong>{p.name}</strong><br/><small>{p.category}</small></td>
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
