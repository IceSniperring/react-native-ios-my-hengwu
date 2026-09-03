import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { useColors } from '../useColors';

type Item = { id: string; label: string };

export function FilterTabs({
  items,
  selected,
  onSelect,
}: {
  items: Item[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  const c = useColors();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {items.map((item) => {
        const on = item.id === selected;
        return (
          <Pressable
            key={item.id}
            onPress={() => onSelect(item.id)}
            style={[
              styles.chip,
              {
                backgroundColor: on ? c.chipSelectedBg : c.fill2,
              },
            ]}>
            <Text
              style={[
                styles.label,
                {
                  color: on ? c.chipSelectedText : c.textSecondary,
                  fontWeight: on ? '700' : '500',
                },
              ]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexGrow: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 8,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  label: { fontSize: 13 },
});
