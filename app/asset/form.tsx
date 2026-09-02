import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState, type ComponentProps } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { todayISO } from '../../src/calc';
import { StickerImage } from '../../src/components/StickerImage';
import { NativeDateField } from '../../src/native/NativeDateField';
import { showNativeSheet } from '../../src/native/sheet';
import { pickAssetImage, takeAssetPhoto } from '../../src/pickImage';
import { useStore } from '../../src/store';
import { radius } from '../../src/theme';
import { useColors } from '../../src/useColors';
import { CATEGORIES, type CategoryId, type ProductKey } from '../../src/types';

const KEYS: ProductKey[] = [
  'macbook',
  'iphone',
  'watch',
  'earbuds',
  'headphones',
  'backpack',
  'speaker',
  'tablet',
  'controller',
  'camera',
  'gold',
  'vr',
];

export default function AssetForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const c = useColors();
  const existing = useStore((s) => s.assets.find((a) => a.id === id));
  const addAsset = useStore((s) => s.addAsset);
  const updateAsset = useStore((s) => s.updateAsset);

  const [name, setName] = useState(existing?.name ?? '');
  const [price, setPrice] = useState(existing ? String(existing.purchasePrice) : '');
  const [date, setDate] = useState(existing?.purchaseDate ?? todayISO());
  const [category, setCategory] = useState<Exclude<CategoryId, 'all'>>(existing?.category ?? 'digital');
  const [target, setTarget] = useState(existing ? String(existing.targetDailyCost) : '10');
  const [expected, setExpected] = useState(existing ? String(existing.expectedDays) : '365');
  const [note, setNote] = useState(existing?.note ?? '');
  const [imageKey, setImageKey] = useState<ProductKey | undefined>(existing?.imageKey);
  const [imageUri, setImageUri] = useState<string | undefined>(existing?.imageUri);

  const save = () => {
    const purchasePrice = Number(price);
    const targetDailyCost = Number(target);
    const expectedDays = Number(expected);
    if (!name.trim()) return Alert.alert('请填写名称');
    if (!purchasePrice || purchasePrice <= 0) return Alert.alert('请填写买入价');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return Alert.alert('日期格式 YYYY-MM-DD');
    const payload = {
      name: name.trim(),
      purchasePrice,
      purchaseDate: date,
      category,
      targetDailyCost: targetDailyCost > 0 ? targetDailyCost : purchasePrice / 365,
      expectedDays: expectedDays > 0 ? expectedDays : 365,
      note,
      imageKey,
      imageUri,
      status: existing?.status ?? ('active' as const),
      starred: existing?.starred,
      soldPrice: existing?.soldPrice,
      soldDate: existing?.soldDate,
      retiredDate: existing?.retiredDate,
    };
    if (existing) {
      updateAsset(existing.id, payload);
      router.back();
    } else {
      const newId = addAsset(payload);
      router.replace(`/asset/${newId}`);
    }
  };

  const pickPhoto = () => {
    showNativeSheet({
      title: '添加贴纸',
      items: [
        {
          label: '拍照',
          onPress: async () => {
            const uri = await takeAssetPhoto();
            if (uri) {
              setImageUri(uri);
              setImageKey(undefined);
            }
          },
        },
        {
          label: '从相册选择',
          onPress: async () => {
            const uri = await pickAssetImage();
            if (uri) {
              setImageUri(uri);
              setImageKey(undefined);
            }
          },
        },
      ],
    });
  };

  return (
    <KeyboardAvoidingView style={[styles.root, { backgroundColor: c.bg }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen
        options={{
          title: existing ? '编辑资产' : '录入资产',
          headerRight: () => (
            <Pressable onPress={save} hitSlop={8}>
              <Text style={[styles.saveText, { color: c.limeDark }]}>保存</Text>
            </Pressable>
          ),
        }}
      />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <View style={styles.photoRow}>
          <Pressable onPress={pickPhoto}>
            <StickerImage imageKey={imageKey} imageUri={imageUri} size={96} />
          </Pressable>
          <Pressable style={styles.photoBtn} onPress={pickPhoto}>
            <Text style={styles.photoBtnText}>拍照或相册</Text>
          </Pressable>
        </View>

        <Text style={[styles.label, { color: c.textSecondary }]}>贴纸模板</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 8 }}>
          {KEYS.map((k) => (
            <Pressable key={k} onPress={() => { setImageKey(k); setImageUri(undefined); }}>
              <StickerImage imageKey={k} size={64} radius={14} style={imageKey === k ? { borderWidth: 2, borderColor: c.limeDark } : undefined} />
            </Pressable>
          ))}
        </ScrollView>

        <Field label="物品名称" value={name} onChangeText={setName} placeholder="例如 MacBook Pro" />
        <Field label="买入价（元）" value={price} onChangeText={setPrice} keyboardType="decimal-pad" placeholder="8999" />
        <NativeDateField label="购入日期" value={date} onChange={setDate} />
        <Field label="目标日均成本（元/天）" value={target} onChangeText={setTarget} keyboardType="decimal-pad" placeholder="10" />
        <Field label="预计服役天数" value={expected} onChangeText={setExpected} keyboardType="number-pad" placeholder="365" />

        <Text style={[styles.label, { color: c.textSecondary }]}>分类</Text>
        <View style={styles.wrap}>
          {CATEGORIES.filter((c) => c.id !== 'all').map((c) => {
            const on = category === c.id;
            return (
              <Pressable key={c.id} onPress={() => setCategory(c.id as Exclude<CategoryId, 'all'>)} style={[styles.chip, on && styles.chipOn]}>
                <Text style={[styles.chipText, on && styles.chipTextOn]}>{c.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <Field label="备注" value={note} onChangeText={setNote} placeholder="可选" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ThemedInput(props: ComponentProps<typeof TextInput>) {
  const c = useColors();
  return (
    <TextInput
      {...props}
      placeholderTextColor={c.textTertiary}
      style={[styles.input, { backgroundColor: c.input, color: c.text }]}
    />
  );
}

function Field(props: ComponentProps<typeof TextInput> & { label: string }) {
  const { label, ...rest } = props;
  const c = useColors();
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={[styles.label, { color: c.textSecondary }]}>{label}</Text>
      <ThemedInput {...rest} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  saveText: { fontWeight: '600', fontSize: 17 },
  photoRow: { flexDirection: 'row', gap: 16, alignItems: 'center', marginBottom: 12 },
  photoBtn: { backgroundColor: '#F4F4F4', borderRadius: 12, paddingVertical: 10, alignItems: 'center', flex: 1 },
  photoBtnText: { fontWeight: '700' },
  label: { fontSize: 13, marginBottom: 8, fontWeight: '600' },
  input: {
    height: 48,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#F4F4F4' },
  chipOn: { backgroundColor: '#111' },
  chipText: { fontWeight: '700' },
  chipTextOn: { color: '#fff' },
});
