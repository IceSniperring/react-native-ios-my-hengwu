import { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';

import { formatMoney } from '../calc';
import { LIME } from '../theme';
import { useStore } from '../store';
import { useColors } from '../useColors';

type Props = {
  total: number;
  daily: number;
  active: number;
  retired: number;
  sold: number;
};

/** Stamp shell + reference hierarchy (title/pill, metrics, dashed rule, segmented bar). */
export function OverviewCard({ total, daily, active, retired, sold }: Props) {
  const c = useColors();
  const scheme = useStore((s) => s.colorScheme);
  const totalCount = active + retired + sold;
  const sum = totalCount || 1;
  const stroke = scheme === 'dark' ? 'rgba(255,255,255,0.55)' : '#1A1A1A';
  const paper = scheme === 'dark' ? '#1C1C1E' : '#FFFEF7';
  const postmarkOpacity = scheme === 'dark' ? 0.7 : 0.85;
  const dash = scheme === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)';
  const pillBg = scheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';

  return (
    <View style={[styles.card, { backgroundColor: paper, borderColor: stroke }]}>
      <StampPerforations color={c.bg} />
      <View style={styles.gutter}>
        <View style={styles.inner}>
          <View style={styles.topRow}>
            <Text style={[styles.kicker, { color: c.textSecondary }]}>资产总览</Text>
            <View style={[styles.pill, { backgroundColor: pillBg }]}>
              <Text style={[styles.pillText, { color: c.textTertiary }]}>
                {active}/{totalCount}
              </Text>
            </View>
          </View>

          <View pointerEvents="none" style={[styles.postmarkWrap, { opacity: postmarkOpacity }]}>
            <View style={[styles.postmarkOuter, { borderColor: LIME }]}>
              <View style={[styles.postmarkInner, { borderColor: LIME }]}>
                <Text style={[styles.postmarkText, { color: LIME }]}>有数</Text>
              </View>
            </View>
          </View>

          <View style={styles.metrics}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={[styles.label, { color: c.textSecondary }]}>总资产</Text>
              <Text style={[styles.value, { color: c.text }]}>{formatMoney(total)}</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={[styles.label, { color: c.textSecondary }]}>日均成本</Text>
              <Text style={[styles.value, { color: c.text }]}>{formatMoney(daily)}</Text>
            </View>
          </View>

          <View style={[styles.dash, { borderColor: dash }]} />

          <View style={styles.statusLabels}>
            <Text style={[styles.statusLabel, { color: c.textSecondary }]}>服役中 {active}</Text>
            <Text style={[styles.statusLabel, { color: c.textSecondary, textAlign: 'center' }]}>
              已退役 {retired}
            </Text>
            <Text style={[styles.statusLabel, { color: c.textSecondary, textAlign: 'right' }]}>
              已卖出 {sold}
            </Text>
          </View>
          <View style={[styles.segmentTrack, { backgroundColor: c.track }]}>
            <Seg ratio={active / sum} color={LIME} />
            <Seg ratio={retired / sum} color={c.statusRetired} />
            <Seg ratio={sold / sum} color={c.statusSold} />
          </View>
        </View>
      </View>
    </View>
  );
}

function Seg({ ratio, color }: { ratio: number; color: string }) {
  if (ratio <= 0) return <View style={{ flex: 0.0001 }} />;
  return (
    <View
      style={{
        flex: Math.max(ratio, 0.04),
        height: 4,
        borderRadius: 4,
        backgroundColor: color,
      }}
    />
  );
}

function StampPerforations({ color }: { color: string }) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const r = 4;
  const pitch = 12;
  const d = r * 2;

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== size.w || height !== size.h) setSize({ w: width, h: height });
  };

  const along = (length: number) => {
    if (length <= 0) return [] as number[];
    const n = Math.max(2, Math.round(length / pitch) + 1);
    const step = length / (n - 1);
    return Array.from({ length: n }, (_, i) => i * step);
  };

  const xs = along(size.w);
  const ys = along(size.h);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} onLayout={onLayout}>
      {xs.map((x, i) => (
        <View
          key={`t${i}`}
          style={[styles.hole, { backgroundColor: color, width: d, height: d, borderRadius: r, left: x - r, top: -r }]}
        />
      ))}
      {xs.map((x, i) => (
        <View
          key={`b${i}`}
          style={[
            styles.hole,
            { backgroundColor: color, width: d, height: d, borderRadius: r, left: x - r, bottom: -r },
          ]}
        />
      ))}
      {ys.slice(1, -1).map((y, i) => (
        <View
          key={`l${i}`}
          style={[styles.hole, { backgroundColor: color, width: d, height: d, borderRadius: r, top: y - r, left: -r }]}
        />
      ))}
      {ys.slice(1, -1).map((y, i) => (
        <View
          key={`r${i}`}
          style={[
            styles.hole,
            { backgroundColor: color, width: d, height: d, borderRadius: r, top: y - r, right: -r },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 2,
    borderWidth: 1.5,
    overflow: 'visible',
  },
  gutter: { margin: 6 },
  inner: { padding: 18, position: 'relative' },
  hole: { position: 'absolute' },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingRight: 56 },
  kicker: { fontSize: 13 },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  pillText: { fontSize: 12, fontWeight: '600', fontVariant: ['tabular-nums'] },
  postmarkWrap: {
    position: 'absolute',
    top: 4,
    right: 0,
    width: 52,
    height: 52,
    transform: [{ rotate: '-18deg' }],
    zIndex: 2,
  },
  postmarkOuter: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postmarkInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postmarkText: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  metrics: { flexDirection: 'row', marginTop: 12 },
  label: { fontSize: 12 },
  value: { marginTop: 4, fontSize: 28, fontWeight: '800', fontVariant: ['tabular-nums'] },
  dash: {
    marginTop: 14,
    borderStyle: 'dashed',
    borderWidth: 0,
    borderTopWidth: StyleSheet.hairlineWidth * 2,
  },
  statusLabels: {
    flexDirection: 'row',
    marginTop: 12,
    marginBottom: 8,
  },
  statusLabel: { flex: 1, fontSize: 11 },
  segmentTrack: {
    flexDirection: 'row',
    height: 4,
    borderRadius: 4,
    overflow: 'hidden',
    gap: 3,
  },
});
