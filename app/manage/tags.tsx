import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChipWrap, TagChip } from '../../src/components/TagChip';
import { useTagLibrary } from '../../src/catalog';
import { LIME } from '../../src/theme';
import { useStore } from '../../src/store';
import { useColors } from '../../src/useColors';

export default function ManageTagsScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const tags = useTagLibrary();
  const addTag = useStore((s) => s.addTag);
  const removeTag = useStore((s) => s.removeTag);
  const [draft, setDraft] = useState('');

  const add = () => {
    if (!addTag(draft)) return;
    setDraft('');
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }}
      keyboardShouldPersistTaps="handled">
      <Text style={[styles.hint, { color: c.textSecondary }]}>
        点胶囊右侧关闭可删除。删除后会从所有资产和心愿上移除。
      </Text>
      {tags.length === 0 ? (
        <Text style={[styles.empty, { color: c.textSecondary }]}>还没有标签</Text>
      ) : (
        <ChipWrap>
          {tags.map((tag) => (
            <TagChip
              key={tag}
              label={tag}
              onRemove={() =>
                Alert.alert('删除标签', `确定删除「${tag}」？`, [
                  { text: '取消', style: 'cancel' },
                  { text: '确认删除', style: 'destructive', onPress: () => removeTag(tag) },
                ])
              }
            />
          ))}
        </ChipWrap>
      )}

      <View style={styles.addBox}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="新标签名称"
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
  hint: { fontSize: 13, lineHeight: 18, marginBottom: 16, marginHorizontal: 4 },
  empty: { textAlign: 'center', paddingVertical: 32, fontSize: 15 },
  addBox: {
    marginTop: 24,
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
