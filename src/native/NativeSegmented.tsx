import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

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
});
