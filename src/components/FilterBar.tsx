import React from 'react';
import { Search, X, ArrowUpDown, Pin, Link2, CreditCard, FileText, CheckCircle2 } from 'lucide-react';
import { FilterCategory, SortOption } from '../types';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeFilter: FilterCategory;
  onFilterChange: (f: FilterCategory) => void;
  counts: {
    all: number;
    link: number;
    iban: number;
    note: number;
    pinned: number;
  };
  sortOption: SortOption;
  onSortChange: (s: SortOption) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  counts,
  sortOption,
  onSortChange,
}) => {
  const filterTabs: { id: FilterCategory; label: string; count: number; icon?: React.ReactNode }[] = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'link', label: 'Links', count: counts.link, icon: <Link2 className="w-3 h-3 text-cyan-400" /> },
    { id: 'iban', label: 'IBANs', count: counts.iban, icon: <CreditCard className="w-3 h-3 text-emerald-400" /> },
    { id: 'note', label: 'Notes', count: counts.note, icon: <FileText className="w-3 h-3 text-purple-400" /> },
    { id: 'pinned', label: 'Pinned', count: counts.pinned, icon: <Pin className="w-3 h-3 text-amber-400 fill-amber-400/30" /> },
  ];

  return (
    <div className="space-y-3">
      {/* Search Input Row with Sort */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search links, IBANs, tags, notes..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#161b22] border border-zinc-800 text-xs sm:text-sm text-zinc-200 placeholder:text-zinc-500 outline-none focus:border-indigo-500/80 transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-200 rounded-full"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort Selector */}
        <div className="relative shrink-0">
          <select
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="appearance-none bg-[#161b22] border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs font-medium py-2 pl-7 pr-7 rounded-xl outline-none cursor-pointer focus:border-indigo-500 transition"
          >
            <option value="expiring_soon">Expiring Soon</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
          <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Category Filter Pills (Scrollable horizontally on mobile) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onFilterChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all active:scale-95 ${
                isActive
                  ? 'bg-zinc-100 text-zinc-900 font-semibold shadow-sm shadow-white/10'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                  isActive ? 'bg-zinc-800 text-zinc-100' : 'bg-zinc-800/60 text-zinc-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
