import { DropItem, ShelfStats } from '../types';
import { calculateExpiresAt, detectCategory } from './detector';

const STORAGE_KEY = 'quickdrop_items_v1';
const STATS_KEY = 'quickdrop_stats_v1';

// Seed demo drops so user immediately has an engaging shelf experience
const INITIAL_DEMO_DROPS: DropItem[] = [
  {
    id: 'demo-1',
    content: 'TR330006200012345678901234',
    category: 'iban',
    createdAt: Date.now() - 3600 * 1000 * 12, // 12 hours ago
    expiresAt: Date.now() + 3600 * 1000 * 60, // 2.5 days left
    expirationPreset: '3d',
    isPinned: false,
    meta: {
      rawIban: 'TR330006200012345678901234',
      formattedIban: 'TR33 0006 2000 1234 5678 9012 34',
      bankName: 'Garanti BBVA',
    },
  },
  {
    id: 'demo-2',
    content: 'https://github.com/trending',
    category: 'link',
    createdAt: Date.now() - 3600 * 1000 * 4,
    expiresAt: Date.now() + 3600 * 1000 * 68,
    expirationPreset: '3d',
    isPinned: false,
    meta: {
      domain: 'github.com',
      title: 'GitHub Trending Repositories',
    },
  },
  {
    id: 'demo-3',
    content: 'Apartment Intercom Code: #4920 (Ring twice for courier)\nGuest Wi-Fi: QuickDrop-5G | Pass: shelfPass2026',
    category: 'note',
    createdAt: Date.now() - 3600 * 1000 * 2,
    expiresAt: null,
    expirationPreset: 'never',
    isPinned: true,
    meta: {},
  },
  {
    id: 'demo-4',
    content: 'Order pickup code for DHL Locker: 849-204 (Expires by midnight)',
    category: 'note',
    createdAt: Date.now() - 3600 * 1000 * 18,
    expiresAt: Date.now() + 3600 * 1000 * 6, // 6h remaining
    expirationPreset: '24h',
    isPinned: false,
    meta: {},
  },
];

let memoryStorageFallback: DropItem[] | null = null;

export function loadItems(): DropItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First launch: initialize with demo drops
      saveItems(INITIAL_DEMO_DROPS);
      return INITIAL_DEMO_DROPS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return INITIAL_DEMO_DROPS;
  } catch (err) {
    console.warn('localStorage read error, using fallback', err);
    return memoryStorageFallback || INITIAL_DEMO_DROPS;
  }
}

export function saveItems(items: DropItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    memoryStorageFallback = items;
  } catch (err) {
    console.warn('localStorage write error', err);
    memoryStorageFallback = items;
  }
}

export function loadStats(): ShelfStats {
  const defaultStats: ShelfStats = {
    totalCreated: INITIAL_DEMO_DROPS.length,
    totalAutoCleaned: 0,
    lastCleanedAt: null,
  };

  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return defaultStats;
    return { ...defaultStats, ...JSON.parse(raw) };
  } catch {
    return defaultStats;
  }
}

export function saveStats(stats: ShelfStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (err) {
    console.warn('Could not save stats', err);
  }
}

export function exportShelfAsJSON(): string {
  const items = loadItems();
  const stats = loadStats();
  const exportPayload = {
    app: 'QuickDrop',
    exportedAt: new Date().toISOString(),
    version: 1,
    stats,
    items,
  };
  return JSON.stringify(exportPayload, null, 2);
}

export function importShelfFromJSON(jsonString: string): { success: boolean; count: number; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || !Array.isArray(parsed.items)) {
      return { success: false, count: 0, error: 'Invalid JSON format: missing items array' };
    }

    const currentItems = loadItems();
    const existingIds = new Set(currentItems.map((i) => i.id));
    const newItems: DropItem[] = [];

    for (const item of parsed.items) {
      if (item && item.content) {
        const id = item.id && !existingIds.has(item.id) ? item.id : `drop-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const detection = detectCategory(item.content);
        const importedItem: DropItem = {
          id,
          content: String(item.content),
          category: item.category || detection.category,
          createdAt: typeof item.createdAt === 'number' ? item.createdAt : Date.now(),
          expiresAt: typeof item.expiresAt === 'number' || item.expiresAt === null ? item.expiresAt : calculateExpiresAt('3d'),
          expirationPreset: item.expirationPreset || '3d',
          isPinned: Boolean(item.isPinned),
          meta: item.meta || detection.meta,
        };
        newItems.push(importedItem);
        existingIds.add(id);
      }
    }

    const merged = [...newItems, ...currentItems];
    saveItems(merged);
    return { success: true, count: newItems.length };
  } catch (err) {
    return { success: false, count: 0, error: (err as Error).message };
  }
}
