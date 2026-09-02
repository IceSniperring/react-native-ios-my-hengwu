export type AssetStatus = 'active' | 'retired' | 'sold';

export type CategoryId =
  | 'all'
  | 'digital'
  | 'home'
  | 'transport'
  | 'blindbox'
  | 'office'
  | 'uncategorized';

export type ProductKey =
  | 'macbook'
  | 'iphone'
  | 'watch'
  | 'earbuds'
  | 'headphones'
  | 'backpack'
  | 'speaker'
  | 'tablet'
  | 'controller'
  | 'turntable'
  | 'motorcycle'
  | 'helmet'
  | 'sneaker'
  | 'camera'
  | 'gold'
  | 'vr';

export interface Asset {
  id: string;
  name: string;
  category: Exclude<CategoryId, 'all'>;
  status: AssetStatus;
  purchasePrice: number;
  purchaseDate: string;
  targetDailyCost: number;
  expectedDays: number;
  imageKey?: ProductKey;
  imageUri?: string;
  starred?: boolean;
  soldPrice?: number;
  soldDate?: string;
  retiredDate?: string;
  note?: string;
}

export interface WishItem {
  id: string;
  name: string;
  targetPrice: number;
  saved: number;
  category: Exclude<CategoryId, 'all'>;
  imageKey?: ProductKey;
  imageUri?: string;
  note?: string;
}

export interface SavingsPlan {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
}

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'digital', label: '数码' },
  { id: 'home', label: '家居' },
  { id: 'transport', label: '交通' },
  { id: 'blindbox', label: '盲盒' },
  { id: 'office', label: '办公' },
  { id: 'uncategorized', label: '未分类' },
];

export const STATUS_FILTERS: { id: AssetStatus | 'all'; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'active', label: '服役中' },
  { id: 'retired', label: '已退役' },
  { id: 'sold', label: '已卖出' },
];

export const STATUS_LABEL: Record<AssetStatus, string> = {
  active: '服役中',
  retired: '已退役',
  sold: '已卖出',
};
