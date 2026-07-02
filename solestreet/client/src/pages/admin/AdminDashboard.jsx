import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ orders: 0, revenue: 0, products: 0, users: 0 });

  useEffect(() => {
    const load = async () => {
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        api.get('/orders'),
        api.get('/products?limit=1'),
        api.get('/users'),
      ]);
      const revenue = ordersRes.data.orders.reduce((sum, o) => sum + o.totalPrice, 0);
      setStats({
        orders: ordersRes.data.orders.length,
        revenue,
        products: productsRes.data.total,
        users: usersRes.data.users.length,
      });
    };
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="flex gap-4 mb-8">
        <Link to="/admin" className="font-semibold underline">
          Overview
        </Link>
        <Link to="/admin/products" className="font-semibold">
          Products
        </Link>
        <Link to="/admin/orders" className="font-semibold">
          Orders
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard label="Total Orders" value={stats.orders} />
        <StatCard label="Revenue" value={`$${stats.revenue.toFixed(2)}`} />
        <StatCard label="Products" value={stats.products} />
        <StatCard label="Users" value={stats.users} />
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="card p-6">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
