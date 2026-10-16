import React from 'react';

export function ProductSkeleton() {
  return (
    <div className="bg-white border border-neutral-200/80 rounded-2xl overflow-hidden p-3 animate-pulse">
      <div className="w-full aspect-[4/3] bg-neutral-200 rounded-xl mb-3" />
      <div className="h-3 w-1/3 bg-neutral-200 rounded mb-2" />
      <div className="h-4 w-4/5 bg-neutral-200 rounded mb-2" />
      <div className="h-4 w-1/4 bg-neutral-200 rounded" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}
