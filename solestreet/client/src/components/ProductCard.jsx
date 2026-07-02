import React from 'react';
import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
  const onSale = product.discountPrice > 0;

  return (
    <Link to={`/product/${product.slug}`} className="card overflow-hidden group block">
      <div className="aspect-square overflow-hidden bg-neutral-100">
        <img
          src={product.images?.[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
      </div>
      <div className="p-4">
        <p className="text-xs uppercase text-neutral-500">{product.brand}</p>
        <h3 className="font-semibold text-sm mt-1 line-clamp-2">{product.name}</h3>
        <div className="mt-2 flex items-center gap-2">
          <span className="font-bold">${price.toFixed(2)}</span>
          {onSale && (
            <span className="text-neutral-400 line-through text-sm">${product.price.toFixed(2)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
