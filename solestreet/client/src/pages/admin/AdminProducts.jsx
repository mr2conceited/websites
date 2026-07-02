import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const emptyForm = {
  name: '',
  brand: '',
  category: 'sneakers',
  gender: 'unisex',
  description: '',
  price: '',
  discountPrice: '',
  images: '',
  variants: [{ size: '', color: '', stock: 0 }],
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchProducts = async () => {
    const { data } = await api.get('/products?limit=100');
    setProducts(data.products);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleVariantChange = (i, field, value) => {
    const variants = [...form.variants];
    variants[i][field] = value;
    setForm({ ...form, variants });
  };

  const addVariant = () => setForm({ ...form, variants: [...form.variants, { size: '', color: '', stock: 0 }] });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      discountPrice: Number(form.discountPrice) || 0,
      images: form.images.split(',').map((s) => s.trim()).filter(Boolean),
      variants: form.variants.map((v) => ({ ...v, stock: Number(v.stock) })),
    };

    if (editingId) {
      await api.put(`/products/${editingId}`, payload);
    } else {
      await api.post('/products', payload);
    }
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    fetchProducts();
  };

  const handleEdit = (p) => {
    setForm({
      name: p.name,
      brand: p.brand,
      category: p.category,
      gender: p.gender,
      description: p.description,
      price: p.price,
      discountPrice: p.discountPrice,
      images: p.images.join(', '),
      variants: p.variants.map((v) => ({ size: v.size, color: v.color, stock: v.stock })),
    });
    setEditingId(p._id);
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    fetchProducts();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex gap-4 mb-8">
        <Link to="/admin" className="font-semibold">
          Overview
        </Link>
        <Link to="/admin/products" className="font-semibold underline">
          Products
        </Link>
        <Link to="/admin/orders" className="font-semibold">
          Orders
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Products</h1>
        <button
          className="btn-primary"
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setForm(emptyForm);
          }}
        >
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 mb-8 space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <input required placeholder="Name" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input required placeholder="Brand" className="input" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="sneakers">Sneakers</option>
              <option value="hoodies">Hoodies</option>
              <option value="apparel">Apparel</option>
            </select>
            <select className="input" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <option value="unisex">Unisex</option>
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="kids">Kids</option>
            </select>
            <input placeholder="Image URLs (comma separated)" className="input" value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} />
          </div>
          <textarea required placeholder="Description" className="input" rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid md:grid-cols-2 gap-3">
            <input required type="number" step="0.01" placeholder="Price" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <input type="number" step="0.01" placeholder="Discount Price (optional)" className="input" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} />
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-2">Variants (Size / Color / Stock)</h3>
            {form.variants.map((v, i) => (
              <div key={i} className="grid grid-cols-3 gap-2 mb-2">
                <input required placeholder="Size" className="input" value={v.size} onChange={(e) => handleVariantChange(i, 'size', e.target.value)} />
                <input placeholder="Color" className="input" value={v.color} onChange={(e) => handleVariantChange(i, 'color', e.target.value)} />
                <input required type="number" placeholder="Stock" className="input" value={v.stock} onChange={(e) => handleVariantChange(i, 'stock', e.target.value)} />
              </div>
            ))}
            <button type="button" onClick={addVariant} className="text-sm font-semibold underline">
              + Add Variant
            </button>
          </div>

          <button className="btn-primary">{editingId ? 'Update Product' : 'Create Product'}</button>
        </form>
      )}

      <div className="space-y-3">
        {products.map((p) => (
          <div key={p._id} className="card p-4 flex items-center gap-4">
            <img src={p.images[0]} alt={p.name} className="w-16 h-16 object-cover rounded-md" />
            <div className="flex-1">
              <p className="font-semibold">{p.name}</p>
              <p className="text-sm text-neutral-500">
                {p.brand} · {p.category} · ${p.price.toFixed(2)} · Stock: {p.totalStock}
              </p>
            </div>
            <button onClick={() => handleEdit(p)} className="text-sm font-semibold underline">
              Edit
            </button>
            <button onClick={() => handleDelete(p._id)} className="text-sm text-red-600 font-semibold underline">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
