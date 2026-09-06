import { formatMoney, holdingDays, remainingDays } from '../calc';
import type { Asset } from '../types';
import type { NextActionKind } from './NextActionsSheet';

/** Product-locked priority order — never「调仓」. */
export const ACTION_ORDER: NextActionKind[] = ['supplement', 'status', 'sell'];

/** DEV / prototype scene ids matching README 场景 A/B/C. */
export type RecommendScene = 'auto' | 'A' | 'B' | 'C';

export type RecommendResult = {
  primary: NextActionKind;
  /** 一眼说清为什么现在做 */
  reason: string;
  whyNow: string;
  focusAssetId?: string;
  secondaries: NextActionKind[];
  /** Which priority rule fired */
  rule: 'missing_fields' | 'idle_retire' | 'sell_price' | 'fallback' | 'scene_override';
};

function secondariesOf(primary: NextActionKind): NextActionKind[] {
  return ACTION_ORDER.filter((k) => k !== primary);
}

type IncompleteHit = { asset: Asset; field: string };

function findIncomplete(assets: Asset[]): IncompleteHit[] {
  const hits: IncompleteHit[] = [];
  for (const a of assets) {
    if (a.status === 'sold') continue;
    if (!a.name?.trim()) {
      hits.push({ asset: a, field: '名称' });
      continue;
    }
    if (!(a.purchasePrice > 0)) {
      hits.push({ asset: a, field: '金额' });
      continue;
    }
    if (!a.category || a.category === 'uncategorized') {
      hits.push({ asset: a, field: '分类' });
      continue;
    }
    if (!a.purchaseDate?.trim()) {
      hits.push({ asset: a, field: '购入日期' });
      continue;
    }
    // 草稿未完善 / 补录后待填
    if (a.note && /草稿|待完善|未完善|补录/.test(a.note)) {
      hits.push({ asset: a, field: '草稿未完善' });
    }
  }
  return hits;
}

type IdleHit = { asset: Asset; days: number };

function findIdle(assets: Asset[]): IdleHit[] {
  const hits: IdleHit[] = [];
  for (const a of assets) {
    if (a.status !== 'active') continue;
    const days = holdingDays(a);
    const remain = remainingDays(a);
    // 日均已摊尽，或持有天数已达服役目标
    if (remain <= 0 || days >= a.expectedDays) {
      hits.push({ asset: a, days });
      continue;
    }
    // 长期闲置启发式：持有 ≥730 天且剩余服役 ≤30 天
    if (days >= 730 && remain <= 30) {
      hits.push({ asset: a, days });
    }
  }
  // 最长闲置优先
  hits.sort((x, y) => y.days - x.days);
  return hits;
}

type SellHit = { asset: Asset; price: number; explicit: boolean };

/**
 * 回笼价启发式（Asset 无独立估值字段时）：
 * 1. 已填 soldPrice 但尚未 sold → 视为明确回笼价
 * 2. 已退役 + note 含闲鱼/卖出/回笼等 → 用 purchasePrice×0.6
 * 3. 已退役且估回笼 ≥¥500 → 同上（演示可点）
 */
function findSellCandidates(assets: Asset[]): SellHit[] {
  const hits: SellHit[] = [];
  for (const a of assets) {
    if (a.status === 'sold') continue;

    if (typeof a.soldPrice === 'number' && a.soldPrice > 0) {
      hits.push({ asset: a, price: a.soldPrice, explicit: true });
      continue;
    }

    const note = a.note ?? '';
    if (a.status === 'retired' && /闲鱼|卖出|回笼|挂出|二手/.test(note)) {
      hits.push({
        asset: a,
        price: Math.round(a.purchasePrice * 0.6),
        explicit: false,
      });
      continue;
    }

    if (a.status === 'retired') {
      const price = Math.round(a.purchasePrice * 0.6);
      if (price >= 500) {
        hits.push({ asset: a, price, explicit: false });
      }
    }
  }
  // 明确回笼价优先，其次金额高
  hits.sort((x, y) => {
    if (x.explicit !== y.explicit) return x.explicit ? -1 : 1;
    return y.price - x.price;
  });
  return hits;
}

function reasonMissing(hits: IncompleteHit[]): string {
  const n = hits.length;
  const labels = hits
    .slice(0, 2)
    .map((h) => (h.field === '草稿未完善' ? h.asset.name || '草稿' : h.asset.name || h.field));
  const extra = n > 2 ? ` 等 ${n} 笔` : '';
  if (n === 1) {
    const h = hits[0]!;
    return `「${h.asset.name || '未命名'}」缺${h.field}，先补全再看清净资产。`;
  }
  return `有 ${n} 笔漏记/缺字段（${labels.join(' + ')}${extra}），先补全再看清净资产。`;
}

function reasonIdle(hit: IdleHit): string {
  return `「${hit.asset.name}」闲置约 ${hit.days} 天，日均已摊尽，建议标记退役。`;
}

function reasonSell(hit: SellHit): string {
  return `「${hit.asset.name}」有明确回笼价 ${formatMoney(hit.price, 0)}，可记一笔卖出。`;
}

/** Scene A/B/C demo copy from README — used when __DEV__ override is on. */
const SCENE_COPY: Record<
  Exclude<RecommendScene, 'auto'>,
  { primary: NextActionKind; reason: string; whyNow: string }
> = {
  A: {
    primary: 'supplement',
    reason: '有 2 笔漏记未入账（订阅费 + 小物件），先补全再看清净资产。',
    whyNow: '缺字段 / 漏记 · 现在先补录',
  },
  B: {
    primary: 'status',
    reason: '「旧 Switch」闲置约 900 天，日均已摊尽，建议标记退役。',
    whyNow: '长期闲置 · 现在标记退役',
  },
  C: {
    primary: 'sell',
    reason: '「iPad Air」有明确回笼价 ¥2,800，可记一笔卖出。',
    whyNow: '有回笼价 · 现在记卖出',
  },
};

/**
 * 同屏只推 1 个主 CTA。优先级（命中即停）：
 * 1. 缺关键字段 / 漏记 → 补录
 * 2. 长期闲置或该退役 → 服役·退役
 * 3. 有明确回笼价 → 卖出
 */
export function recommendNextAction(
  assets: Asset[],
  scene: RecommendScene = 'auto',
): RecommendResult {
  if (scene !== 'auto') {
    const sc = SCENE_COPY[scene];
    let focusAssetId: string | undefined;
    if (sc.primary === 'status') {
      focusAssetId = findIdle(assets)[0]?.asset.id ?? assets.find((a) => a.status === 'active')?.id;
    } else if (sc.primary === 'sell') {
      focusAssetId =
        findSellCandidates(assets)[0]?.asset.id ??
        assets.find((a) => a.status === 'retired' || a.status === 'active')?.id;
    }
    return {
      primary: sc.primary,
      reason: sc.reason,
      whyNow: sc.whyNow,
      focusAssetId,
      secondaries: secondariesOf(sc.primary),
      rule: 'scene_override',
    };
  }

  const incomplete = findIncomplete(assets);
  if (incomplete.length > 0) {
    return {
      primary: 'supplement',
      reason: reasonMissing(incomplete),
      whyNow: '缺字段 / 漏记 · 现在先补录',
      focusAssetId: incomplete[0]!.asset.id,
      secondaries: secondariesOf('supplement'),
      rule: 'missing_fields',
    };
  }

  const idle = findIdle(assets);
  if (idle.length > 0) {
    const hit = idle[0]!;
    return {
      primary: 'status',
      reason: reasonIdle(hit),
      whyNow: '长期闲置 · 现在标记退役',
      focusAssetId: hit.asset.id,
      secondaries: secondariesOf('status'),
      rule: 'idle_retire',
    };
  }

  const sells = findSellCandidates(assets);
  if (sells.length > 0) {
    const hit = sells[0]!;
    return {
      primary: 'sell',
      reason: reasonSell(hit),
      whyNow: '有回笼价 · 现在记卖出',
      focusAssetId: hit.asset.id,
      secondaries: secondariesOf('sell'),
      rule: 'sell_price',
    };
  }

  return {
    primary: 'supplement',
    reason: '暂无更急事项，可先补录漏记的现金 / 订阅 / 物件。',
    whyNow: '保持账本完整 · 现在补录',
    secondaries: secondariesOf('supplement'),
    rule: 'fallback',
  };
}
