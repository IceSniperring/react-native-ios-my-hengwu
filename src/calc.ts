import type { Asset, AssetStatus } from './types';
import { LIME } from './theme';

export function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function parseISO(iso: string) {
  const [y, m, day] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, day || 1);
}

export function toISO(d: Date) {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function daysBetween(fromISO: string, toISO: string) {
  const a = startOfDay(parseISO(fromISO)).getTime();
  const b = startOfDay(parseISO(toISO)).getTime();
  return Math.max(1, Math.round((b - a) / 86400000) + 0);
}

export function holdingDays(asset: Asset, todayISO = toISO(new Date())) {
  const end =
    asset.status === 'sold' && asset.soldDate
      ? asset.soldDate
      : asset.status === 'retired' && asset.retiredDate
        ? asset.retiredDate
        : todayISO;
  return Math.max(1, daysBetween(asset.purchaseDate, end));
}

export function dailyCost(asset: Asset, todayISO = toISO(new Date())) {
  const days = holdingDays(asset, todayISO);
  if (asset.status === 'sold') {
    const spent = asset.purchasePrice - (asset.soldPrice ?? 0);
    return spent / days;
  }
  return asset.purchasePrice / days;
}

export function neededDays(asset: Asset) {
  if (asset.targetDailyCost <= 0) return asset.expectedDays || 365;
  return Math.max(1, Math.ceil(asset.purchasePrice / asset.targetDailyCost));
}

export function remainingDays(asset: Asset, todayISO = toISO(new Date())) {
  return Math.max(0, neededDays(asset) - holdingDays(asset, todayISO));
}

export function targetProgress(asset: Asset, todayISO = toISO(new Date())) {
  return Math.min(1, holdingDays(asset, todayISO) / neededDays(asset));
}

export function expectedFinishISO(asset: Asset) {
  const start = parseISO(asset.purchaseDate);
  start.setDate(start.getDate() + neededDays(asset));
  return toISO(start);
}

export function pnl(asset: Asset) {
  if (asset.status !== 'sold') return 0;
  return (asset.soldPrice ?? 0) - asset.purchasePrice;
}

export function formatMoney(n: number, digits = 2) {
  const abs = Math.abs(n);
  const formatted = abs.toLocaleString('zh-CN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return `${n < 0 ? '-' : ''}¥${formatted}`;
}

export function formatDaily(n: number) {
  const digits = Math.abs(n) >= 10 ? 2 : 1;
  return `${formatMoney(n, digits)} /天`;
}

export function formatCompact(n: number) {
  if (Math.abs(n) >= 10000) {
    return `${(n / 10000).toFixed(n >= 100000 ? 1 : 2)}万`;
  }
  return formatMoney(n, n % 1 === 0 ? 0 : 2);
}

export function addDaysISO(iso: string, days: number) {
  const d = parseISO(iso);
  d.setDate(d.getDate() + days);
  return toISO(d);
}

export function todayISO() {
  return toISO(new Date());
}

export function daysAgoISO(days: number) {
  return addDaysISO(todayISO(), -days);
}

export function dailyCostHistory(asset: Asset, points = 6) {
  const days = holdingDays(asset);
  const count = Math.max(2, points);
  const data: { day: number; value: number; date: string }[] = [];
  for (let p = 0; p < count; p++) {
    const i = Math.max(1, Math.round(1 + ((days - 1) * p) / (count - 1)));
    data.push({
      day: i,
      value: asset.purchasePrice / i,
      date: addDaysISO(asset.purchaseDate, i - 1),
    });
  }
  return data;
}

export function statusColor(status: AssetStatus) {
  if (status === 'active') return LIME;
  if (status === 'retired') return '#FF9500';
  return '#8E8E93';
}
