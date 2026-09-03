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

/** Designer v1 stamp OverviewCard — perforations, stroke, postmark. */
export function OverviewCard({ total, daily, active, retired, sold }: Props) {
  const c = useColors();
  const scheme = useStore((s) => s.colorScheme);
  const sum = active + retired + sold || 1;
  const stroke = scheme === 'dark' ? 'rgba(255,255,255,0.55)' : '#1A1A1A';
  const paper = scheme === 'dark' ? '#1C1C1E' : '#FFFEF7';
  const postmarkOpacity = scheme === 'dark' ? 0.7 : 0.85;

  return (
    <View style={[styles.card, { backgroundColor: paper, borderColor: stroke }]}>
      <StampPerforations color={c.bg} />
      <View style={styles.gutter}>
        <View style={styles.inner}>
          <View style={styles.topRow}>
            <Text style={[styles.kicker, { color: c.textSecondary }]}>资产总览</Text>
            <Text style={[styles.count, { color: c.textTertiary }]}>
              {active}/{active + retired + sold}
            </Text>
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
            <View style={{ flex: 1, alignItems: 'flex-end', paddingRight: 4 }}>
              <Text style={[styles.label, { color: c.textSecondary }]}>日均成本</Text>
              <Text style={[styles.value, { color: c.text }]}>{formatMoney(daily)}</Text>
            </View>
          </View>
          <View style={styles.bars}>
            <Bar
              label={`服役中 ${active}`}
              color={LIME}
              track={c.track}
              text={c.textSecondary}
              ratio={active / sum}
            />
            <Bar
              label={`已退役 ${retired}`}
              color={c.statusRetired}
              track={c.track}
              text={c.textSecondary}
              ratio={retired / sum}
            />
            <Bar
              label={`已卖出 ${sold}`}
              color={c.statusSold}
              track={c.track}
              text={c.textSecondary}
              ratio={sold / sum}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

/** r=4, pitch 12, centers on stroke; corner holes shared; color = page bg */
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
      {/* sides skip corners (already drawn) */}
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

function Bar({
  label,
  color,
  track,
  text,
  ratio,
}: {
  label: string;
  color: string;
  track: string;
  text: string;
  ratio: number;
}) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={[styles.barLabel, { color: text }]}>{label}</Text>
      <View style={[styles.barTrack, { backgroundColor: track }]}>
        <View
          style={[
            styles.barFill,
            {
              width: `${Math.max(12, ratio * 100)}%` as unknown as number,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 2,
    borderWidth: 1.5,
    overflow: 'visible',
  },
  gutter: {
    margin: 6,
  },
  inner: {
    padding: 18,
    position: 'relative',
  },
  hole: {
    position: 'absolute',
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingRight: 56 },
  kicker: { fontSize: 13 },
  count: { fontSize: 13, flex: 1 },
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
  metrics: { flexDirection: 'row', marginTop: 10 },
  label: { fontSize: 12 },
  value: { marginTop: 4, fontSize: 26, fontWeight: '800', fontVariant: ['tabular-nums'] },
  bars: { flexDirection: 'row', gap: 12, marginTop: 16 },
  barLabel: { fontSize: 11, marginBottom: 6 },
  barTrack: { height: 4, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 4, borderRadius: 4 },
});
