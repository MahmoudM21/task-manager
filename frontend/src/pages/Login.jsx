import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { CheckSquare, Eye, EyeOff, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sanitizeFormData } from '../utils/sanitize';

/* ─── Decorative left panel ─────────────────────────────────────── */
const DecorativePanel = () => (
  <div className="hidden lg:flex lg:flex-col lg:w-[45%] xl:w-[40%] bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 relative overflow-hidden">
    {/* Background patterns */}
    <div aria-hidden className="absolute inset-0">
      <div className="absolute top-1/4 -left-16 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
      <div className="absolute bottom-1/4 -right-16 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full" />
    </div>

    <div className="relative flex flex-col justify-between h-full p-10">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center border border-white/20">
          <CheckSquare className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-xl font-extrabold text-white">TaskFlow</span>
      </div>

      {/* Center copy */}
      <div>
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 px-3 py-1.5 rounded-full text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          AI-powered project management
        </div>
        <h2 className="text-3xl font-extrabold text-white leading-tight mb-4">
          Welcome back to<br />your workspace
        </h2>
        <p className="text-indigo-200 text-sm leading-relaxed max-w-xs">
          Pick up right where you left off. Your projects and tasks are waiting for you.
        </p>

        {/* Testimonial */}
        <div className="mt-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5">
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-amber-300 text-sm">★</span>
            ))}
          </div>
          <p className="text-white/90 text-sm leading-relaxed italic">
            "TaskFlow's AI insights cut our planning meetings in half.
            It just tells us what to work on next."
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-400 rounded-full flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">SL</span>
            </div>
            <div>
              <p className="text-white text-xs font-semibold">Sarah L.</p>
              <p className="text-indigo-300 text-[11px]">Product Manager</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <p className="text-indigo-300/70 text-xs">© 2025 TaskFlow. Built for teams.</p>
    </div>
  </div>
);

/* ─── Main ──────────────────────────────────────────────────────── */
export default function Login() {
  const [email,          setEmail]          = useState('');
  const [password,       setPassword]       = useState('');
  const [showPass,       setShowPass]       = useState(false);
  const [error,          setError]          = useState('');
  const [loading,        setLoading]        = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('session_expired') === 'true') {
      setSessionExpired(true);
      localStorage.removeItem('session_expired');
    }
  }, []);

  const { login }    = useAuth();
  const navigate     = useNavigate();
  const location     = useLocation();
  const from         = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const clean = sanitizeFormData({ email, password });
      await login(clean.email, clean.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <DecorativePanel />

      {/* Right: form */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-white">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
              <CheckSquare className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-extrabold text-gray-900">TaskFlow</span>
          </div>

          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Sign in to your account</h1>
          <p className="text-sm text-gray-500 mb-8">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
              Create one free
            </Link>
          </p>

          {/* Session-expired banner */}
          {sessionExpired && (
            <div role="alert" style={{
              background: '#FAEEDA', color: '#633806',
              border: '0.5px solid #EF9F27', borderRadius: '8px',
              padding: '10px 14px', marginBottom: '16px', fontSize: '14px',
            }}>
              Your session expired. Please sign in again.
            </div>
          )}

          {/* Error alert */}
          {error && (
            <div role="alert" className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm animate-scale-in">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-gray-400">
            By signing in you agree to our{' '}
            <span className="text-gray-500 font-medium cursor-pointer hover:underline">Terms</span>
            {' & '}
            <span className="text-gray-500 font-medium cursor-pointer hover:underline">Privacy Policy</span>.
          </p>
        </div>
      </main>
    </div>
  );
}
