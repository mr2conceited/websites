import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard.jsx';

export default function Home() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api.get('/products?featured=true&limit=8').then(({ data }) => setFeatured(data.products));
  }, []);

  return (
    <div>
      <section className="relative bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-24 md:py-32 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              STEP UP YOUR <span className="text-brand">GAME</span>
            </h1>
            <p className="mt-4 text-neutral-300 max-w-md">
              Discover the latest sneakers, hoodies, and apparel from the brands you love. New drops weekly.
            </p>
            <div className="mt-8 flex gap-4">
              <Link to="/shop/sneakers" className="btn-primary bg-brand hover:bg-brand-dark">
                Shop Sneakers
              </Link>
              <Link to="/shop" className="btn-outline border-white text-white hover:bg-white hover:text-neutral-900">
                Shop All
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=900"
              alt="Featured sneaker"
              className="rounded-lg shadow-2xl"
            />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { label: 'Sneakers', to: '/shop/sneakers', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600' },
            { label: 'Hoodies', to: '/shop/hoodies', img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600' },
            { label: 'Apparel', to: '/shop/apparel', img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600' },
          ].map((c) => (
            <Link key={c.label} to={c.to} className="relative rounded-lg overflow-hidden h-64 group">
              <img src={c.img} alt={c.label} className="w-full h-full object-cover group-hover:scale-105 transition" />
              <div className="absolute inset-0 bg-black/40 flex items-end p-6">
                <span className="text-white text-2xl font-bold uppercase">{c.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <Link to="/shop" className="text-sm font-semibold underline">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {featured.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
