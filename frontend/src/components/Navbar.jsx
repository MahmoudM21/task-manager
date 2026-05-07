import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckSquare, LogOut, User, ChevronDown, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen,       setMenuOpen]       = useState(false);
  const [confirmLogout,  setConfirmLogout]  = useState(false);

  // Auto-cancel the "Sure?" prompt after 5 seconds of inactivity
  useEffect(() => {
    if (!confirmLogout) return;
    const t = setTimeout(() => setConfirmLogout(false), 5000);
    return () => clearTimeout(t);
  }, [confirmLogout]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-[0_1px_0_0_rgb(0_0_0/0.04)]">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5 select-none group">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
            <CheckSquare className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-base font-extrabold text-gray-900">TaskFlow</span>
        </Link>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
            aria-expanded={menuOpen}
            aria-haspopup="true"
          >
            <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <span className="text-sm font-semibold text-gray-700 hidden sm:block max-w-[120px] truncate">
              {user?.name}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-150 ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          {menuOpen && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-10" onClick={() => { setMenuOpen(false); setConfirmLogout(false); }} />
              {/* Dropdown */}
              <div className="absolute right-0 mt-1.5 w-52 bg-white border border-gray-100 rounded-2xl shadow-card-lg py-1 z-20 animate-scale-in">
                <div className="px-4 py-2.5 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>

                {confirmLogout ? (
                  /* Inline "Sure?" confirmation pill */
                  <div className="px-4 py-2.5 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-gray-700">Sign out?</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleLogout}
                        aria-label="Confirm sign out"
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                        Yes
                      </button>
                      <button
                        onClick={() => setConfirmLogout(false)}
                        aria-label="Cancel sign out"
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                        No
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmLogout(true)}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
