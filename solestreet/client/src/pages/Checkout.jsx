import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';

export default function Checkout() {
  const { cart, subtotal, refreshCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = Number((subtotal * 0.07).toFixed(2));
  const total = Number((subtotal + shipping + tax).toFixed(2));

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { data } = await api.post('/orders', {
        shippingAddress: form,
        paymentMethod: 'card',
      });
      await refreshCart();
      navigate(`/orders/${data.order._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (!cart.items || cart.items.length === 0) {
    return <div className="text-center py-20">Your cart is empty.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>
      <div className="grid md:grid-cols-3 gap-10">
        <form onSubmit={handleSubmit} className="md:col-span-2 space-y-4">
          <h2 className="font-semibold">Shipping Address</h2>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <input name="fullName" required placeholder="Full Name" className="input" onChange={handleChange} />
          <input name="line1" required placeholder="Address Line 1" className="input" onChange={handleChange} />
          <input name="line2" placeholder="Address Line 2 (optional)" className="input" onChange={handleChange} />
          <div className="grid grid-cols-2 gap-4">
            <input name="city" required placeholder="City" className="input" onChange={handleChange} />
            <input name="state" required placeholder="State / Province" className="input" onChange={handleChange} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input name="postalCode" required placeholder="Postal Code" className="input" onChange={handleChange} />
            <input name="country" required placeholder="Country" className="input" onChange={handleChange} />
          </div>
          <input name="phone" required placeholder="Phone Number" className="input" onChange={handleChange} />

          <button disabled={submitting} className="btn-primary w-full mt-4">
            {submitting ? 'Placing Order...' : `Place Order - $${total.toFixed(2)}`}
          </button>
          <p className="text-xs text-neutral-500">
            This demo checkout simulates payment. Connect Stripe in the backend (server/.env) for real payments.
          </p>
        </form>

        <div className="card p-6 h-fit">
          <h2 className="font-bold mb-4">Order Summary</h2>
          {cart.items.map((item) => (
            <div key={item.variantId} className="flex justify-between text-sm mb-2">
              <span>
                {item.name} ({item.size}) x{item.quantity}
              </span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <hr className="my-3" />
          <div className="flex justify-between text-sm mb-1">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between text-sm mb-3">
            <span>Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
