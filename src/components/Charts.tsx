import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Line, Path, Rect, Stop } from 'react-native-svg';

import { formatMoney, parseISO, todayISO } from '../calc';
import { LIME } from '../theme';
import { useColors } from '../useColors';
import { useStore } from '../store';

function logTicks(max: number) {
  const caps = [10, 30, 100, 300, 1000, 3000, 10000, 30000];
  const top = caps.find((c) => c >= Math.max(max, 3) * 1.15) ?? 30000;
  const steps = [3, 10, 30, 100, 300, 1000, 3000, 10000, 30000];
  const seq = [0, ...steps.filter((s) => s <= top)];
  if (seq.length <= 7) return seq;
  return [0, ...seq.slice(seq.length - 6)];
}

function formatTick(v: number) {
  if (v === 0) return '0';
  if (v >= 1000) return `${v / 1000}k`;
  return String(v);
}

function formatAxisDate(iso: string, isLast: boolean) {
  if (isLast && iso === todayISO()) return '今天';
  const d = parseISO(iso);
  return `${d.getMonth() + 1}.${d.getDate()}`;
}

function formatChineseDate(iso: string) {
  const d = parseISO(iso);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function yAt(v: number, ticks: number[], top: number, plotH: number) {
  if (v <= 0) return top + plotH;
  const last = ticks.length - 1;
  for (let i = 1; i <= last; i++) {
    if (v <= ticks[i]! || i === last) {
      const a = ticks[i - 1]!;
      const b = ticks[i]!;
      const la = a <= 0 ? Math.log10(0.8) : Math.log10(a);
      const lb = Math.log10(Math.max(b, 1));
      const lv = Math.log10(Math.max(v, 0.8));
      const t = Math.min(1, Math.max(0, (lv - la) / (lb - la || 1)));
      const y0 = top + plotH * (1 - (i - 1) / last);
      const y1 = top + plotH * (1 - i / last);
      return y0 + (y1 - y0) * t;
    }
  }
  return top;
}

export function DailyCostChart({
  data,
  width,
  height = 188,
}: {
  data: { day: number; value: number; date?: string }[];
  target?: number;
  width: number;
  height?: number;
}) {
  const c = useColors();
  const scheme = useStore((s) => s.colorScheme);
  const [active, setActive] = useState<number | null>(null);
  if (width <= 0 || data.length < 2) return <View style={{ height }} />;

  const pad = { l: 4, r: 36, t: 8, b: 22 };
  const plotW = width - pad.l - pad.r;
  const plotH = height - pad.t - pad.b;
  const maxV = Math.max(...data.map((d) => d.value), 1);
  const ticks = logTicks(maxV);
  const grid = scheme === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.08)';
  const x = (i: number) => pad.l + (i / (data.length - 1)) * plotW;
  const y = (v: number) => yAt(v, ticks, pad.t, plotH);
  const line = data
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(pt.value).toFixed(1)}`)
    .join(' ');
  const area = `${line} L ${x(data.length - 1).toFixed(1)} ${(pad.t + plotH).toFixed(1)} L ${x(0).toFixed(1)} ${(pad.t + plotH).toFixed(1)} Z`;
  const lastTick = ticks.length - 1;

  const pick = (locationX: number) => {
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < data.length; i++) {
      const d = Math.abs(x(i) - locationX);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    setActive(best);
  };

  const pt = active != null ? data[active] : null;
  const ax = pt ? x(active!) : 0;
  const ay = pt ? y(pt.value) : 0;
  const tipW = 148;
  const tipLeft = Math.min(width - tipW - 4, Math.max(4, ax - tipW / 2));
  const tipTop = Math.min(pad.t + plotH - 64, ay + 14);

  return (
    <View
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={(e) => pick(e.nativeEvent.locationX)}
      onResponderMove={(e) => pick(e.nativeEvent.locationX)}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="dailyFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={LIME} stopOpacity={0.55} />
            <Stop offset="1" stopColor={LIME} stopOpacity={0.06} />
          </LinearGradient>
        </Defs>
        {ticks.map((tick, i) => {
          const yy = pad.t + plotH * (1 - i / lastTick);
          return (
            <Line
              key={tick}
              x1={pad.l}
              x2={width - pad.r}
              y1={yy}
              y2={yy}
              stroke={grid}
              strokeWidth={1}
              strokeDasharray="3 5"
            />
          );
        })}
        <Path d={area} fill="url(#dailyFill)" />
        <Path d={line} fill="none" stroke={LIME} strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round" />
        {pt ? (
          <>
            <Line
              x1={ax}
              x2={ax}
              y1={pad.t}
              y2={pad.t + plotH}
              stroke={LIME}
              strokeWidth={1.5}
            />
            <Circle cx={ax} cy={ay} r={7} fill={LIME} />
            <Circle cx={ax} cy={ay} r={3.5} fill="#FFFFFF" />
          </>
        ) : null}
      </Svg>
      {ticks.map((tick, i) => {
        const yy = pad.t + plotH * (1 - i / lastTick) - 7;
        return (
          <Text
            key={`t-${tick}`}
            pointerEvents="none"
            style={[styles.yLabel, { color: c.textTertiary, top: yy, right: 2 }]}>
            {formatTick(tick)}
          </Text>
        );
      })}
      {data.map((item, i) => (
        <Text
          key={`x-${item.date ?? i}`}
          pointerEvents="none"
          style={[
            styles.xLabel,
            {
              color: c.textTertiary,
              left: Math.min(width - 36, Math.max(0, x(i) - 16)),
              bottom: 0,
            },
          ]}>
          {item.date ? formatAxisDate(item.date, i === data.length - 1) : String(item.day)}
        </Text>
      ))}
      {pt ? (
        <View
          pointerEvents="none"
          style={[
            styles.tip,
            {
              left: tipLeft,
              top: tipTop,
              backgroundColor: scheme === 'dark' ? '#111113' : '#1C1C1E',
            },
          ]}>
          <Text style={styles.tipValue}>{formatMoney(pt.value, 2)}/天</Text>
          <Text style={styles.tipDate}>
            {pt.date ? formatChineseDate(pt.date) : `第${pt.day}天`}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export function StackedStatusColumn({
  active,
  idle,
  sold,
  height = 140,
}: {
  active: number;
  idle: number;
  sold: number;
  height?: number;
}) {
  const theme = useColors();
  const total = active + idle + sold || 1;
  const segs = [
    { v: sold, c: theme.statusSold },
    { v: idle, c: theme.statusRetired },
    { v: active, c: LIME },
  ];
  return (
    <View style={{ width: 36, height, justifyContent: 'flex-end' }}>
      {segs.map((s, i) => (
        <View
          key={i}
          style={{
            height: Math.max(8, (s.v / total) * height),
            backgroundColor: s.c,
            borderTopLeftRadius: i === 0 ? 8 : 0,
            borderTopRightRadius: i === 0 ? 8 : 0,
            borderBottomLeftRadius: i === segs.length - 1 ? 8 : 0,
            borderBottomRightRadius: i === segs.length - 1 ? 8 : 0,
          }}
        />
      ))}
    </View>
  );
}

function DonutCenter({ label }: { label: string }) {
  const theme = useColors();
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 11, color: theme.textSecondary }}>总计(件)</Text>
        <Text style={{ fontSize: 22, fontWeight: '800', color: theme.text }}>{label}</Text>
      </View>
    </View>
  );
}

export function Donut({
  slices,
  size = 160,
  center,
}: {
  slices: { value: number; color: string }[];
  size?: number;
  center?: string;
}) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const r = size / 2;
  const ir = r * 0.62;
  const cx = r;
  const cy = r;
  let angle = -Math.PI / 2;
  const paths: string[] = [];
  const colorsList: string[] = [];

  slices.forEach((sl) => {
    const a = (sl.value / total) * Math.PI * 2;
    const start = angle;
    const end = angle + a;
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const ix1 = cx + ir * Math.cos(end);
    const iy1 = cy + ir * Math.sin(end);
    const ix2 = cx + ir * Math.cos(start);
    const iy2 = cy + ir * Math.sin(start);
    const large = a > Math.PI ? 1 : 0;
    paths.push(
      `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${ir} ${ir} 0 ${large} 0 ${ix2} ${iy2} Z`,
    );
    colorsList.push(sl.color);
    angle = end;
  });

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        {paths.map((d, i) => (
          <Path key={i} d={d} fill={colorsList[i]} />
        ))}
      </Svg>
      {center ? <DonutCenter label={center} /> : null}
    </View>
  );
}

export function SegmentedBar({
  items,
  height = 22,
}: {
  items: { value: number; color: string }[];
  height?: number;
}) {
  const total = items.reduce((s, x) => s + x.value, 0) || 1;
  return (
    <View style={{ flexDirection: 'row', height, borderRadius: 8, overflow: 'hidden', gap: 4 }}>
      {items.map((it, i) => (
        <View
          key={i}
          style={{
            flex: Math.max(it.value / total, 0.04),
            backgroundColor: it.color,
            borderRadius: 6,
          }}
        />
      ))}
    </View>
  );
}

export function MiniBars({ values, color = LIME, height = 56 }: { values: number[]; color?: string; height?: number }) {
  const max = Math.max(...values, 1);
  return (
    <Svg width="100%" height={height} viewBox={`0 0 ${values.length * 10} ${height}`} preserveAspectRatio="none">
      {values.map((v, i) => {
        const h = Math.max(4, (v / max) * (height - 4));
        return <Rect key={i} x={i * 10 + 2} y={height - h} width={6} height={h} rx={2} fill={color} />;
      })}
    </Svg>
  );
}

const styles = StyleSheet.create({
  yLabel: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: '500',
    width: 32,
    textAlign: 'right',
  },
  xLabel: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: '500',
    width: 36,
    textAlign: 'center',
  },
  tip: {
    position: 'absolute',
    width: 148,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  tipValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  tipDate: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    textAlign: 'center',
  },
});
