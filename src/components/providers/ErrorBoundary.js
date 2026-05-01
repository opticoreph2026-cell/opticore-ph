'use client';

import React from 'react';
import { TriangleAlert, RefreshCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-surface-950 border border-white/5 rounded-3xl min-h-[300px] text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-6">
            <TriangleAlert className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Component Error</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-8">
            An unexpected error occurred while rendering this module. We've logged the issue.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              if (this.props.onReset) this.props.onReset();
            }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.03] border border-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-sm font-bold"
          >
            <RefreshCcw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
