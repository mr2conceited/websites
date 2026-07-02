import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const fetchProduct = async () => {
    const { data } = await api.get(`/products/${idOrSlug}`);
    setProduct(data.product);
    setSelectedVariant(data.product.variants[0] || null);
  };

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idOrSlug]);

  if (!product) return <div className="text-center py-20">Loading...</div>;

  const price = product.discountPrice > 0 ? product.discountPrice : product.price;

  const handleAddToCart = async () => {
    if (!user) return navigate('/login');
    if (!selectedVariant) return setMessage('Please select a size');
    try {
      await addItem(product._id, selectedVariant._id, quantity);
      setMessage('Added to cart!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not add to cart');
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/products/${product._id}/reviews`, { rating: reviewRating, comment: reviewComment });
      setReviewComment('');
      fetchProduct();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not submit review');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <div className="aspect-square bg-neutral-100 rounded-lg overflow-hidden mb-4">
            <img src={product.images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded border-2 overflow-hidden ${
                    i === activeImage ? 'border-neutral-900' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm uppercase text-neutral-500">{product.brand}</p>
          <h1 className="text-3xl font-bold mt-1">{product.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-yellow-500">{'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}</span>
            <span className="text-sm text-neutral-500">({product.numReviews} reviews)</span>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-bold">${price.toFixed(2)}</span>
            {product.discountPrice > 0 && (
              <span className="text-neutral-400 line-through">${product.price.toFixed(2)}</span>
            )}
          </div>

          <p className="mt-4 text-neutral-600">{product.description}</p>

          <div className="mt-6">
            <h3 className="font-semibold mb-2 text-sm uppercase">Select Size</h3>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <button
                  key={v._id}
                  disabled={v.stock === 0}
                  onClick={() => setSelectedVariant(v)}
                  className={`px-4 py-2 rounded-md border text-sm font-semibold ${
                    selectedVariant?._id === v._id
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'border-neutral-300 hover:border-neutral-900'
                  } ${v.stock === 0 ? 'opacity-40 cursor-not-allowed line-through' : ''}`}
                >
                  {v.size} {v.color ? `· ${v.color}` : ''}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="input w-20"
            />
            <button onClick={handleAddToCart} className="btn-primary flex-1">
              Add to Cart
            </button>
          </div>
          {message && <p className="mt-3 text-sm text-brand">{message}</p>}
        </div>
      </div>

      <div className="mt-16 max-w-3xl">
        <h2 className="text-xl font-bold mb-4">Reviews ({product.numReviews})</h2>
        <div className="space-y-4">
          {product.reviews.length === 0 && <p className="text-neutral-500">No reviews yet.</p>}
          {product.reviews.map((r, i) => (
            <div key={i} className="card p-4">
              <div className="flex justify-between">
                <span className="font-semibold">{r.name}</span>
                <span className="text-yellow-500 text-sm">{'★'.repeat(r.rating)}</span>
              </div>
              <p className="text-sm text-neutral-600 mt-1">{r.comment}</p>
            </div>
          ))}
        </div>

        {user && (
          <form onSubmit={submitReview} className="mt-6 card p-4 space-y-3">
            <h3 className="font-semibold">Write a Review</h3>
            <select className="input" value={reviewRating} onChange={(e) => setReviewRating(e.target.value)}>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} Stars
                </option>
              ))}
            </select>
            <textarea
              className="input"
              rows="3"
              required
              placeholder="Share your thoughts..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
            />
            <button className="btn-primary">Submit Review</button>
          </form>
        )}
      </div>
    </div>
  );
}
