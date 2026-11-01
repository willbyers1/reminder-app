import React, { useState } from 'react';
import {
  Copy,
  Check,
  Share2,
  Trash2,
  Pin,
  ExternalLink,
  CreditCard,
  Link2,
  FileText,
  Clock,
  QrCode,
  Shield,
  CheckCircle,
} from 'lucide-react';
import { DropItem } from '../types';
import { formatTimeRemaining } from '../utils/detector';
import { useToast } from './Toast';

interface DropCardProps {
  item: DropItem;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenQR: (title: string, content: string) => void;
  now: number;
}

export const DropCard: React.FC<DropCardProps> = ({
  item,
  onTogglePin,
  onDelete,
  onOpenQR,
  now,
}) => {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const timeStatus = formatTimeRemaining(item.expiresAt, item.isPinned, now);

  const handleCopy = async (textToCopy?: string, label: string = 'Copied to clipboard') => {
    const text = textToCopy || (item.category === 'iban' && item.meta?.rawIban ? item.meta.rawIban : item.content);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast(label, 'success');

      if ('vibrate' in navigator) {
        try {
          navigator.vibrate(20);
        } catch {
          // ignore
        }
      }

      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Could not copy to clipboard', 'error');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: item.meta?.title || 'QuickDrop Item',
      text: item.content,
      url: item.category === 'link' ? item.content : undefined,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err: unknown) {
        if ((err as Error)?.name !== 'AbortError') {
          handleCopy(item.content, 'Shared text copied to clipboard');
        }
      }
    } else {
      // Fallback
      handleCopy(item.content, 'Web share unavailable — copied to clipboard');
    }
  };

  const handleDeleteWithEffect = () => {
    setIsDeleting(true);
    setTimeout(() => {
      onDelete(item.id);
    }, 150);
  };

  // Distinct category styling
  const isIban = item.category === 'iban';
  const isLink = item.category === 'link';
  const isNote = item.category === 'note';

  return (
    <article
      className={`group relative rounded-2xl bg-[#161b22] border transition-all duration-200 overflow-hidden shadow-lg ${
        item.isPinned
          ? 'border-amber-500/40 shadow-amber-500/5 bg-gradient-to-b from-[#1b1e25] to-[#161b22]'
          : 'border-zinc-800/90 hover:border-zinc-700/80 hover:shadow-xl'
      } ${isDeleting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
    >
      {/* Top Card Bar: Category Badge + Expiration Timer + Pin */}
      <div className="flex items-center justify-between gap-2 px-4 pt-3.5 pb-2 border-b border-zinc-800/60">
        {/* Category Pill */}
        <div className="flex items-center gap-2">
          {isIban && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CreditCard className="w-3.5 h-3.5" />
              <span>IBAN</span>
            </span>
          )}

          {isLink && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Link2 className="w-3.5 h-3.5" />
              <span>Link</span>
            </span>
          )}

          {isNote && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <FileText className="w-3.5 h-3.5" />
              <span>Note</span>
            </span>
          )}

          {/* Subtitle / Domain / Bank */}
          {item.meta?.bankName && (
            <span className="text-[11px] font-medium text-zinc-400 truncate max-w-[120px] xs:max-w-[160px]">
              {item.meta.bankName}
            </span>
          )}
          {item.meta?.domain && (
            <span className="text-[11px] font-mono text-zinc-400 truncate max-w-[120px] xs:max-w-[160px]">
              {item.meta.domain}
            </span>
          )}
        </div>

        {/* Right side: Time remaining badge & Pin toggle */}
        <div className="flex items-center gap-2">
          {/* Expiration badge */}
          <div
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition ${
              item.isPinned
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : timeStatus.isUrgent
                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 animate-pulse'
                : 'bg-zinc-800 text-zinc-400 border border-zinc-700/50'
            }`}
            title={item.expiresAt ? `Expires: ${new Date(item.expiresAt).toLocaleString()}` : 'Never expires'}
          >
            <Clock className="w-3 h-3" />
            <span>{timeStatus.label}</span>
          </div>

          {/* Pin toggle button */}
          <button
            onClick={() => onTogglePin(item.id)}
            className={`p-1.5 rounded-lg transition active:scale-90 ${
              item.isPinned
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
            }`}
            title={item.isPinned ? 'Pinned (Never auto-purges)' : 'Pin drop (Prevents expiration)'}
            aria-label="Pin toggle"
          >
            <Pin className={`w-3.5 h-3.5 ${item.isPinned ? 'fill-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Card Content */}
      <div className="p-4 pt-3 space-y-2.5">
        {/* IBAN view */}
        {isIban && (
          <div className="space-y-2">
            <div className="bg-[#0b0e14] border border-zinc-800 p-3 rounded-xl font-mono text-sm sm:text-base font-bold tracking-wider text-emerald-300 break-all select-all flex items-center justify-between gap-2 shadow-inner">
              <span>{item.meta?.formattedIban || item.content}</span>
              <button
                onClick={() => handleCopy(item.meta?.rawIban || item.content, 'IBAN copied to clipboard')}
                className="shrink-0 p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 transition active:scale-90"
                title="1-Tap Copy Clean IBAN (without spaces)"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            {item.meta?.bankName && (
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 px-1">
                <Shield className="w-3 h-3 text-emerald-500/70" />
                <span>Verified Bank Code: {item.meta.bankName}</span>
              </div>
            )}
          </div>
        )}

        {/* Link view */}
        {isLink && (
          <div className="space-y-2">
            <a
              href={item.content}
              target="_blank"
              rel="noopener noreferrer"
              className="group/link flex items-center justify-between gap-2 p-3 rounded-xl bg-[#0b0e14] border border-zinc-800 hover:border-cyan-500/40 text-cyan-300 hover:text-cyan-200 transition shadow-inner"
            >
              <div className="min-w-0 pr-2">
                <div className="font-semibold text-xs sm:text-sm truncate">{item.meta?.domain || item.content}</div>
                <div className="text-[11px] text-zinc-500 truncate font-mono mt-0.5">{item.content}</div>
              </div>
              <div className="shrink-0 p-1.5 rounded-lg bg-zinc-800/80 group-hover/link:bg-cyan-500/20 text-zinc-400 group-hover/link:text-cyan-300 transition">
                <ExternalLink className="w-4 h-4" />
              </div>
            </a>
          </div>
        )}

        {/* Note view */}
        {isNote && (
          <div className="text-zinc-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words font-sans bg-[#0b0e14]/50 p-3 rounded-xl border border-zinc-800/60 shadow-inner">
            {item.content}
          </div>
        )}
      </div>

      {/* Card Footer: Quick Actions */}
      <div className="px-4 py-2.5 bg-[#0e131a]/60 border-t border-zinc-800/70 flex items-center justify-between gap-2">
        {/* Left: 1-Tap Copy Button */}
        <button
          onClick={() => handleCopy()}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 ${
            copied
              ? 'bg-emerald-600/90 text-white shadow-sm'
              : 'bg-zinc-800 hover:bg-zinc-700/80 text-zinc-200 border border-zinc-700/50'
          }`}
          title="Copy content"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
          <span>{copied ? 'Copied' : isIban ? 'Copy IBAN' : 'Copy'}</span>
        </button>

        {/* Right Action Icons: QR Code, Share, Delete */}
        <div className="flex items-center gap-1">
          {/* QR Code Peer Scan */}
          <button
            onClick={() => onOpenQR(item.meta?.title || item.meta?.domain || (isIban ? item.meta?.bankName || 'IBAN' : 'QuickDrop'), item.content)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition active:scale-90"
            title="Scan as QR code"
            aria-label="Show QR code"
          >
            <QrCode className="w-4 h-4" />
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition active:scale-90"
            title="Share with another app"
            aria-label="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Delete */}
          <button
            onClick={handleDeleteWithEffect}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition active:scale-90"
            title="Delete from shelf"
            aria-label="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
};
