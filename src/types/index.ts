export type DropCategory = 'link' | 'iban' | 'note';

export type ExpirationPreset = '24h' | '3d' | '7d' | 'never';

export type FilterCategory = 'all' | 'link' | 'iban' | 'note' | 'pinned';

export type SortOption = 'expiring_soon' | 'newest' | 'oldest';

export interface DropMetadata {
  title?: string;
  domain?: string;
  formattedIban?: string;
  bankName?: string;
  rawIban?: string;
}

export interface DropItem {
  id: string;
  content: string;
  category: DropCategory;
  createdAt: number; // timestamp in ms
  expiresAt: number | null; // null if permanent
  expirationPreset: ExpirationPreset;
  isPinned: boolean;
  meta?: DropMetadata;
}

export interface ShelfStats {
  totalCreated: number;
  totalAutoCleaned: number;
  lastCleanedAt: number | null;
}
