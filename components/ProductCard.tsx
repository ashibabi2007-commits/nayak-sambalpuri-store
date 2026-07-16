'use client';

import { useMemo, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import type { Product } from '@/lib/supabaseClient';
import { addToCart } from '@/lib/cart';

export default function ProductCard({ product }: { product: Product }) {
  const gallery = useMemo(() => {
    const arr = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
    if (arr.length) return arr;
    return product.image_url ? [product.image_url] : [];
  }, [product]);

  const [selected, setSelected] = useState(0);
  const mainImage = gallery[selected] || gallery[0];

  return (
    <article className="card">
      {mainImage ? (
        <img className="product-img" src={mainImage} alt={product.name} />
      ) : (
        <div className="placeholder">Sambalpuri Saree</div>
      )}

      {gallery.length > 1 && (
        <div className="thumb-row">
          {gallery.slice(0, 6).map((img, idx) => (
            <button
              key={`${img}-${idx}`}
              className={`thumb-btn ${idx === selected ? 'active' : ''}`}
              onClick={() => setSelected(idx)}
              aria-label={`View image ${idx + 1}`}
            >
              <img src={img} alt={`${product.name} ${idx + 1}`} />
            </button>
          ))}
          {gallery.length > 6 && <span className="more-images">+{gallery.length - 6}</span>}
        </div>
      )}

      <div className="card-body">
        <h3>{product.name}</h3>
        <p className="desc">{product.description}</p>
        <div className="price">₹{Number(product.price).toLocaleString('en-IN')}</div>
        <button className="btn btn-primary" style={{width:'100%', justifyContent:'center'}} onClick={() => addToCart(product)}>
          <ShoppingCart size={17}/> Add to Cart
        </button>
      </div>
    </article>
  );
}
