'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle, Heart, Phone, ShoppingCart, Star, Truck } from 'lucide-react';
import Header from '@/components/Header';
import CartDrawer from '@/components/CartDrawer';
import { addToCart } from '@/lib/cart';
import { Product, Review, supabase } from '@/lib/supabaseClient';

function Stars({ rating }: { rating: number }) {
  return (
    <span className="stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={18} fill={n <= rating ? '#f5a623' : 'transparent'} color={n <= rating ? '#f5a623' : '#bbb'} />
      ))}
    </span>
  );
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selected, setSelected] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ customer_name: '', rating: 5, comment: '', images: [] as File[] });
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const gallery = useMemo(() => {
    if (!product) return [];
    const arr = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
    if (arr.length) return arr;
    return product.image_url ? [product.image_url] : [];
  }, [product]);

  const sizes = Array.isArray(product?.sizes) ? product.sizes.filter(Boolean) : [];

  useEffect(() => {
    if (sizes.length && !selectedSize) setSelectedSize(sizes[0]);
  }, [product?.id, sizes.length]);

  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length
    : 0;

  async function loadProduct() {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*').eq('id', params.id).single();
    if (!error && data) setProduct(data as Product);
    setLoading(false);
  }

  async function loadReviews() {
    const { data } = await supabase.from('reviews').select('*').eq('product_id', params.id).order('created_at', { ascending: false });
    setReviews((data || []) as Review[]);
  }

  useEffect(() => {
    if (params.id) {
      loadProduct();
      loadReviews();
    }
  }, [params.id]);

  async function uploadReviewImages(files: File[]) {
    const urls: string[] = [];
    for (const file of files) {
      const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '-');
      const path = `${params.id}/${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`;
      const { error } = await supabase.storage.from('review-images').upload(path, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from('review-images').getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    return urls;
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!product) return;
    setBusy(true);
    setMessage('');
    try {
      const image_urls = reviewForm.images.length ? await uploadReviewImages(reviewForm.images) : [];
      const { error } = await supabase.from('reviews').insert({
        product_id: product.id,
        customer_name: reviewForm.customer_name,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        image_urls,
      });
      if (error) throw error;
      setReviewForm({ customer_name: '', rating: 5, comment: '', images: [] });
      setMessage('Thank you! Your review has been added.');
      await loadReviews();
    } catch (err: any) {
      setMessage(err.message || 'Review could not be submitted.');
    }
    setBusy(false);
  }

  if (loading) {
    return <><Header onCart={() => setCartOpen(true)} /><div className="container section"><p>Loading product...</p></div></>;
  }

  if (!product) {
    return <><Header onCart={() => setCartOpen(true)} /><div className="container section"><h2>Product not found</h2><Link className="btn btn-primary" href="/">Go Home</Link></div></>;
  }

  return (
    <>
      <Header onCart={() => setCartOpen(true)} />
      <main className="product-detail-page">
        <div className="container section">
          <Link href="/" className="back-link"><ArrowLeft size={18}/> Back to shop</Link>

          <div className="detail-grid">
            <div className="gallery-box">
              {gallery.length ? (
                <img className="detail-main-img" src={gallery[selected] || gallery[0]} alt={product.name} />
              ) : (
                <div className="placeholder detail-main-img">Sambalpuri Saree</div>
              )}
              {gallery.length > 1 && (
                <div className="detail-thumbs">
                  {gallery.map((img, idx) => (
                    <button key={img + idx} className={`detail-thumb ${selected === idx ? 'active' : ''}`} onClick={() => setSelected(idx)}>
                      <img src={img} alt={`${product.name} ${idx + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="detail-info">
              <span className="badge">{product.category || 'Saree'}</span>
              <h1>{product.name}</h1>
              <div className="rating-line">
                <Stars rating={Math.round(avgRating || 0)} />
                <span>{reviews.length ? `${avgRating.toFixed(1)} out of 5` : 'No reviews yet'}</span>
                <span>({reviews.length} reviews)</span>
              </div>
              <div className="detail-price">₹{Number(product.price).toLocaleString('en-IN')}</div>
              <p className="detail-desc">{product.description}</p>

              {sizes.length > 0 && (
                <div>
                  <label>Select Size</label>
                  <div className="size-pill-row">
                    {sizes.map(size => (
                      <button key={size} className={`size-pill ${selectedSize === size ? 'active' : ''}`} onClick={() => setSelectedSize(size)}>{size}</button>
                    ))}
                  </div>
                </div>
              )}

              <div className="service-box">
                <div><Truck color="#781f2d"/><strong>Delivery order on WhatsApp</strong><small>Customer address is collected during checkout.</small></div>
                <div><CheckCircle color="#781f2d"/><strong>Authentic Sambalpuri Collection</strong><small>Direct from Nayak Sambalpuri Bastralaya.</small></div>
                <div><Phone color="#781f2d"/><strong>Call Support</strong><small>9337424250</small></div>
              </div>

              <div className="detail-actions">
                <button className="btn btn-primary" onClick={() => addToCart(product, selectedSize || null)}><ShoppingCart size={18}/> Add to Cart</button>
                <button className="btn btn-gold" onClick={() => { addToCart(product, selectedSize || null); setCartOpen(true); }}><Heart size={18}/> Buy Now</button>
              </div>
            </div>
          </div>

          <section className="reviews-section">
            <div className="section-title">
              <div>
                <span className="badge">Customer Reviews</span>
                <h2>Ratings & Reviews</h2>
              </div>
            </div>

            <div className="reviews-grid">
              <div className="admin-card">
                <h3>Write a Review</h3>
                {message && <div className={message.includes('Thank') ? 'success' : 'error'}>{message}</div>}
                <form onSubmit={submitReview}>
                  <label>Your Name</label>
                  <input className="input" value={reviewForm.customer_name} onChange={e => setReviewForm({...reviewForm, customer_name:e.target.value})} required />
                  <br/><br/>
                  <label>Rating</label>
                  <select className="select" value={reviewForm.rating} onChange={e => setReviewForm({...reviewForm, rating:Number(e.target.value)})}>
                    <option value={5}>5 Stars - Excellent</option>
                    <option value={4}>4 Stars - Very Good</option>
                    <option value={3}>3 Stars - Good</option>
                    <option value={2}>2 Stars - Average</option>
                    <option value={1}>1 Star - Poor</option>
                  </select>
                  <br/><br/>
                  <label>Your Review</label>
                  <textarea className="textarea" rows={4} value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment:e.target.value})} required placeholder="Write about fabric, colour, quality, delivery, etc." />
                  <br/><br/>
                  <label>Upload Review Images</label>
                  <input className="input" type="file" accept="image/*" multiple onChange={e => setReviewForm({...reviewForm, images:Array.from(e.target.files || [])})} />
                  <br/><br/>
                  <button className="btn btn-primary" disabled={busy}>{busy ? 'Submitting...' : 'Submit Review'}</button>
                </form>
              </div>

              <div>
                {reviews.length === 0 ? <div className="admin-card"><p>No reviews yet. Be the first to review this saree.</p></div> : reviews.map((review) => (
                  <div className="review-card" key={review.id}>
                    <div className="review-head">
                      <strong>{review.customer_name}</strong>
                      <Stars rating={review.rating} />
                    </div>
                    <p>{review.comment}</p>
                    {Array.isArray(review.image_urls) && review.image_urls.length > 0 && (
                      <div className="review-images">
                        {review.image_urls.map((img, idx) => <img src={img} alt={`Review image ${idx + 1}`} key={img + idx} />)}
                      </div>
                    )}
                    <small>{new Date(review.created_at).toLocaleDateString('en-IN')}</small>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
