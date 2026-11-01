import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { DropCategory, DropItem, ExpirationPreset, FilterCategory, ShelfStats, SortOption } from '../types';
import { calculateExpiresAt, detectCategory } from '../utils/detector';
import { loadItems, loadStats, saveItems, saveStats } from '../utils/storage';
import { runAutoCleanup } from '../utils/cleanup';
import { useToast } from '../components/Toast';

export function useQuickDrop() {
  const { showToast } = useToast();
  const [items, setItems] = useState<DropItem[]>([]);
  const [stats, setStats] = useState<ShelfStats>({
    totalCreated: 0,
    totalAutoCleaned: 0,
    lastCleanedAt: null,
  });
  const [now, setNow] = useState<number>(Date.now());
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<SortOption>('expiring_soon');

  // Ref to hold recently deleted item for Undo capability
  const lastDeletedRef = useRef<DropItem | null>(null);

  // Load items & run auto-cleanup on initial mount
  useEffect(() => {
    const initialItems = loadItems();
    const initialStats = loadStats();
    setStats(initialStats);

    // Initial Auto-Cleanup Engine Run
    const cleanup = runAutoCleanup(initialItems);
    if (cleanup.removedCount > 0) {
      setItems(cleanup.remainingItems);
      setStats(loadStats());
      showToast(
        `Cleaned up ${cleanup.removedCount} expired drop${cleanup.removedCount > 1 ? 's' : ''}`,
        'info'
      );
    } else {
      setItems(initialItems);
    }
  }, [showToast]);

  // Periodic clock ticker (every 10s) to keep time remaining badges fresh
  useEffect(() => {
    const clockTimer = setInterval(() => {
      setNow(Date.now());
    }, 10000);
    return () => clearInterval(clockTimer);
  }, []);

  // Periodic Auto-Cleanup Engine (runs every 60 seconds as required by prompt)
  useEffect(() => {
    const cleanupTimer = setInterval(() => {
      setItems((prevItems) => {
        const cleanup = runAutoCleanup(prevItems);
        if (cleanup.removedCount > 0) {
          setStats(loadStats());
          showToast(
            `Cleaned up ${cleanup.removedCount} expired drop${cleanup.removedCount > 1 ? 's' : ''}`,
            'info'
          );
          return cleanup.remainingItems;
        }
        return prevItems;
      });
    }, 60000);

    return () => clearInterval(cleanupTimer);
  }, [showToast]);

  // Also run auto-cleanup when tab becomes visible again
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        setNow(Date.now());
        setItems((prev) => {
          const cleanup = runAutoCleanup(prev);
          if (cleanup.removedCount > 0) {
            setStats(loadStats());
            showToast(
              `Cleaned up ${cleanup.removedCount} expired drop${cleanup.removedCount > 1 ? 's' : ''}`,
              'info'
            );
            return cleanup.remainingItems;
          }
          return prev;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [showToast]);

  // Multi-tab storage synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'quickdrop_items_v1') {
        setItems(loadItems());
      }
      if (e.key === 'quickdrop_stats_v1') {
        setStats(loadStats());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Add a new drop
  const addDrop = useCallback(
    (content: string, category: DropCategory, expirationPreset: ExpirationPreset) => {
      const createdAt = Date.now();
      const expiresAt = calculateExpiresAt(expirationPreset, createdAt);
      const detection = detectCategory(content);

      const newItem: DropItem = {
        id: `drop-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        content,
        category,
        createdAt,
        expiresAt,
        expirationPreset,
        isPinned: expirationPreset === 'never',
        meta: detection.meta,
      };

      setItems((prev) => {
        const next = [newItem, ...prev];
        saveItems(next);
        return next;
      });

      setStats((prev) => {
        const updated = {
          ...prev,
          totalCreated: prev.totalCreated + 1,
        };
        saveStats(updated);
        return updated;
      });
    },
    []
  );

  // Toggle Pin on an item
  const togglePin = useCallback(
    (id: string) => {
      setItems((prev) => {
        const next = prev.map((item) => {
          if (item.id === id) {
            const nextPinned = !item.isPinned;
            showToast(nextPinned ? 'Drop pinned (Never auto-purges)' : 'Drop unpinned', 'info');
            return {
              ...item,
              isPinned: nextPinned,
            };
          }
          return item;
        });
        saveItems(next);
        return next;
      });
    },
    [showToast]
  );

  // Delete an item with Undo capability
  const deleteDrop = useCallback(
    (id: string) => {
      setItems((prev) => {
        const target = prev.find((i) => i.id === id);
        if (target) {
          lastDeletedRef.current = target;
        }

        const next = prev.filter((item) => item.id !== id);
        saveItems(next);

        showToast('Item deleted from shelf', 'info', {
          label: 'Undo',
          onClick: () => {
            if (lastDeletedRef.current) {
              const restored = lastDeletedRef.current;
              setItems((current) => {
                const updated = [restored, ...current];
                saveItems(updated);
                return updated;
              });
              lastDeletedRef.current = null;
              showToast('Drop restored!', 'success');
            }
          },
        });

        return next;
      });
    },
    [showToast]
  );

  // Manual trigger for auto-cleanup scan
  const triggerCleanupNow = useCallback(() => {
    setItems((prev) => {
      const cleanup = runAutoCleanup(prev);
      setStats(loadStats());
      if (cleanup.removedCount > 0) {
        showToast(
          `Cleaned up ${cleanup.removedCount} expired drop${cleanup.removedCount > 1 ? 's' : ''}`,
          'success'
        );
        return cleanup.remainingItems;
      } else {
        showToast('Shelf is clean! No expired drops found.', 'info');
        return prev;
      }
    });
  }, [showToast]);

  // Purge all expired non-pinned items explicitly
  const clearExpiredDrops = useCallback(() => {
    setItems((prev) => {
      const nowTs = Date.now();
      const expired = prev.filter((i) => !i.isPinned && i.expiresAt !== null && i.expiresAt <= nowTs);
      if (expired.length === 0) {
        showToast('No expired drops to purge', 'info');
        return prev;
      }
      const remaining = prev.filter((i) => i.isPinned || i.expiresAt === null || i.expiresAt > nowTs);
      saveItems(remaining);
      setStats((st) => {
        const nextSt = {
          ...st,
          totalAutoCleaned: st.totalAutoCleaned + expired.length,
          lastCleanedAt: nowTs,
        };
        saveStats(nextSt);
        return nextSt;
      });
      showToast(`Purged ${expired.length} expired drop${expired.length > 1 ? 's' : ''}`, 'success');
      return remaining;
    });
  }, [showToast]);

  const reloadItems = useCallback(() => {
    setItems(loadItems());
    setStats(loadStats());
  }, []);

  // Category counts
  const counts = useMemo(() => {
    const res = {
      all: items.length,
      link: 0,
      iban: 0,
      note: 0,
      pinned: 0,
    };

    for (const item of items) {
      if (item.category === 'link') res.link++;
      if (item.category === 'iban') res.iban++;
      if (item.category === 'note') res.note++;
      if (item.isPinned) res.pinned++;
    }

    return res;
  }, [items]);

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    let result = [...items];

    // 1. Category Filter
    if (activeFilter === 'pinned') {
      result = result.filter((i) => i.isPinned);
    } else if (activeFilter !== 'all') {
      result = result.filter((i) => i.category === activeFilter);
    }

    // 2. Search Query (matches content, domain, bankName, or rawIban)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((item) => {
        if (item.content.toLowerCase().includes(query)) return true;
        if (item.meta?.domain && item.meta.domain.toLowerCase().includes(query)) return true;
        if (item.meta?.bankName && item.meta.bankName.toLowerCase().includes(query)) return true;
        if (item.meta?.rawIban && item.meta.rawIban.toLowerCase().includes(query)) return true;
        return false;
      });
    }

    // 3. Sorting
    result.sort((a, b) => {
      if (sortOption === 'expiring_soon') {
        // Pinned and permanent go last in expiring soon
        const aExpires = a.isPinned || a.expiresAt === null ? Number.MAX_SAFE_INTEGER : a.expiresAt;
        const bExpires = b.isPinned || b.expiresAt === null ? Number.MAX_SAFE_INTEGER : b.expiresAt;
        if (aExpires !== bExpires) return aExpires - bExpires;
        return b.createdAt - a.createdAt;
      }
      if (sortOption === 'newest') {
        return b.createdAt - a.createdAt;
      }
      if (sortOption === 'oldest') {
        return a.createdAt - b.createdAt;
      }
      return 0;
    });

    return result;
  }, [items, activeFilter, searchQuery, sortOption]);

  return {
    items: filteredItems,
    rawItems: items,
    stats,
    now,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    sortOption,
    setSortOption,
    counts,
    addDrop,
    togglePin,
    deleteDrop,
    triggerCleanupNow,
    clearExpiredDrops,
    reloadItems,
  };
}
