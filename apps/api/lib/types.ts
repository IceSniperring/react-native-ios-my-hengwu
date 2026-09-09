/** Mirrors Expo src/types.ts + zustand persist shape (hengwu-db). */

export type AssetStatus = 'active' | 'retired' | 'sold';

export interface Asset {
  id: string;
  name: string;
  category: string;
  status: AssetStatus;
  purchasePrice: number;
  purchaseDate: string;
  targetDailyCost: number;
  expectedDays: number;
  imageKey?: string;
  imageUri?: string;
  starred?: boolean;
  soldPrice?: number;
  soldDate?: string;
  retiredDate?: string;
  note?: string;
  tags?: string[];
  costMode?: 'day' | 'count' | 'custom';
  targetMode?: 'none' | 'price' | 'date' | 'custom';
}

export interface WishItem {
  id: string;
  name: string;
  targetPrice: number;
  saved: number;
  category: string;
  imageKey?: string;
  imageUri?: string;
  note?: string;
  tags?: string[];
}

export interface SavingsPlan {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
}

export interface CatalogItem {
  id: string;
  label: string;
}

/** Body for POST /api/migrate — same fields as zustand partialize (hengwu-db). */
export interface MigrateBody {
  assets?: Asset[];
  wishes?: WishItem[];
  plans?: SavingsPlan[];
  customCategories?: CatalogItem[];
  tagLibrary?: string[];
  colorScheme?: string;
}
