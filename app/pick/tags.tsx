import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassIconButton } from '../../src/components/GlassIconButton';
import { ChipWrap, TagChip, TagChipAdd } from '../../src/components/TagChip';
import { useTagLibrary } from '../../src/catalog';
import { useStore } from '../../src/store';
import { useColors } from '../../src/useColors';

const CHROME_PAD = 10;
const CHROME_ROW = 40;

export default function PickTagsScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const library = useTagLibrary();
  const seed = useStore((s) => s.tagPickerSeed);
  const addTag = useStore((s) => s.addTag);
  const commitTagPicker = useStore((s) => s.commitTagPicker);
  const [draft, setDraft] = useState<string[]>(seed);
  const [newName, setNewName] = useState('');

  const toggle = (tag: string) => {
    setDraft((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const createTag = (raw: string) => {
    const name = addTag(raw);
    if (!name) return;
    setDraft((prev) => (prev.includes(name) ? prev : [...prev, name]));
  };

  const promptNew = () => {
    if (Platform.OS === 'ios' && Alert.prompt) {
      Alert.prompt('新建标签', '输入标签名称', (v) => {
        if (v?.trim()) createTag(v);
      });
    }
  };

  const submitNew = () => {
    if (!newName.trim()) return;
    createTag(newName);
    setNewName('');
  };

  const confirm = () => {
    commitTagPicker(draft);
    router.back();
  };

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      <View pointerEvents="box-none" style={styles.chrome}>
        <View pointerEvents="box-none" style={styles.chromeRow}>
          <GlassIconButton name="xmark" size={40} accessibilityLabel="关闭" onPress={() => router.back()} />
          <Text pointerEvents="none" style={[styles.chromeTitle, { color: c.text }]}>
            选择标签
          </Text>
          <GlassIconButton name="checkmark" size={40} accessibilityLabel="确定" onPress={confirm} />
        </View>
      </View>

      <View style={styles.body}>
        <ChipWrap>
          {library.map((tag) => (
            <TagChip key={tag} label={tag} selected={draft.includes(tag)} onPress={() => toggle(tag)} />
          ))}
          {Platform.OS === 'ios' ? <TagChipAdd onPress={promptNew} /> : null}
        </ChipWrap>
        {Platform.OS !== 'ios' ? (
          <TextInput
            value={newName}
            onChangeText={setNewName}
            placeholder="新建标签"
            placeholderTextColor={c.textTertiary}
            onSubmitEditing={submitNew}
            returnKeyType="done"
            style={[styles.mdInput, { backgroundColor: c.chip, color: c.text }]}
          />
        ) : null}
      </View>

      <Pressable
        onPress={() => router.push('/manage/tags')}
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
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  manageBtn: {
    marginHorizontal: 16,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageText: { fontSize: 17, fontWeight: '600' },
  mdInput: {
    marginTop: 16,
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
  },
});
