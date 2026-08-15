/**
 * ErrorBoundary — catches unhandled render errors and shows a recovery UI
 * instead of crashing the entire app to a blank screen.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <SomeComponent />
 *   </ErrorBoundary>
 *
 *   <ErrorBoundary fallback={<MyCustomFallback />}>
 *     ...
 *   </ErrorBoundary>
 */

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production you would send this to an error tracking service
    // e.g. Sentry.captureException(error, { extra: info })
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary] Caught unhandled error:', error, info);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center space-y-5">
            <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7 text-rose-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900">Something went wrong</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                An unexpected error occurred while rendering this section.
                {import.meta.env.DEV && this.state.error && (
                  <span className="block mt-2 font-mono text-[10px] text-rose-600 bg-rose-50 border border-rose-100 rounded p-2 text-left break-all">
                    {this.state.error.message}
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#374151] hover:bg-[#1F2937] text-white text-xs font-semibold rounded-lg transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Try again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
              >
                Go to home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
