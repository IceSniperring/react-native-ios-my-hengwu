import { todayISO } from './calc';
import type { IngressDraft } from './types';

function uid() {
  return `d-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Split one CSV line, respecting simple double-quoted fields. */
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === ',' && !inQuotes) {
      out.push(cur.trim());
      cur = '';
      continue;
    }
    cur += ch;
  }
  out.push(cur.trim());
  return out;
}

function normalizeHeader(h: string) {
  return h.replace(/^\uFEFF/, '').trim().toLowerCase();
}

const NAME_KEYS = new Set(['name', '名称', '资产', '品名', '商品', '项目', 'title']);
const PRICE_KEYS = new Set([
  'price',
  '金额',
  '市值',
  '购入价',
  '买入价',
  '成本',
  'amount',
  'value',
  'cost',
]);
const CAT_KEYS = new Set(['category', '分类', '类别', '类型', 'cat']);
const DATE_KEYS = new Set(['date', '日期', '购入日期', '购买日期', 'purchase_date', 'purchasedate']);

function mapCategory(raw: string): string {
  const t = raw.trim().toLowerCase();
  if (!t) return 'uncategorized';
  if (/数码|digital|电子|手机|电脑/.test(t)) return 'digital';
  if (/家居|home|家电|家具/.test(t)) return 'home';
  if (/交通|transport|车|出行/.test(t)) return 'transport';
  if (/盲盒|blind/.test(t)) return 'blindbox';
  if (/办公|office/.test(t)) return 'office';
  if (/现金|cash|活期|存款|货币/.test(t)) return 'uncategorized';
  if (/基金|fund|etf|股票|证券/.test(t)) return 'uncategorized';
  // pass through known ids
  if (['digital', 'home', 'transport', 'blindbox', 'office', 'uncategorized'].includes(t)) return t;
  return 'uncategorized';
}

function parsePrice(raw: string): number {
  const cleaned = raw.replace(/[¥￥,\s]/g, '').replace(/%/g, '');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

function parseDate(raw: string): string {
  const t = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  const m = t.match(/^(\d{4})[/.](\d{1,2})[/.](\d{1,2})$/);
  if (m) {
    return `${m[1]}-${m[2]!.padStart(2, '0')}-${m[3]!.padStart(2, '0')}`;
  }
  return todayISO();
}

export type ParseCsvResult =
  | { ok: true; drafts: IngressDraft[]; fileHint?: string }
  | { ok: false; error: string };

/**
 * Simple CSV → drafts.
 * Accepts header row with name/price(/category/date), or headerless rows of name,price.
 */
export function parseAssetCsv(text: string): ParseCsvResult {
  const raw = text.replace(/^\uFEFF/, '').trim();
  if (!raw) {
    return { ok: false, error: 'CSV 内容为空，请粘贴表格或使用示例。' };
  }

  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'));

  if (!lines.length) {
    return { ok: false, error: 'CSV 没有有效行。' };
  }

  const firstCells = splitCsvLine(lines[0]!);
  const headerNorm = firstCells.map(normalizeHeader);
  const hasName = headerNorm.some((h) => NAME_KEYS.has(h));
  const hasPrice = headerNorm.some((h) => PRICE_KEYS.has(h));
  const hasHeader = hasName && hasPrice;

  let nameIdx = 0;
  let priceIdx = 1;
  let catIdx = -1;
  let dateIdx = -1;
  let dataStart = 0;

  if (hasHeader) {
    nameIdx = headerNorm.findIndex((h) => NAME_KEYS.has(h));
    priceIdx = headerNorm.findIndex((h) => PRICE_KEYS.has(h));
    catIdx = headerNorm.findIndex((h) => CAT_KEYS.has(h));
    dateIdx = headerNorm.findIndex((h) => DATE_KEYS.has(h));
    dataStart = 1;
  }

  if (dataStart >= lines.length) {
    return { ok: false, error: '只有表头，没有数据行。' };
  }

  const drafts: IngressDraft[] = [];
  for (let i = dataStart; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i]!);
    const name = (cells[nameIdx] ?? '').trim();
    const price = parsePrice(cells[priceIdx] ?? '');
    if (!name || !Number.isFinite(price) || price <= 0) continue;
    const category = catIdx >= 0 ? mapCategory(cells[catIdx] ?? '') : 'uncategorized';
    const purchaseDate = dateIdx >= 0 ? parseDate(cells[dateIdx] ?? '') : todayISO();
    drafts.push({
      key: uid(),
      name,
      purchasePrice: price,
      category,
      purchaseDate,
      note: 'CSV 导入',
      source: 'csv',
    });
  }

  if (!drafts.length) {
    return {
      ok: false,
      error: hasHeader
        ? '没有解析到有效行。请确认含「名称/金额」列，且金额为正数。'
        : '没有解析到有效行。无表头时请用：名称,金额',
    };
  }

  return { ok: true, drafts };
}

export const SAMPLE_CSV = `名称,金额,分类,日期
沪深300 ETF,61240,基金,2025-06-01
中证红利,35100,基金,2025-08-12
纳斯达克100,22860,基金,2026-01-20
MacBook Pro 14,14999,数码,2025-11-03
活期存款,42000,现金,2026-03-01
`;
