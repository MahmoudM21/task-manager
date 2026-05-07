import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPinOff } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <MapPinOff
        className="w-8 h-8 mb-4"
        style={{ color: 'var(--color-muted)' }}
        aria-hidden
      />
      <p
        className="font-semibold leading-none mb-4 select-none"
        style={{ fontSize: '72px', color: 'var(--color-muted)' }}
        aria-label="Error 404"
      >
        404
      </p>
      <h1 className="font-bold mb-2" style={{ fontSize: '22px', color: 'var(--brand-950)' }}>
        Page not found
      </h1>
      <p className="text-sm mb-8 max-w-xs" style={{ color: 'var(--color-muted)' }}>
        The page you're looking for doesn't exist or was moved.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-primary"
        >
          Go to Dashboard
        </button>
        <button
          onClick={() => navigate('/')}
          className="btn-secondary"
        >
          Go to homepage
        </button>
      </div>
    </div>
  );
}
