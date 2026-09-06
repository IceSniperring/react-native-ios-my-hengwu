import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useCategoryLabel } from '../catalog';
import { radius } from '../theme';
import type { Asset } from '../types';
import { useColors } from '../useColors';

export function SupplementForm({
  name,
  price,
  category,
  onName,
  onPrice,
  onCycleCategory,
}: {
  name: string;
  price: string;
  category: string;
  onName: (v: string) => void;
  onPrice: (v: string) => void;
  onCycleCategory: () => void;
}) {
  const c = useColors();
  const label = useCategoryLabel(category);

  return (
    <View style={[styles.formCard, { backgroundColor: c.surface }]}>
      <Text style={[styles.fieldLabel, { color: c.textSecondary }]}>名称</Text>
      <TextInput
        value={name}
        onChangeText={onName}
        placeholder="漏记的现金 / 订阅 / 物件"
        placeholderTextColor={c.textTertiary}
        style={[styles.input, { backgroundColor: c.input, color: c.text, borderColor: c.line }]}
      />
      <Text style={[styles.fieldLabel, { color: c.textSecondary, marginTop: 12 }]}>金额</Text>
      <TextInput
        value={price}
        onChangeText={onPrice}
        keyboardType="decimal-pad"
        placeholder="0"
        placeholderTextColor={c.textTertiary}
        style={[styles.input, { backgroundColor: c.input, color: c.text, borderColor: c.line }]}
      />
      <Pressable onPress={onCycleCategory} style={styles.metaRow} accessibilityRole="button">
        <Text style={{ color: c.textSecondary, fontSize: 14 }}>分类</Text>
        <Text style={{ color: c.text, fontSize: 15, fontWeight: '600' }}>{label} ›</Text>
      </Pressable>
    </View>
  );
}

export function AssetPicker({
  label,
  assets,
  selectedId,
  onSelect,
  emptyText,
  renderMeta,
}: {
  label: string;
  assets: Asset[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  emptyText: string;
  renderMeta: (a: Asset) => string;
}) {
  const c = useColors();

  if (!assets.length) {
    return (
      <View style={[styles.formCard, { backgroundColor: c.surface }]}>
        <Text style={{ color: c.textSecondary, textAlign: 'center' }}>{emptyText}</Text>
      </View>
    );
  }

  return (
    <View>
      <Text style={[styles.fieldLabel, { color: c.textSecondary }]}>{label}</Text>
      <View style={[styles.picker, { backgroundColor: c.surface }]}>
        {assets.slice(0, 8).map((a, i) => {
          const on = a.id === selectedId;
          return (
            <Pressable
              key={a.id}
              onPress={() => onSelect(a.id)}
              style={[
                styles.pickRow,
                i < Math.min(assets.length, 8) - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: c.line,
                },
                on && { backgroundColor: c.lemonSoft },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={a.name}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.pickName, { color: c.text }]} numberOfLines={1}>
                  {a.name}
                </Text>
                <Text style={[styles.pickMeta, { color: c.textSecondary }]} numberOfLines={1}>
                  {renderMeta(a)}
                </Text>
              </View>
              {on ? (
                <Text style={{ color: c.text, fontWeight: '700', fontSize: 16 }}>✓</Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  formCard: {
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 4,
  },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  input: {
    height: 48,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    fontSize: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  metaRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  picker: { borderRadius: radius.lg, overflow: 'hidden' },
  pickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    minHeight: 56,
  },
  pickName: { fontSize: 16, fontWeight: '600' },
  pickMeta: { marginTop: 2, fontSize: 12 },
});
