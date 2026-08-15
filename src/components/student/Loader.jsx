import React from 'react';

/**
 * Loader — full-area loading spinner.
 * Props:
 *   message – optional label below the spinner
 *   size    – 'sm' | 'md' (default 'md')
 */
export default function Loader({ message = 'Loading...', size = 'md' }) {
  const spinSize = size === 'sm' ? 'w-5 h-5 border-2' : 'w-8 h-8 border-[3px]';
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-3">
      <div
        className={`${spinSize} rounded-full border-slate-200 border-t-blue-600 animate-spin`}
      />
      {message && <p className="text-xs text-slate-500 font-medium">{message}</p>}
    </div>
  );
}
