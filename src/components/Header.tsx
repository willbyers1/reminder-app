import React from 'react';
import { Layers, SlidersHorizontal, WifiOff } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface HeaderProps {
  activeCount: number;
  onOpenStats: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeCount, onOpenStats }) => {
  const isOnline = useOnlineStatus();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[#0d1117]/85 border-b border-zinc-800/80 transition-colors">
      <div className="max-w-3xl mx-auto px-4 h-15 flex items-center justify-between gap-3">
        {/* Brand & Badge */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-600 p-[1px] shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-[#0d1117] rounded-[11px] flex items-center justify-center">
              <Layers className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                QuickDrop
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700/60 shadow-sm">
                {activeCount}
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 -mt-0.5 hidden xs:block font-medium">Smart Ephemeral Shelf</p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Offline Pill if network drops */}
          {!isOnline && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium animate-pulse">
              <WifiOff className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Offline</span>
            </div>
          )}

          {/* PWA Install */}
          <PWAInstallButton />

          {/* Shelf Stats / Settings */}
          <button
            onClick={onOpenStats}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-transparent hover:border-zinc-700/60 transition active:scale-95"
            title="Shelf Settings & Auto-Cleanup Stats"
            aria-label="Settings and Stats"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
