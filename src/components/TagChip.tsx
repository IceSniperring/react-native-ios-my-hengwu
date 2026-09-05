import { SymbolView } from 'expo-symbols';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LIME } from '../theme';
import { useColors } from '../useColors';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
};

export function TagChip({ label, selected, onPress, onRemove }: Props) {
  const c = useColors();
  const body = (
    <>
      <Text style={[styles.text, { color: selected ? '#1C1C1E' : c.text }]} numberOfLines={1}>
        {label}
      </Text>
      {onRemove ? (
        <Pressable
          onPress={onRemove}
          hitSlop={8}
          accessibilityLabel={`删除 ${label}`}
          style={styles.remove}>
          <SymbolView name="xmark" size={9} tintColor={selected ? '#1C1C1E' : c.textSecondary} />
        </Pressable>
      ) : null}
    </>
  );
  const box = [styles.chip, { backgroundColor: selected ? LIME : c.chip }];
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        style={({ pressed }) => [...box, { opacity: pressed ? 0.75 : 1 }]}>
        {body}
      </Pressable>
    );
  }
  return <View style={box}>{body}</View>;
}

export function TagChipAdd({ onPress }: { onPress: () => void }) {
  const c = useColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel="新建标签"
      style={({ pressed }) => [
        styles.chip,
        styles.add,
        { borderColor: c.line, opacity: pressed ? 0.7 : 1 },
      ]}>
      <SymbolView name="plus" size={11} tintColor={c.text} />
      <Text style={[styles.text, { color: c.text }]}>新建标签</Text>
    </Pressable>
  );
}

export function ChipWrap({ children }: { children: ReactNode }) {
  return <View style={styles.wrap}>{children}</View>;
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    maxWidth: '100%',
  },
  add: {
    backgroundColor: 'transparent',
    borderWidth: StyleSheet.hairlineWidth,
  },
  text: { fontSize: 14, fontWeight: '500' },
  remove: { paddingLeft: 2 },
});
