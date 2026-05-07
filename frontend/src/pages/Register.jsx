import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckSquare, Eye, EyeOff, AlertCircle, ArrowRight,
  CheckCircle2, Users, Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sanitizeFormData } from '../utils/sanitize';

/* ─── Field error ─────────────────────────────────────────────── */
const FieldError = ({ msg }) =>
  msg ? (
    <p role="alert" className="flex items-center gap-1.5 text-xs text-red-600 mt-1.5 animate-scale-in">
      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
      {msg}
    </p>
  ) : null;

/* ─── Decorative panel ─────────────────────────────────────────── */
const DecorativePanel = () => (
  <div className="hidden lg:flex lg:flex-col lg:w-[45%] xl:w-[40%] bg-gradient-to-br from-violet-600 via-indigo-700 to-indigo-800 relative overflow-hidden">
    <div aria-hidden className="absolute inset-0">
      <div className="absolute top-1/3 -left-20 w-72 h-72 bg-white/5 rounded-full blur-2xl" />
      <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-violet-400/20 rounded-full blur-3xl" />
    </div>

    <div className="relative flex flex-col justify-between h-full p-10">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center border border-white/20">
          <CheckSquare className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-xl font-extrabold text-white">TaskFlow</span>
      </div>

      <div>
        <h2 className="text-3xl font-extrabold text-white leading-tight mb-4">
          Everything you need<br />to ship faster
        </h2>
        <p className="text-indigo-200 text-sm leading-relaxed max-w-xs mb-8">
          Join thousands of teams who replaced messy spreadsheets with TaskFlow.
        </p>

        {/* Feature list */}
        <div className="space-y-3">
          {[
            { icon: CheckCircle2, text: 'Unlimited projects & tasks' },
            { icon: Zap,          text: 'Claude AI insights included' },
            { icon: Users,        text: 'Invite your team for free'   },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="w-7 h-7 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0 border border-white/20">
                <Icon className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-white/90 text-sm font-medium">{text}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-indigo-300/70 text-xs">© 2025 TaskFlow. Free forever for individuals.</p>
    </div>
  </div>
);

/* ─── Validation ───────────────────────────────────────────────── */
const validate = ({ name, email, password, confirm }) => {
  const errs = {};
  if (!name.trim())          errs.name     = 'Full name is required.';
  if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email address.';
  if (password.length < 8)   errs.password = 'Password must be at least 8 characters.';
  if (password !== confirm)  errs.confirm  = 'Passwords do not match.';
  return errs;
};

/* ─── Main ──────────────────────────────────────────────────────── */
export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errs, setErrs] = useState({});
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState('');
  const [loading,     setLoading]     = useState(false);

  const { register } = useAuth();
  const navigate     = useNavigate();

  const set = (key) => (e) => {
    setForm(f => ({ ...f, [key]: e.target.value }));
    if (errs[key]) setErrs(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const fieldErrs = validate(form);
    if (Object.keys(fieldErrs).length) { setErrs(fieldErrs); return; }

    setLoading(true);
    try {
      const clean = sanitizeFormData({ name: form.name, email: form.email });
      await register(clean.name, clean.email, form.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <DecorativePanel />

      <main className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-white overflow-y-auto">
        <div className="w-full max-w-md animate-fade-in py-4">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
              <CheckSquare className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-extrabold text-gray-900">TaskFlow</span>
          </div>

          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Create your account</h1>
          <p className="text-sm text-gray-500 mb-8">
            Already have one?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
              Sign in instead
            </Link>
          </p>

          {/* Server error */}
          {serverError && (
            <div role="alert" className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm animate-scale-in">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Full name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Full name <span className="text-red-500" aria-hidden>*</span>
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                required
                value={form.name}
                onChange={set('name')}
                placeholder="Jane Smith"
                className={`input-field ${errs.name ? 'input-error' : ''}`}
              />
              <FieldError msg={errs.name} />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email address <span className="text-red-500" aria-hidden>*</span>
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={set('email')}
                placeholder="you@example.com"
                className={`input-field ${errs.email ? 'input-error' : ''}`}
              />
              <FieldError msg={errs.email} />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password <span className="text-red-500" aria-hidden>*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Min. 8 characters"
                  className={`input-field pr-11 ${errs.password ? 'input-error' : ''}`}
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
              <FieldError msg={errs.password} />
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="confirm" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Confirm password <span className="text-red-500" aria-hidden>*</span>
              </label>
              <div className="relative">
                <input
                  id="confirm"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={form.confirm}
                  onChange={set('confirm')}
                  placeholder="Repeat your password"
                  className={`input-field pr-11 ${errs.confirm ? 'input-error' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <FieldError msg={errs.confirm} />
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
                  Creating account…
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400">
            By signing up you agree to our{' '}
            <span className="text-gray-500 font-medium cursor-pointer hover:underline">Terms</span>
            {' & '}
            <span className="text-gray-500 font-medium cursor-pointer hover:underline">Privacy Policy</span>.
          </p>
        </div>
      </main>
    </div>
  );
}
