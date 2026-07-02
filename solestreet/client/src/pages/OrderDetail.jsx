import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data.order));
  }, [id]);

  if (!order) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-2">Order #{order._id.slice(-8).toUpperCase()}</h1>
      <p className="text-neutral-500 mb-6">Placed on {new Date(order.createdAt).toLocaleString()}</p>

      <div className="card p-6 mb-6">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase bg-neutral-900 text-white">
          {order.status}
        </span>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="font-semibold mb-3">Shipping Address</h2>
        <p>{order.shippingAddress.fullName}</p>
        <p>
          {order.shippingAddress.line1} {order.shippingAddress.line2}
        </p>
        <p>
          {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
        </p>
        <p>{order.shippingAddress.country}</p>
        <p>{order.shippingAddress.phone}</p>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold mb-3">Items</h2>
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm mb-2">
            <span>
              {item.name} ({item.size}) x{item.quantity}
            </span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <hr className="my-3" />
        <div className="flex justify-between text-sm mb-1">
          <span>Subtotal</span>
          <span>${order.itemsPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm mb-1">
          <span>Shipping</span>
          <span>${order.shippingPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm mb-3">
          <span>Tax</span>
          <span>${order.taxPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>${order.totalPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
