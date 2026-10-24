import { DropItem } from '../types';
import { loadItems, loadStats, saveItems, saveStats } from './storage';

export interface CleanupResult {
  removedCount: number;
  remainingItems: DropItem[];
  removedItems: DropItem[];
}

/**
 * Checks for expired drops (where expiresAt is not null and <= now, and item is not pinned)
 * Purges them from storage and updates shelf lifetime stats.
 */
export function runAutoCleanup(currentItems?: DropItem[]): CleanupResult {
  const items = currentItems || loadItems();
  const now = Date.now();

  const remainingItems: DropItem[] = [];
  const removedItems: DropItem[] = [];

  for (const item of items) {
    // Pinned items NEVER expire
    if (item.isPinned) {
      remainingItems.push(item);
      continue;
    }

    // Permanent items (expiresAt === null) NEVER expire
    if (item.expiresAt === null) {
      remainingItems.push(item);
      continue;
    }

    // Check expiration timestamp
    if (item.expiresAt <= now) {
      removedItems.push(item);
    } else {
      remainingItems.push(item);
    }
  }

  if (removedItems.length > 0) {
    saveItems(remainingItems);

    const stats = loadStats();
    stats.totalAutoCleaned += removedItems.length;
    stats.lastCleanedAt = now;
    saveStats(stats);
  }

  return {
    removedCount: removedItems.length,
    remainingItems,
    removedItems,
  };
}
