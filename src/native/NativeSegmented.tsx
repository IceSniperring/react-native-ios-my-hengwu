import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { Platform, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { LIME } from '../theme';
import { useStore } from '../store';
import { useColors } from '../useColors';

type Props = {
  values: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function NativeSegmented({ values, selectedIndex, onChange, compact, style }: Props) {
  const c = useColors();
  const scheme = useStore((s) => s.colorScheme);
  if (Platform.OS !== 'ios') {
    return (
      <View style={[styles.wrap, compact && styles.compact, styles.mdTrack, { backgroundColor: c.chip }, style]}>
        {values.map((value, i) => {
          const on = i === selectedIndex;
          return (
            <Pressable
              key={value}
              onPress={() => onChange(i)}
              android_ripple={{ color: 'rgba(0,0,0,0.08)' }}
              style={[styles.mdSeg, on && { backgroundColor: LIME }]}>
              <Text style={[styles.mdText, { color: on ? '#1C1C1E' : c.text }]} numberOfLines={1}>
                {value}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  }
  return (
    <View style={[styles.wrap, compact && styles.compact, style]}>
      <SegmentedControl
        values={values}
        selectedIndex={selectedIndex}
        onChange={(e) => onChange(e.nativeEvent.selectedSegmentIndex)}
        appearance={scheme}
        tintColor={LIME}
        fontStyle={{ fontSize: 13, color: c.textSecondary }}
        activeFontStyle={{ fontSize: 13, fontWeight: '600', color: c.text }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginHorizontal: 16, marginVertical: 8, alignSelf: 'stretch' },
  compact: { marginHorizontal: 0, marginVertical: 0, alignSelf: 'stretch' },
  mdTrack: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 3,
    gap: 2,
  },
  mdSeg: {
    flex: 1,
    minHeight: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  mdText: { fontSize: 13, fontWeight: '600' },
});
