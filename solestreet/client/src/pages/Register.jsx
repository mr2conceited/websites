import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register, googleAuth } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credential) => {
    setError('');
    setLoading(true);
    try {
      await googleAuth(credential);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Google sign-up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(244,114,182,0.2),_transparent_30%),linear-gradient(135deg,_#111827_0%,_#312e81_40%,_#111827_100%)] px-4 py-12 text-white">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-fuchsia-400/20 bg-white/10 p-8 shadow-[0_0_90px_rgba(244,114,182,0.2)] backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-300">New era</p>
          <h1 className="mt-4 text-4xl font-black sm:text-5xl">Build your signature look.</h1>
          <p className="mt-4 max-w-xl text-base text-neutral-300 sm:text-lg">
            Join the movement with a profile that feels as sharp as your next outfit drop.
          </p>
          <div className="mt-8 rounded-2xl border border-fuchsia-400/30 bg-black/20 p-4 text-sm text-neutral-200">
            <p className="font-semibold text-white">Why it feels different</p>
            <p className="mt-2">Curated drops, bold essentials, and quick checkout built for the city.</p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-neutral-200/70 bg-white/90 p-6 shadow-2xl shadow-black/10 backdrop-blur sm:p-8">
          <h2 className="text-3xl font-bold text-neutral-900">Create account</h2>
          <p className="mt-2 text-sm text-neutral-600">Join the cult of clean lines and louder energy.</p>

          <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <GoogleAuthButton onSuccess={handleGoogleSuccess} onError={(err) => setError(err.message || 'Google sign-up failed')} />
          </div>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-neutral-400">
            <div className="h-px flex-1 bg-neutral-300" />
            <span>or sign up with email</span>
            <div className="h-px flex-1 bg-neutral-300" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <input
              required
              placeholder="Full Name"
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              type="email"
              required
              placeholder="Email"
              className="input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Password (min 6 characters)"
              className="input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-600">
            Already part of the crew?{' '}
            <Link to="/login" className="font-semibold text-neutral-900 underline decoration-fuchsia-500 decoration-2 underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
