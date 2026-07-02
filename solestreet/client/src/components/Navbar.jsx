import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const links = [
  { label: 'Home', to: '/' },
  { label: 'Sneakers', to: '/shop/sneakers' },
  { label: 'Hoodies', to: '/shop/hoodies' },
  { label: 'Apparel', to: '/shop/apparel' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/shop?keyword=${encodeURIComponent(query)}`);
    setQuery('');
  };

  return (
    <header className="sticky top-0 z-50 bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-extrabold tracking-tight">
            SOLE<span className="text-brand">STREET</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold uppercase">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="hover:text-brand transition">
                {l.label}
              </Link>
            ))}
            <Link to="/shop" className="hover:text-brand transition">
              All Products
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="hidden lg:block">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="rounded-md px-3 py-1.5 text-sm text-neutral-900 w-56 focus:outline-none"
              />
            </form>

            <Link to="/cart" className="relative">
              <CartIcon />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative group hidden md:block">
                <button className="text-sm font-semibold">{user.name.split(' ')[0]}</button>
                <div className="absolute right-0 mt-2 w-44 bg-white text-neutral-900 rounded-md shadow-lg py-2 hidden group-hover:block">
                  <Link to="/account" className="block px-4 py-2 hover:bg-neutral-100 text-sm">
                    My Account
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="block px-4 py-2 hover:bg-neutral-100 text-sm">
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 hover:bg-neutral-100 text-sm"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="hidden md:block text-sm font-semibold hover:text-brand">
                Sign In
              </Link>
            )}

            <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
              <MenuIcon />
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-neutral-900 border-t border-neutral-700 px-4 py-4 space-y-3">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMenuOpen(false)}
              className="block text-sm font-semibold uppercase"
            >
              {l.label}
            </Link>
          ))}
          <Link to="/shop" onClick={() => setMenuOpen(false)} className="block text-sm font-semibold uppercase">
            All Products
          </Link>
          {user ? (
            <>
              <Link to="/account" onClick={() => setMenuOpen(false)} className="block text-sm">
                My Account
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" onClick={() => setMenuOpen(false)} className="block text-sm">
                  Admin Dashboard
                </Link>
              )}
              <button onClick={logout} className="block text-sm">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)} className="block text-sm">
              Sign In
            </Link>
          )}
        </div>
      )}
    </header>
  );
}

function CartIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}
