import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Pagination — page navigation bar.
 * Props:
 *   currentPage  – 1-based current page number
 *   totalPages   – total number of pages
 *   onPageChange – (page: number) => void
 *   totalItems   – optional total item count for display
 *   pageSize     – optional page size for display
 */
export default function Pagination({ currentPage, totalPages, onPageChange, totalItems, pageSize }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const startItem = totalItems ? (currentPage - 1) * (pageSize ?? 10) + 1 : null;
  const endItem   = totalItems ? Math.min(currentPage * (pageSize ?? 10), totalItems) : null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
      {totalItems != null && (
        <p className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-700">{startItem}–{endItem}</span> of{' '}
          <span className="font-semibold text-slate-700">{totalItems}</span> results
        </p>
      )}

      <div className="flex items-center space-x-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-7 h-7 text-xs font-semibold rounded-md transition-colors ${
              p === currentPage
                ? 'bg-[#374151] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {p}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
