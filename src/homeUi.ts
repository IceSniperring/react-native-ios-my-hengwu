export const COMPACT_TITLE_SCROLL_THRESHOLD = 56;
export const CATEGORY_SWIPE_THRESHOLD = 48;

export function compactTitleVisible(scrollY: number) {
  return scrollY >= COMPACT_TITLE_SCROLL_THRESHOLD;
}

export function swipeCategory<T extends string>(
  items: readonly T[],
  selected: T,
  dx: number,
  dy: number,
) {
  if (Math.abs(dx) < CATEGORY_SWIPE_THRESHOLD || Math.abs(dx) <= Math.abs(dy)) {
    return selected;
  }

  const current = Math.max(0, items.indexOf(selected));
  const direction = dx < 0 ? 1 : -1;
  const next = Math.min(items.length - 1, Math.max(0, current + direction));
  return items[next] ?? selected;
}

/** Height of a two-column square-card grid, so the outer scroll keeps its length while paging. */
export function gridPageHeight(count: number, cardWidth: number, gap: number) {
  const rows = Math.max(1, Math.ceil(count / 2));
  return rows * cardWidth + (rows - 1) * gap;
}

/**
 * Height of a shared pager viewport: the tallest page wins, floored by the
 * caller's minimum, so every page has room and the outer scroll can always
 * push the overview card away.
 */
export function pagerViewportHeight(pageHeights: readonly number[], minHeight: number) {
  return pageHeights.reduce((tallest, h) => (h > tallest ? h : tallest), minHeight);
}
