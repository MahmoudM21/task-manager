import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <AlertTriangle
          className="w-8 h-8 mb-4"
          style={{ color: 'var(--color-error)' }}
          aria-hidden
        />
        <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
        <p className="text-sm text-gray-500 mb-6 max-w-xs">
          An unexpected error occurred. Refresh the page to try again.
        </p>
        {import.meta.env.DEV && this.state.error && (
          <pre className="text-left text-xs bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 mb-6 max-w-lg w-full overflow-auto">
            {this.state.error.message}
          </pre>
        )}
        <button
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          Refresh page
        </button>
      </div>
    );
  }
}
