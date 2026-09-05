export type AssetStatus = 'active' | 'retired' | 'sold';

export type CategoryId = string;

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
  category: string;
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
  imageKey?: ProductKey;
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

export type CatalogItem = { id: string; label: string };

export const BUILTIN_CATEGORY_IDS = [
  'digital',
  'home',
  'transport',
  'blindbox',
  'office',
  'uncategorized',
] as const;

export const CATEGORIES: CatalogItem[] = [
  { id: 'all', label: '全部' },
  { id: 'digital', label: '数码' },
  { id: 'home', label: '家居' },
  { id: 'transport', label: '交通' },
  { id: 'blindbox', label: '盲盒' },
  { id: 'office', label: '办公' },
  { id: 'uncategorized', label: '未分类' },
];

const BUILTIN_SET = new Set<string>(BUILTIN_CATEGORY_IDS);

export function isBuiltinCategory(id: string) {
  return id === 'all' || BUILTIN_SET.has(id);
}

export function mergeCategories(custom: CatalogItem[]) {
  const selectable = [
    ...CATEGORIES.filter((c) => c.id !== 'all'),
    ...custom.filter((c) => c.id !== 'all' && !BUILTIN_SET.has(c.id)),
  ];
  return {
    withAll: [CATEGORIES[0]!, ...selectable],
    selectable,
  };
}

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
