import React from 'react';
import { useLoading } from '../../context/LoadingContext';

export function PageTransitionLoader() {
  const { isLoading, loadingMessage } = useLoading();

  if (!isLoading) return null;

  return (
    <div
      className="fixed inset-x-0 top-0 z-50 pointer-events-none transition-opacity duration-200"
      aria-live="polite"
      aria-busy="true"
    >
      {/* Subtle top progress line */}
      <div className="h-1 w-full bg-neutral-200 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-neutral-400 via-neutral-900 to-neutral-500 animate-[shimmer_1.4s_infinite_linear] origin-left w-full" />
      </div>

      {/* Floating minimal GreyNova badge if a long message is set */}
      {loadingMessage && (
        <div className="fixed top-4 right-4 z-50 pointer-events-auto flex items-center gap-2.5 px-3.5 py-2 bg-neutral-900/90 text-white backdrop-blur-md rounded-xl shadow-lg border border-neutral-700 text-xs animate-in fade-in slide-in-from-top-2">
          <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin shrink-0" />
          <span className="font-medium">{loadingMessage}</span>
        </div>
      )}
    </div>
  );
}
