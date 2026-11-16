import React from 'react';
import { Layers, Sparkles, Plus, SearchX, Inbox } from 'lucide-react';
import { DropItem, FilterCategory } from '../types';
import { DropCard } from './DropCard';

interface DropFeedProps {
  items: DropItem[];
  activeFilter: FilterCategory;
  searchQuery: string;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenQR: (title: string, content: string) => void;
  onResetFilters: () => void;
  onFocusInput: () => void;
  now: number;
}

export const DropFeed: React.FC<DropFeedProps> = ({
  items,
  activeFilter,
  searchQuery,
  onTogglePin,
  onDelete,
  onOpenQR,
  onResetFilters,
  onFocusInput,
  now,
}) => {
  // Empty state handling
  if (items.length === 0) {
    if (searchQuery) {
      return (
        <div className="flex flex-col items-center justify-center p-8 py-14 text-center rounded-2xl bg-[#161b22]/50 border border-zinc-800/80 my-4">
          <div className="p-3 rounded-2xl bg-zinc-800/60 text-zinc-400 mb-3">
            <SearchX className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-zinc-200">No matching drops</h4>
          <p className="text-xs text-zinc-500 max-w-xs mt-1">
            Couldn&apos;t find anything matching &quot;{searchQuery}&quot;.
          </p>
          <button
            onClick={onResetFilters}
            className="mt-4 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300 transition active:scale-95"
          >
            Clear Search
          </button>
        </div>
      );
    }

    if (activeFilter !== 'all') {
      return (
        <div className="flex flex-col items-center justify-center p-8 py-14 text-center rounded-2xl bg-[#161b22]/50 border border-zinc-800/80 my-4">
          <div className="p-3 rounded-2xl bg-zinc-800/60 text-zinc-400 mb-3">
            <Inbox className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-zinc-200 capitalize">No {activeFilter} drops yet</h4>
          <p className="text-xs text-zinc-500 max-w-xs mt-1">
            {activeFilter === 'pinned'
              ? 'Pin any drop using the pin icon to prevent it from ever auto-expiring.'
              : `Drop an item above or paste to start saving ${activeFilter} items.`}
          </p>
          <button
            onClick={onResetFilters}
            className="mt-4 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition active:scale-95 shadow-md shadow-indigo-600/20"
          >
            View All Drops
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center p-8 py-16 text-center rounded-2xl bg-[#161b22]/50 border border-dashed border-zinc-800 my-4">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 text-indigo-400 border border-indigo-500/20 mb-3 shadow-lg shadow-indigo-500/5">
          <Layers className="w-7 h-7 text-cyan-400" />
        </div>
        <h4 className="text-base font-bold text-white">Your Shelf is Empty</h4>
        <p className="text-xs text-zinc-400 max-w-sm mt-1.5 leading-relaxed">
          Drop temporary links, IBANs, or notes here. They will auto-purge when their time is up, keeping your device clutter-free!
        </p>
        <button
          onClick={onFocusInput}
          className="mt-5 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Drop Something Now
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3.5 pt-1">
      {items.map((item) => (
        <DropCard
          key={item.id}
          item={item}
          onTogglePin={onTogglePin}
          onDelete={onDelete}
          onOpenQR={onOpenQR}
          now={now}
        />
      ))}
    </div>
  );
};
