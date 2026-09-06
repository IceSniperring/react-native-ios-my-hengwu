import { router } from 'expo-router';
import { useMemo } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatMoney } from '../../src/calc';
import { GlassIconButton } from '../../src/components/GlassIconButton';
import { useCategoryLabel } from '../../src/catalog';
import { PlatformIcon } from '../../src/native/PlatformIcon';
import { LEMON, space } from '../../src/theme';
import { useStore } from '../../src/store';
import { CATEGORIES } from '../../src/types';
import { useColors } from '../../src/useColors';

const CAT_OPTIONS = CATEGORIES.filter((c) => c.id !== 'all');

export default function IngressConfirm() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const drafts = useStore((s) => s.ingressDrafts);
  const meta = useStore((s) => s.ingressMeta);
  const updateIngressDraft = useStore((s) => s.updateIngressDraft);
  const removeIngressDraft = useStore((s) => s.removeIngressDraft);
  const clearIngressDrafts = useStore((s) => s.clearIngressDrafts);
  const addAssets = useStore((s) => s.addAssets);

  const total = useMemo(
    () => drafts.reduce((sum, d) => sum + (Number(d.purchasePrice) || 0), 0),
    [drafts],
  );

  const commit = () => {
    if (!drafts.length) {
      Alert.alert('没有可入账条目');
      return;
    }
    for (const d of drafts) {
      if (!d.name.trim()) {
        Alert.alert('请填写名称', '每条草稿都需要名称。');
        return;
      }
      if (!d.purchasePrice || d.purchasePrice <= 0) {
        Alert.alert('请填写金额', `「${d.name || '未命名'}」金额需大于 0。`);
        return;
      }
    }
    addAssets(
      drafts.map((d) => ({
        name: d.name.trim(),
        category: d.category || 'uncategorized',
        status: 'active' as const,
        purchasePrice: Number(d.purchasePrice),
        purchaseDate: d.purchaseDate,
        targetDailyCost: Number(d.purchasePrice) / 365,
        expectedDays: 365,
        note: d.note,
        costMode: 'day' as const,
        targetMode: 'none' as const,
      })),
    );
    clearIngressDrafts();
    router.replace('/(tabs)');
  };

  if (!drafts.length) {
    return (
      <View style={[styles.root, { backgroundColor: c.bg, paddingTop: insets.top }]}>
        <View style={styles.chrome}>
          <GlassIconButton name="chevron.left" size={40} accessibilityLabel="返回" onPress={() => router.back()} />
          <Text style={[styles.navTitle, { color: c.text }]}>解析确认</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.empty}>
          <Text style={[styles.emptyTitle, { color: c.text }]}>暂无草稿</Text>
          <Text style={{ color: c.textSecondary, marginTop: 8 }}>请返回重新选择入账方式</Text>
          <Pressable
            onPress={() => router.replace('/ingress')}
            style={[styles.primary, { backgroundColor: LEMON, marginTop: 24 }]}>
            <Text style={styles.primaryText}>返回入账</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: c.bg, paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.chrome}>
        <GlassIconButton name="chevron.left" size={40} accessibilityLabel="返回" onPress={() => router.back()} />
        <Text style={[styles.navTitle, { color: c.text }]}>{meta?.title ?? '解析确认'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: space.pageX,
          paddingBottom: insets.bottom + 120,
        }}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.badge, { backgroundColor: c.lemonSoft }]}>
          <Text style={[styles.badgeText, { color: c.text }]}>●  {meta?.badge ?? '待确认'}</Text>
        </View>

        <View style={[styles.summary, { backgroundColor: c.surface }]}>
          <View style={styles.summaryRow}>
            <Text style={{ color: c.textSecondary }}>条目</Text>
            <Text style={{ color: c.text, fontWeight: '600' }}>{drafts.length} 条</Text>
          </View>
          <View style={[styles.summaryRow, { marginTop: 8 }]}>
            <Text style={{ color: c.textSecondary }}>合计金额</Text>
            <Text style={{ color: c.text, fontWeight: '700', fontSize: 17 }}>{formatMoney(total, 0)}</Text>
          </View>
        </View>

        {drafts.map((d) => (
          <DraftCard
            key={d.key}
            draftKey={d.key}
            name={d.name}
            price={d.purchasePrice}
            category={d.category}
            note={d.note}
            onChange={updateIngressDraft}
            onRemove={removeIngressDraft}
          />
        ))}
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: c.bg,
            paddingBottom: Math.max(insets.bottom, 12) + 8,
            borderTopColor: c.line,
          },
        ]}>
        <Pressable
          onPress={commit}
          style={({ pressed }) => [styles.primary, { backgroundColor: LEMON, opacity: pressed ? 0.88 : 1 }]}>
          <Text style={styles.primaryText}>确认入账，回到首页</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            clearIngressDrafts();
            router.replace('/ingress');
          }}
          style={styles.secondaryBtn}>
          <Text style={{ color: c.textSecondary, fontSize: 15 }}>重新选择方式</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function DraftCard({
  draftKey,
  name,
  price,
  category,
  note,
  onChange,
  onRemove,
}: {
  draftKey: string;
  name: string;
  price: number;
  category: string;
  note?: string;
  onChange: (key: string, patch: { name?: string; purchasePrice?: number; category?: string }) => void;
  onRemove: (key: string) => void;
}) {
  const c = useColors();
  const label = useCategoryLabel(category);

  const cycleCategory = () => {
    const idx = CAT_OPTIONS.findIndex((x) => x.id === category);
    const next = CAT_OPTIONS[(idx + 1) % CAT_OPTIONS.length]!;
    onChange(draftKey, { category: next.id });
  };

  return (
    <View style={[styles.card, { backgroundColor: c.surface }]}>
      <View style={styles.cardHead}>
        <Text style={[styles.cardNote, { color: c.textSecondary }]} numberOfLines={1}>
          {note || '草稿'}
        </Text>
        <Pressable onPress={() => onRemove(draftKey)} hitSlop={8} accessibilityLabel="删除此条">
          <PlatformIcon name="trash" size={16} color={c.danger} />
        </Pressable>
      </View>
      <TextInput
        value={name}
        onChangeText={(t) => onChange(draftKey, { name: t })}
        placeholder="资产名称"
        placeholderTextColor={c.textTertiary}
        style={[styles.nameInput, { color: c.text, borderBottomColor: c.line }]}
      />
      <View style={styles.metaRow}>
        <Text style={{ color: c.textSecondary, fontSize: 14 }}>金额</Text>
        <TextInput
          value={price ? String(price) : ''}
          onChangeText={(t) => {
            const n = Number(t.replace(/[^\d.]/g, ''));
            onChange(draftKey, { purchasePrice: Number.isFinite(n) ? n : 0 });
          }}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={c.textTertiary}
          style={[styles.priceInput, { color: c.text }]}
        />
      </View>
      <Pressable onPress={cycleCategory} style={styles.metaRow}>
        <Text style={{ color: c.textSecondary, fontSize: 14 }}>分类</Text>
        <View style={styles.catValue}>
          <Text style={{ color: c.text, fontSize: 15, fontWeight: '500' }}>{label}</Text>
          <PlatformIcon name="chevron.right" size={14} color={c.textTertiary} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  chrome: {
    paddingHorizontal: space.pageX,
    paddingTop: 10,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navTitle: { fontSize: 17, fontWeight: '600' },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 12,
  },
  badgeText: { fontSize: 13, fontWeight: '600' },
  summary: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  card: {
    borderRadius: 20,
    padding: 14,
    marginBottom: 10,
  },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardNote: { fontSize: 12, flex: 1, marginRight: 8 },
  nameInput: {
    marginTop: 8,
    fontSize: 17,
    fontWeight: '600',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  metaRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceInput: {
    minWidth: 100,
    textAlign: 'right',
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 4,
  },
  catValue: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: space.pageX,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  primary: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { fontSize: 17, fontWeight: '700', color: '#111111' },
  secondaryBtn: { marginTop: 12, alignItems: 'center', paddingVertical: 6 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '600' },
});
