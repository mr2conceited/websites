import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h4 className="text-white font-bold mb-3">SOLESTREET</h4>
          <p className="text-sm">Sneakers, hoodies and apparel for every step of your journey.</p>
        </div>
        <div>
          <h5 className="text-white font-semibold mb-3 text-sm uppercase">Shop</h5>
          <ul className="space-y-2 text-sm">
            <li><Link to="/shop/sneakers">Sneakers</Link></li>
            <li><Link to="/shop/hoodies">Hoodies</Link></li>
            <li><Link to="/shop/apparel">Apparel</Link></li>
          </ul>
        </div>
        <div>
          <h5 className="text-white font-semibold mb-3 text-sm uppercase">Help</h5>
          <ul className="space-y-2 text-sm">
            <li>Shipping & Returns</li>
            <li>Order Tracking</li>
            <li>Contact Us</li>
          </ul>
        </div>
        <div>
          <h5 className="text-white font-semibold mb-3 text-sm uppercase">Company</h5>
          <ul className="space-y-2 text-sm">
            <li>About Us</li>
            <li>Careers</li>
            <li>Sustainability</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-neutral-800 text-center text-xs py-4">
        &copy; {new Date().getFullYear()} SoleStreet. All rights reserved.
      </div>
    </footer>
  );
}
