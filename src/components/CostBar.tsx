import { StyleSheet, Text, View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

import { useColors } from '../useColors';

type Props = {
  progress: number;
  label?: string;
  color?: string;
  height?: number;
};

export function CostBar({ progress, label, color, height = 8 }: Props) {
  const c = useColors();
  const p = Math.min(1, Math.max(0, progress));
  const fill = color ?? c.tint;
  return (
    <View>
      <View style={[styles.track, { height, borderRadius: height, backgroundColor: c.track }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${Math.max(p * 100, 6)}%`,
              backgroundColor: fill,
              height,
              borderRadius: height,
            },
          ]}
        />
        <View style={[styles.marker, { left: `${p * 100}%` }]}>
          <Svg width={10} height={8} viewBox="0 0 10 8">
            <Polygon points="5,8 0,0 10,0" fill={c.text} />
          </Svg>
        </View>
      </View>
      {label ? <Text style={[styles.label, { color: c.textSecondary }]}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    overflow: 'visible',
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  marker: {
    position: 'absolute',
    top: -9,
    marginLeft: -5,
  },
  label: {
    marginTop: 6,
    fontSize: 11,
    textAlign: 'right',
  },
});
