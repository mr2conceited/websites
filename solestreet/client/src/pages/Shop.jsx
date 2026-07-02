import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard.jsx';

export default function Shop() {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState([]);
  const [sort, setSort] = useState('newest');
  const [brandFilter, setBrandFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');

  const keyword = searchParams.get('keyword') || '';

  useEffect(() => {
    api.get('/products/meta/filters').then(({ data }) => setBrands(data.brands));
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = { page, limit: 12, sort };
    if (category) params.category = category;
    if (keyword) params.keyword = keyword;
    if (brandFilter) params.brand = brandFilter;
    if (genderFilter) params.gender = genderFilter;

    const { data } = await api.get('/products', { params });
    setProducts(data.products);
    setPages(data.pages);
    setLoading(false);
  }, [category, keyword, sort, brandFilter, genderFilter, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setPage(1);
  }, [category, keyword, sort, brandFilter, genderFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold capitalize mb-2">{category || 'All Products'}</h1>
      {keyword && <p className="text-neutral-500 mb-6">Search results for "{keyword}"</p>}

      <div className="grid md:grid-cols-4 gap-8">
        <aside className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2 text-sm uppercase">Sort By</h3>
            <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-sm uppercase">Brand</h3>
            <select className="input" value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}>
              <option value="">All Brands</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-sm uppercase">Gender</h3>
            <select className="input" value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
              <option value="">All</option>
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="kids">Kids</option>
              <option value="unisex">Unisex</option>
            </select>
          </div>
        </aside>

        <div className="md:col-span-3">
          {loading ? (
            <p>Loading...</p>
          ) : products.length === 0 ? (
            <p className="text-neutral-500">No products found.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
              {pages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-md text-sm font-semibold ${
                        p === page ? 'bg-neutral-900 text-white' : 'bg-neutral-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
