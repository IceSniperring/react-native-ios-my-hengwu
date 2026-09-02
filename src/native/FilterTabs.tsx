import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

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
    <View style={styles.anchor}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}>
        {items.map((item) => {
          const on = item.id === selected;
          return (
            <Pressable key={item.id} onPress={() => onSelect(item.id)} style={styles.item}>
              <Text style={[styles.label, { color: on ? c.tabSelected : c.textSecondary }, on && styles.on]}>
                {item.label}
              </Text>
              <View style={[styles.line, { backgroundColor: on ? c.tabSelected : 'transparent' }]} />
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: {
    alignSelf: 'stretch',
    alignItems: 'flex-start',
  },
  row: {
    flexGrow: 0,
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
    gap: 18,
  },
  item: { alignItems: 'center' },
  label: { fontSize: 14, fontWeight: '500' },
  on: { fontWeight: '800' },
  line: { marginTop: 6, width: 16, height: 3, borderRadius: 2 },
});
