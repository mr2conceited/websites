import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="text-center py-32">
      <h1 className="text-6xl font-extrabold mb-4">404</h1>
      <p className="text-neutral-500 mb-6">Page not found.</p>
      <Link to="/" className="btn-primary">
        Back to Home
      </Link>
    </div>
  );
}
