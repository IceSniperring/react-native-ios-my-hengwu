import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GroupedRow, GroupedSection } from '../../src/components/GroupedList';
import { useSelectableCategories } from '../../src/catalog';
import { LIME } from '../../src/theme';
import { isBuiltinCategory } from '../../src/types';
import { useStore } from '../../src/store';
import { useColors } from '../../src/useColors';

export default function ManageCategoriesScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const cats = useSelectableCategories();
  const addCategory = useStore((s) => s.addCategory);
  const renameCategory = useStore((s) => s.renameCategory);
  const removeCategory = useStore((s) => s.removeCategory);
  const [draft, setDraft] = useState('');

  const add = () => {
    if (!addCategory(draft)) return;
    setDraft('');
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{ paddingTop: 16, paddingBottom: insets.bottom + 40 }}
      keyboardShouldPersistTaps="handled">
      <GroupedSection header="全部分类" footer="系统分类不能删除。删除自定义分类后，相关物品会归到「未分类」。">
        {cats.map((cat) => {
          const builtin = isBuiltinCategory(cat.id);
          return (
            <GroupedRow
              key={cat.id}
              icon="square.grid.2x2"
              iconBg={builtin ? '#8E8E93' : '#007AFF'}
              label={cat.label}
              value={builtin ? '系统' : undefined}
              chevron={!builtin}
              onPress={
                builtin
                  ? undefined
                  : () =>
                      Alert.alert(cat.label, '重命名或删除这个分类', [
                        { text: '取消', style: 'cancel' },
                        {
                          text: '重命名',
                          onPress: () => {
                            if (!Alert.prompt) return;
                            Alert.prompt('重命名分类', undefined, (v) => {
                              if (v?.trim()) renameCategory(cat.id, v);
                            }, 'plain-text', cat.label);
                          },
                        },
                        {
                          text: '删除',
                          style: 'destructive',
                          onPress: () =>
                            Alert.alert('删除分类', `确定删除「${cat.label}」？`, [
                              { text: '取消', style: 'cancel' },
                              { text: '确认删除', style: 'destructive', onPress: () => removeCategory(cat.id) },
                            ]),
                        },
                      ])
              }
            />
          );
        })}
      </GroupedSection>

      <View style={styles.addBox}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="新分类名称"
          placeholderTextColor={c.textTertiary}
          onSubmitEditing={add}
          returnKeyType="done"
          style={[styles.input, { backgroundColor: c.card, color: c.text }]}
        />
        <Pressable
          onPress={add}
          disabled={!draft.trim()}
          style={({ pressed }) => [
            styles.addBtn,
            { backgroundColor: LIME, opacity: !draft.trim() ? 0.4 : pressed ? 0.85 : 1 },
          ]}>
          <SymbolView name="plus" size={14} tintColor="#1C1C1E" />
          <Text style={styles.addText}>添加</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  addBox: {
    marginHorizontal: 16,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  addBtn: {
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addText: { fontWeight: '700', color: '#1C1C1E', fontSize: 16 },
});
