'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { supabase, Product } from '@/lib/supabaseClient';
import ProductCard from '@/components/ProductCard';

const demoProducts: Product[] = [
  {
    id: 'demo-1',
    name: 'Sambalpuri Cotton Saree',
    description: 'Traditional handloom-style Sambalpuri saree. Add real products from admin panel.',
    price: 1499,
    image_url: null,
    category: 'Cotton Saree',
    stock: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    name: 'Sambalpuri Silk Saree',
    description: 'Premium silk saree sample listing. Replace with customer photos and details.',
    price: 3499,
    image_url: null,
    category: 'Silk Saree',
    stock: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-3',
    name: 'Traditional Saree Collection',
    description: 'Beautiful saree collection placeholder shown until database products are added.',
    price: 2299,
    image_url: null,
    category: 'Saree',
    stock: 1,
    created_at: new Date().toISOString(),
  },
];

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  async function loadProducts() {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data && data.length) setProducts(data as Product[]);
    else setProducts(demoProducts);
    setLoading(false);
  }

  useEffect(() => { loadProducts(); }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return products;
    return products.filter(p => `${p.name} ${p.description || ''} ${p.category || ''}`.toLowerCase().includes(q));
  }, [products, query]);

  return (
    <section id="products" className="section">
      <div className="container">
        <div className="section-title">
          <div>
            <span className="badge">Shop Collection</span>
            <h2>Latest Sarees</h2>
          </div>
          <div className="searchbar">
            <div style={{position:'relative'}}>
              <Search size={18} style={{position:'absolute', left:14, top:14, color:'#781f2d'}} />
              <input className="input" style={{paddingLeft:42, minWidth:260}} placeholder="Search sarees..." value={query} onChange={e => setQuery(e.target.value)} />
            </div>
          </div>
        </div>

        {loading ? <p>Loading products...</p> : null}
        <div className="products">
          {filtered.map((product) => (
            <ProductCard product={product} key={product.id} />
          ))}
        </div>
      </div>
    </section>
  );
}
