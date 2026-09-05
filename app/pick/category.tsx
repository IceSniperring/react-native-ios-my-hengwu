import { router } from 'expo-router';
import { PlatformIcon } from '../../src/native/PlatformIcon';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassIconButton } from '../../src/components/GlassIconButton';
import { useSelectableCategories } from '../../src/catalog';
import { LIME } from '../../src/theme';
import { useStore } from '../../src/store';
import { useColors } from '../../src/useColors';

const CHROME_PAD = 10;
const CHROME_ROW = 40;

export default function PickCategoryScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const cats = useSelectableCategories();
  const seed = useStore((s) => s.categoryPickerSeed);
  const addCategory = useStore((s) => s.addCategory);
  const commitCategoryPicker = useStore((s) => s.commitCategoryPicker);
  const [draft, setDraft] = useState(seed);

  const promptNew = () => {
    if (Alert.prompt) {
      Alert.prompt('新建分类', '输入分类名称', (v) => {
        const id = v?.trim() ? addCategory(v) : null;
        if (id) setDraft(id);
      });
      return;
    }
    const id = addCategory('未命名');
    if (id) setDraft(id);
  };

  const confirm = () => {
    commitCategoryPicker(draft);
    router.back();
  };

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      <View pointerEvents="box-none" style={styles.chrome}>
        <View pointerEvents="box-none" style={styles.chromeRow}>
          <GlassIconButton name="xmark" size={40} accessibilityLabel="关闭" onPress={() => router.back()} />
          <Text pointerEvents="none" style={[styles.chromeTitle, { color: c.text }]}>
            选择分类
          </Text>
          <GlassIconButton name="checkmark" size={40} accessibilityLabel="确定" onPress={confirm} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 16 }} keyboardShouldPersistTaps="handled">
        {cats.map((cat) => {
          const on = cat.id === draft;
          return (
            <Pressable
              key={cat.id}
              onPress={() => setDraft(cat.id)}
              style={({ pressed }) => [
                styles.row,
                { borderBottomColor: c.line },
                pressed && { backgroundColor: c.chip },
              ]}>
              <Text style={[styles.rowLabel, { color: c.text }]}>{cat.label}</Text>
              {on ? <PlatformIcon name="checkmark" size={18} color={LIME} /> : null}
            </Pressable>
          );
        })}
      </ScrollView>

      <Pressable
        onPress={promptNew}
        style={({ pressed }) => [
          styles.manageBtn,
          { backgroundColor: c.chip, marginBottom: 10, opacity: pressed ? 0.75 : 1 },
        ]}>
        <Text style={[styles.manageText, { color: c.text }]}>新建分类</Text>
      </Pressable>
      <Pressable
        onPress={() => router.push('/manage/categories')}
        style={({ pressed }) => [
          styles.manageBtn,
          { backgroundColor: c.chip, marginBottom: Math.max(insets.bottom, 16), opacity: pressed ? 0.75 : 1 },
        ]}>
        <Text style={[styles.manageText, { color: c.text }]}>管理</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  chrome: {
    paddingHorizontal: 16,
    paddingTop: CHROME_PAD,
  },
  chromeRow: {
    minHeight: CHROME_ROW,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chromeTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: CHROME_ROW,
    lineHeight: CHROME_ROW,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
  },
  row: {
    minHeight: 48,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: { flex: 1, fontSize: 17 },
  manageBtn: {
    marginHorizontal: 16,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageText: { fontSize: 17, fontWeight: '600' },
});
