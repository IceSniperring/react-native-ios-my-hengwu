import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import type { SFSymbol } from 'expo-symbols';
import { useEffect, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { parseISO, toISO, todayISO } from '../../src/calc';
import { GlassIconButton } from '../../src/components/GlassIconButton';
import { StickerImage } from '../../src/components/StickerImage';
import { NativeMenu } from '../../src/native/NativeMenu';
import { PlatformIcon } from '../../src/native/PlatformIcon';
import { NativeSegmented } from '../../src/native/NativeSegmented';
import { NativeSheet } from '../../src/native/NativeSheet';
import { pickAssetImage, takeAssetPhoto } from '../../src/pickImage';
import { useCategoryLabel } from '../../src/catalog';
import { LIME } from '../../src/theme';
import { useStore } from '../../src/store';
import { useColors } from '../../src/useColors';
import { type ProductKey } from '../../src/types';

type AssetType = 'asset' | 'wish';
const COST_MODES = ['按天', '按次', '自定义'] as const;
const TARGET_MODES = ['不设定', '按价格', '按日期', '自定义'] as const;
const COST_IDS = ['day', 'count', 'custom'] as const;
const TARGET_IDS = ['none', 'price', 'date', 'custom'] as const;
const CHROME_PAD = 10;
const CHROME_ROW = 40;
const FADE_HEIGHT = 28;

export default function AssetForm() {
  const { id, kind: kindParam } = useLocalSearchParams<{ id?: string; kind?: string }>();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const scheme = useStore((s) => s.colorScheme);
  const existing = useStore((s) => s.assets.find((a) => a.id === id));
  const addAsset = useStore((s) => s.addAsset);
  const updateAsset = useStore((s) => s.updateAsset);
  const addWish = useStore((s) => s.addWish);
  const addTag = useStore((s) => s.addTag);
  const asWish = kindParam === 'wish' && !existing;

  const [name, setName] = useState(existing?.name ?? '');
  const [price, setPrice] = useState(existing ? String(existing.purchasePrice) : '');
  const [date, setDate] = useState(existing?.purchaseDate ?? todayISO());
  const [category, setCategory] = useState(existing?.category ?? 'digital');
  const [kind, setKind] = useState<AssetType>(asWish ? 'wish' : 'asset');
  const [costMode, setCostMode] = useState(
    Math.max(0, COST_IDS.indexOf((existing?.costMode ?? 'day') as (typeof COST_IDS)[number])),
  );
  const [targetMode, setTargetMode] = useState(
    Math.max(0, TARGET_IDS.indexOf((existing?.targetMode ?? 'none') as (typeof TARGET_IDS)[number])),
  );
  const [target, setTarget] = useState(existing ? String(existing.targetDailyCost) : '');
  const [expected, setExpected] = useState(existing ? String(existing.expectedDays) : '');
  const [tags, setTags] = useState<string[]>(existing?.tags ?? []);
  const [imageKey, setImageKey] = useState<ProductKey | undefined>(existing?.imageKey);
  const [imageUri, setImageUri] = useState<string | undefined>(existing?.imageUri);
  const [lifting, setLifting] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const tagPickerResult = useStore((s) => s.tagPickerResult);
  const categoryPickerResult = useStore((s) => s.categoryPickerResult);
  const beginTagPicker = useStore((s) => s.beginTagPicker);
  const beginCategoryPicker = useStore((s) => s.beginCategoryPicker);
  const clearTagPickerResult = useStore((s) => s.clearTagPickerResult);
  const clearCategoryPickerResult = useStore((s) => s.clearCategoryPickerResult);

  useEffect(() => {
    if (!tagPickerResult) return;
    setTags(tagPickerResult);
    clearTagPickerResult();
  }, [tagPickerResult, clearTagPickerResult]);

  useEffect(() => {
    if (!categoryPickerResult) return;
    setCategory(categoryPickerResult);
    clearCategoryPickerResult();
  }, [categoryPickerResult, clearCategoryPickerResult]);
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });
  const fadeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(Math.max(scrollY.value, 0), [0, 14], [0, 1], Extrapolation.CLAMP),
  }));

  const save = () => {
    const purchasePrice = Number(price);
    if (!name.trim()) return Alert.alert('请填写名称');
    if (!purchasePrice || purchasePrice <= 0) return Alert.alert(kind === 'wish' ? '请填写目标价格' : '请填写买入价');
    if (kind === 'asset' && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return Alert.alert('日期格式 YYYY-MM-DD');

    for (const t of tags) addTag(t);

    if (kind === 'wish' && !existing) {
      addWish({
        name: name.trim(),
        targetPrice: purchasePrice,
        saved: 0,
        category,
        imageKey,
        imageUri,
        tags,
      });
      router.back();
      return;
    }

    const targetDailyCost = Number(target);
    const expectedDays = Number(expected);
    const payload = {
      name: name.trim(),
      purchasePrice,
      purchaseDate: date,
      category,
      targetDailyCost: targetDailyCost > 0 ? targetDailyCost : purchasePrice / 365,
      expectedDays: expectedDays > 0 ? expectedDays : 365,
      imageKey,
      imageUri,
      status: existing?.status ?? ('active' as const),
      starred: existing?.starred,
      soldPrice: existing?.soldPrice,
      soldDate: existing?.soldDate,
      retiredDate: existing?.retiredDate,
      tags,
      costMode: COST_IDS[costMode],
      targetMode: TARGET_IDS[targetMode],
    };
    if (existing) {
      updateAsset(existing.id, payload);
      router.back();
    } else {
      const newId = addAsset(payload);
      router.replace(`/asset/${newId}`);
    }
  };

  const pickFromMenu = async (id: string) => {
    setLifting(true);
    try {
      const uri = id === 'camera' ? await takeAssetPhoto() : await pickAssetImage();
      if (uri) {
        setImageUri(uri);
        setImageKey(undefined);
      }
    } finally {
      setLifting(false);
    }
  };

  const categoryLabel = useCategoryLabel(category);
  const dateLabel = (() => {
    const d = parseISO(date);
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  })();
  const cardBg = c.card;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: c.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingTop: CHROME_PAD + CHROME_ROW + 8,
          paddingBottom: insets.bottom + 48,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View>
            <StickerImage imageKey={imageKey} imageUri={imageUri} size={108} radius={22} />
            {lifting ? (
              <View style={styles.liftingMask}>
                <ActivityIndicator color={LIME} />
              </View>
            ) : null}
          </View>
          <NativeMenu
            style={styles.changeIconMenu}
            title="更换图标"
            actions={[
              { id: 'camera', title: '拍照', image: 'camera' },
              { id: 'library', title: '从相册选择', image: 'photo' },
            ]}
            onSelect={(id) => {
              if (!lifting) void pickFromMenu(id);
            }}>
            <View style={[styles.changeIconBtn, { backgroundColor: c.chip }]}>
              <PlatformIcon name="arrow.triangle.2.circlepath" size={13} color={c.textSecondary} />
              <Text style={[styles.changeIconText, { color: c.textSecondary }]}>
                {lifting ? '正在抠图…' : '更换图标'}
              </Text>
            </View>
          </NativeMenu>
        </View>

        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <FieldRow icon="square.grid.2x2" label="名称" c={c}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="例如 MacBook Pro"
              placeholderTextColor={c.textTertiary}
              style={[styles.valueInput, { color: c.text }]}
            />
          </FieldRow>
          <FieldRow icon="yensign.circle" label={kind === 'wish' ? '目标价格' : '价格'} c={c}>
            <TextInput
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={c.textTertiary}
              style={[styles.valueInput, { color: c.text }]}
            />
          </FieldRow>
          <FieldRow icon="point.3.connected.trianglepath.dotted" label="类型" c={c} last>
            <NativeSegmented
              compact
              style={styles.typeSeg}
              values={['资产', '心愿']}
              selectedIndex={kind === 'asset' ? 0 : 1}
              onChange={(i) => setKind(i === 0 ? 'asset' : 'wish')}
            />
          </FieldRow>
        </View>

        <View style={[styles.card, { backgroundColor: cardBg }]}>
          {kind === 'asset' ? (
            <Pressable onPress={() => setDateOpen(true)}>
              <FieldRow icon="calendar" label="购买日期" c={c} chevron>
                <Text style={[styles.valueText, { color: c.text }]}>{dateLabel}</Text>
              </FieldRow>
            </Pressable>
          ) : null}
          <Pressable
            onPress={() => {
              beginCategoryPicker(category);
              router.push('/pick/category');
            }}>
            <FieldRow icon="square.grid.2x2" label="类别" c={c} chevron>
              <Text style={[styles.valueText, { color: c.text }]}>{categoryLabel}</Text>
            </FieldRow>
          </Pressable>
          <Pressable
            onPress={() => {
              beginTagPicker(tags);
              router.push('/pick/tags');
            }}>
            <FieldRow icon="tag" label="标签" c={c} last chevron>
              <Text
                style={[styles.valueText, { color: tags.length ? c.text : c.textTertiary }]}
                numberOfLines={1}>
                {tags.length ? tags.join('、') : '选择'}
              </Text>
            </FieldRow>
          </Pressable>
        </View>

        {kind === 'asset' ? (
          <>
            <View style={[styles.card, { backgroundColor: cardBg }]}>
              <FieldRow icon="calendar.badge.clock" label="成本计算规则" c={c} last />
              <NativeSegmented
                compact
                style={styles.blockSeg}
                values={[...COST_MODES]}
                selectedIndex={costMode}
                onChange={setCostMode}
              />
            </View>

            <View style={[styles.card, { backgroundColor: cardBg }]}>
              <View style={styles.targetHead}>
                <PlatformIcon name="scope" size={16} color={c.textSecondary} />
                <Text style={[styles.fieldLabel, { color: c.text }]}>目标日均</Text>
                <View style={[styles.limeDot, { backgroundColor: LIME }]}>
                  <PlatformIcon name="checkmark" size={11} color="#111111" />
                </View>
              </View>
              <NativeSegmented
                compact
                style={styles.blockSeg}
                values={[...TARGET_MODES]}
                selectedIndex={targetMode}
                onChange={setTargetMode}
              />
              {targetMode === 3 ? (
                <TextInput
                  value={target}
                  onChangeText={setTarget}
                  keyboardType="decimal-pad"
                  placeholder="目标日均（元）"
                  placeholderTextColor={c.textTertiary}
                  style={[styles.extraInput, { color: c.text, backgroundColor: c.chip }]}
                />
              ) : null}
            </View>
          </>
        ) : null}
      </Animated.ScrollView>

      <View pointerEvents="box-none" style={[styles.chrome, { backgroundColor: c.bg }]}>
        <View pointerEvents="box-none" style={styles.chromeRow}>
          <GlassIconButton name="xmark" size={40} accessibilityLabel="关闭" onPress={() => router.back()} />
          <Text pointerEvents="none" style={[styles.chromeTitle, { color: c.text }]}>
            {existing ? '编辑资产' : kind === 'wish' ? '录入心愿' : '录入资产'}
          </Text>
          <GlassIconButton name="checkmark" size={40} accessibilityLabel="保存" onPress={save} />
        </View>
        <Animated.View pointerEvents="none" style={[styles.fade, fadeStyle]}>
          <LinearGradient
            colors={[c.bg, `${c.bg}00`]}
            locations={[0.12, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>

      <NativeSheet visible={dateOpen} onClose={() => setDateOpen(false)} title="购买日期">
        <DateTimePicker
          value={parseISO(date)}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          locale="zh-CN"
          themeVariant={scheme}
          style={styles.picker}
          onChange={(_, next) => {
            if (next) setDate(toISO(next));
            if (Platform.OS !== 'ios') setDateOpen(false);
          }}
        />
      </NativeSheet>
    </KeyboardAvoidingView>
  );
}

function FieldRow({
  icon,
  label,
  c,
  children,
  last,
  chevron,
}: {
  icon: SFSymbol;
  label: string;
  c: { text: string; textSecondary: string; line: string; textTertiary: string };
  children?: ReactNode;
  last?: boolean;
  chevron?: boolean;
}) {
  return (
    <View
      style={[
        styles.fieldRow,
        !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.line },
      ]}>
      <PlatformIcon name={icon} size={16} color={c.textSecondary} />
      <Text style={[styles.fieldLabel, { color: c.text }]}>{label}</Text>
      <View style={styles.fieldValue}>{children}</View>
      {chevron ? <PlatformIcon name="chevron.right" size={16} color={c.textTertiary} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  chrome: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingHorizontal: 16,
    paddingTop: CHROME_PAD,
    overflow: 'visible',
  },
  fade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -FADE_HEIGHT,
    height: FADE_HEIGHT,
  },
  chromeRow: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chromeTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 40,
    lineHeight: 40,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
  },
  heroSection: { alignItems: 'center', marginTop: 4, marginBottom: 20 },
  liftingMask: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  changeIconMenu: { alignSelf: 'center', marginTop: 12 },
  changeIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  changeIconText: { fontSize: 13, fontWeight: '500' },
  card: {
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    gap: 8,
  },
  fieldLabel: { fontSize: 15, fontWeight: '400' },
  fieldValue: { flex: 1, alignItems: 'flex-end', justifyContent: 'center' },
  valueInput: {
    minWidth: 120,
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'right',
    paddingVertical: 8,
  },
  valueText: { fontSize: 15, fontWeight: '500' },
  typeSeg: { minWidth: 148, maxWidth: 168 },
  blockSeg: { marginTop: 2, marginBottom: 12 },
  picker: { alignSelf: 'stretch' },
  targetHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
  },
  limeDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  extraInput: {
    height: 40,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    marginBottom: 10,
  },
});
