import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Account() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get('/orders/mine').then(({ data }) => setOrders(data.orders));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">My Account</h1>
      <div className="card p-6 mb-8">
        <p>
          <span className="font-semibold">Name:</span> {user.name}
        </p>
        <p>
          <span className="font-semibold">Email:</span> {user.email}
        </p>
        <button onClick={logout} className="btn-outline mt-4">
          Logout
        </button>
      </div>

      <h2 className="text-xl font-bold mb-4">Order History</h2>
      {orders.length === 0 ? (
        <p className="text-neutral-500">You haven't placed any orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link to={`/orders/${o._id}`} key={o._id} className="card p-4 flex justify-between items-center block">
              <div>
                <p className="font-semibold">Order #{o._id.slice(-8).toUpperCase()}</p>
                <p className="text-sm text-neutral-500">{new Date(o.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">${o.totalPrice.toFixed(2)}</p>
                <span className="text-xs uppercase font-semibold text-brand">{o.status}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
