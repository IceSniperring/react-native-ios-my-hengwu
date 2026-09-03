import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

import { palettes } from '../theme';
import { useColors } from '../useColors';

const colors = palettes.light;

export function DailyCostChart({
  data,
  target,
  width,
  height = 160,
}: {
  data: { day: number; value: number }[];
  target?: number;
  width: number;
  height?: number;
}) {
  if (width <= 0 || data.length < 2) return <View style={{ height }} />;
  const pad = { l: 8, r: 12, t: 16, b: 20 };
  const w = width - pad.l - pad.r;
  const h = height - pad.t - pad.b;
  const maxV = Math.max(...data.map((d) => d.value), target ?? 0) * 1.08;
  const minV = 0;
  const x = (i: number) => pad.l + (i / (data.length - 1)) * w;
  const y = (v: number) => pad.t + (1 - (v - minV) / (maxV - minV)) * h;
  const d = data
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(pt.value)}`)
    .join(' ');
  const area = `${d} L ${x(data.length - 1)} ${pad.t + h} L ${x(0)} ${pad.t + h} Z`;
  const last = data[data.length - 1];

  return (
    <View>
      <Svg width={width} height={height}>
        {[0.25, 0.5, 0.75, 1].map((g) => (
          <Line
            key={g}
            x1={pad.l}
            x2={width - pad.r}
            y1={pad.t + h * g}
            y2={pad.t + h * g}
            stroke="#F0F0F0"
            strokeWidth={1}
          />
        ))}
        {target ? (
          <Line
            x1={pad.l}
            x2={width - pad.r}
            y1={y(target)}
            y2={y(target)}
            stroke={colors.tint}
            strokeDasharray="4 4"
            strokeWidth={1.5}
          />
        ) : null}
        <Path d={area} fill="rgba(0,122,255,0.18)" />
        <Path d={d} fill="none" stroke={colors.tint} strokeWidth={2.5} />
        <Circle cx={x(data.length - 1)} cy={y(last.value)} r={4.5} fill={colors.tint} />
      </Svg>
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
  const total = active + idle + sold || 1;
  const segs = [
    { v: sold, c: colors.statusSold },
    { v: idle, c: colors.statusRetired },
    { v: active, c: colors.statusActive },
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

export function MiniBars({ values, color = colors.tint, height = 56 }: { values: number[]; color?: string; height?: number }) {
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
