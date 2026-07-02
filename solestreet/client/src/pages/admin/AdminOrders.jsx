import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    const { data } = await api.get('/orders');
    setOrders(data.orders);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, status) => {
    await api.put(`/orders/${id}/status`, { status });
    fetchOrders();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex gap-4 mb-8">
        <Link to="/admin" className="font-semibold">
          Overview
        </Link>
        <Link to="/admin/products" className="font-semibold">
          Products
        </Link>
        <Link to="/admin/orders" className="font-semibold underline">
          Orders
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Manage Orders</h1>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">Order ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id} className="border-b">
                <td className="py-2">{o._id.slice(-8).toUpperCase()}</td>
                <td>{o.user?.name}</td>
                <td>${o.totalPrice.toFixed(2)}</td>
                <td>{o.isPaid ? 'Yes' : 'No'}</td>
                <td>
                  <select
                    className="input py-1"
                    value={o.status}
                    onChange={(e) => updateStatus(o._id, e.target.value)}
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
