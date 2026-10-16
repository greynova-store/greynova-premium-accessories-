import React from 'react';
import { Shield, Zap, Headphones, BatteryCharging, Cable, Smartphone, Grid } from 'lucide-react';
import { Category } from '../../types/store';

interface CategoryStripProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Shield,
  Zap,
  Headphones,
  BatteryCharging,
  Cable,
  Smartphone,
};

export function CategoryStrip({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryStripProps) {
  return (
    <div className="py-6 border-b border-neutral-200/60 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Explore Categories
          </span>
          {selectedCategory && (
            <button
              onClick={() => onSelectCategory(null)}
              className="text-xs text-neutral-600 hover:text-neutral-900 font-medium"
            >
              Reset filter
            </button>
          )}
        </div>

        {/* Horizontal scrollable category strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {/* All */}
          <button
            onClick={() => onSelectCategory(null)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-medium transition-all duration-150 whitespace-nowrap shrink-0 border ${
              selectedCategory === null
                ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                : 'bg-neutral-50 text-neutral-700 border-neutral-200/80 hover:bg-neutral-100 hover:border-neutral-300'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>All Gear</span>
          </button>

          {categories.map(cat => {
            const Icon = iconMap[cat.icon_name] || Smartphone;
            const isSelected = selectedCategory === cat.slug;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.slug)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-medium transition-all duration-150 whitespace-nowrap shrink-0 border ${
                  isSelected
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                    : 'bg-neutral-50 text-neutral-700 border-neutral-200/80 hover:bg-neutral-100 hover:border-neutral-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
