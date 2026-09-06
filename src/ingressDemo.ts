import { todayISO } from './calc';
import type { IngressDraft } from './types';

function uid() {
  return `d-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Demo OCR drafts when real OCR is unavailable — editable on confirm screen. */
export function demoScreenshotDrafts(_imageUri?: string): IngressDraft[] {
  const day = todayISO();
  return [
    {
      key: uid(),
      name: '基金定投 · 沪深300',
      purchasePrice: 8000,
      category: 'uncategorized',
      purchaseDate: day,
      note: '演示识别 · 支付宝账单截图',
      source: 'shot',
    },
    {
      key: uid(),
      name: '工资结余转入',
      purchasePrice: 9500,
      category: 'uncategorized',
      purchaseDate: day,
      note: '演示识别 · 活期',
      source: 'shot',
    },
    {
      key: uid(),
      name: '咖啡机',
      purchasePrice: 1140,
      category: 'home',
      purchaseDate: day,
      note: '演示识别 · 家居新购',
      source: 'shot',
    },
  ];
}

export function demoOneDraft(): IngressDraft[] {
  return [
    {
      key: uid(),
      name: 'MacBook Pro 14',
      purchasePrice: 14999,
      category: 'digital',
      purchaseDate: todayISO(),
      note: '手动补录',
      source: 'one',
    },
  ];
}

export function blankOneDraft(): IngressDraft[] {
  return [
    {
      key: uid(),
      name: '',
      purchasePrice: 0,
      category: 'digital',
      purchaseDate: todayISO(),
      note: '手动补录',
      source: 'one',
    },
  ];
}
