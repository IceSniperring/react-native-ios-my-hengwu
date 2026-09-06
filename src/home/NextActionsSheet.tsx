import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { dailyCost, formatDaily, formatMoney, holdingDays, todayISO } from '../calc';
import { useSelectableCategories } from '../catalog';
import { NativeSheet } from '../native/NativeSheet';
import { LEMON, radius, space } from '../theme';
import { useStore } from '../store';
import type { AssetStatus } from '../types';
import { STATUS_LABEL } from '../types';
import { useColors } from '../useColors';
import { AssetPicker, SupplementForm } from './NextActionsSheetParts';

/** Product-locked action labels — never「调仓」. */
export type NextActionKind = 'supplement' | 'status' | 'sell';

export const NEXT_ACTION_META: Record<
  NextActionKind,
  { lab: string; ico: string; confirmTitle: string; hint: string }
> = {
  supplement: {
    lab: '补录',
    ico: '＋',
    confirmTitle: '确认补录',
    hint: '漏记现金 / 订阅 / 物件 → 新增一条资产',
  },
  status: {
    lab: '服役·退役',
    ico: '⇄',
    confirmTitle: '服役 · 退役',
    hint: '标记服役或闲置退役（状态切换）',
  },
  sell: {
    lab: '卖出',
    ico: '¥',
    confirmTitle: '确认卖出',
    hint: '记卖出回笼，净资产随之刷新',
  },
};

type Phase = 'confirm' | 'result';

type ResultPayload = {
  emoji: string;
  title: string;
  detail: string;
};

type Props = {
  visible: boolean;
  action: NextActionKind | null;
  /** Prefill asset picker when opened from recommended CTA. */
  preferredAssetId?: string;
  onClose: () => void;
};

export function NextActionsSheet({ visible, action, preferredAssetId, onClose }: Props) {
  const c = useColors();
  const assets = useStore((s) => s.assets);
  const addAsset = useStore((s) => s.addAsset);
  const updateAsset = useStore((s) => s.updateAsset);
  const cats = useSelectableCategories();

  const [phase, setPhase] = useState<Phase>('confirm');
  const [result, setResult] = useState<ResultPayload | null>(null);

  const [name, setName] = useState('索尼 WH-1000XM5');
  const [price, setPrice] = useState('2299');
  const [category, setCategory] = useState('digital');

  const [assetId, setAssetId] = useState<string | null>(null);
  const [sellPrice, setSellPrice] = useState('');

  const statusCandidates = useMemo(
    () => assets.filter((a) => a.status === 'active' || a.status === 'retired'),
    [assets],
  );
  const sellCandidates = useMemo(
    () => assets.filter((a) => a.status !== 'sold'),
    [assets],
  );

  const selected = useMemo(
    () => assets.find((a) => a.id === assetId) ?? null,
    [assets, assetId],
  );

  useEffect(() => {
    if (!visible || !action) return;
    setPhase('confirm');
    setResult(null);
    setName('索尼 WH-1000XM5');
    setPrice('2299');
    setCategory('digital');

    if (action === 'status') {
      const prefer =
        (preferredAssetId
          ? statusCandidates.find((a) => a.id === preferredAssetId)
          : null) ??
        statusCandidates.find((a) => a.status === 'active') ??
        statusCandidates[0] ??
        null;
      setAssetId(prefer?.id ?? null);
    } else if (action === 'sell') {
      const prefer =
        (preferredAssetId
          ? sellCandidates.find((a) => a.id === preferredAssetId)
          : null) ??
        sellCandidates.find((a) => a.status === 'active' || a.status === 'retired') ??
        sellCandidates[0] ??
        null;
      setAssetId(prefer?.id ?? null);
      if (prefer) {
        const seeded =
          typeof prefer.soldPrice === 'number' && prefer.soldPrice > 0
            ? prefer.soldPrice
            : Math.round(prefer.purchasePrice * 0.6);
        setSellPrice(String(seeded));
      } else {
        setSellPrice('');
      }
    } else {
      setAssetId(null);
      setSellPrice('');
    }
  }, [visible, action, preferredAssetId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (action !== 'sell' || !selected) return;
    const seeded =
      typeof selected.soldPrice === 'number' && selected.soldPrice > 0
        ? selected.soldPrice
        : Math.round(selected.purchasePrice * 0.6);
    setSellPrice(String(seeded));
  }, [action, selected?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const meta = action ? NEXT_ACTION_META[action] : null;
  const title = phase === 'result' ? '结果' : meta?.confirmTitle ?? '下一步';

  const close = () => {
    setPhase('confirm');
    setResult(null);
    onClose();
  };

  const cycleCategory = () => {
    if (!cats.length) return;
    const idx = cats.findIndex((x) => x.id === category);
    const next = cats[(idx + 1) % cats.length]!;
    setCategory(next.id);
  };

  const canExecute = (): boolean => {
    if (!action) return false;
    if (action === 'supplement') {
      return Boolean(name.trim()) && Number(price) > 0;
    }
    if (action === 'status') {
      return Boolean(selected);
    }
    if (action === 'sell') {
      return Boolean(selected) && sellPrice !== '' && Number.isFinite(Number(sellPrice));
    }
    return false;
  };

  const execute = () => {
    if (!action || !canExecute()) return;

    if (action === 'supplement') {
      const amt = Number(price);
      addAsset({
        name: name.trim(),
        category: category || 'uncategorized',
        status: 'active',
        purchasePrice: amt,
        purchaseDate: todayISO(),
        targetDailyCost: amt / 365,
        expectedDays: 365,
        note: '补录',
        costMode: 'day',
        targetMode: 'none',
      });
      setResult({
        emoji: '＋',
        title: '已记入资产',
        detail: `「${name.trim()}」· ${formatMoney(amt, 0)} · 补录`,
      });
      setPhase('result');
      return;
    }

    if (action === 'status' && selected) {
      const nextStatus: AssetStatus = selected.status === 'active' ? 'retired' : 'active';
      const patch =
        nextStatus === 'retired'
          ? { status: 'retired' as const, retiredDate: todayISO() }
          : { status: 'active' as const, retiredDate: undefined };
      updateAsset(selected.id, patch);
      const days = holdingDays(selected);
      const cost = dailyCost(selected);
      setResult({
        emoji: '⇄',
        title: nextStatus === 'retired' ? '已标记退役' : '已恢复服役',
        detail: `${selected.name} · 服役 ${days} 天 · ${formatDaily(cost)}`,
      });
      setPhase('result');
      return;
    }

    if (action === 'sell' && selected) {
      const sold = Number(sellPrice) || 0;
      updateAsset(selected.id, {
        status: 'sold',
        soldPrice: sold,
        soldDate: todayISO(),
      });
      setResult({
        emoji: '↗',
        title: '已记卖出',
        detail: `${selected.name} · 卖出 ${formatMoney(sold, 0)} · 成本 ${formatMoney(selected.purchasePrice, 0)}`,
      });
      setPhase('result');
    }
  };

  const onPrimary = () => {
    if (phase === 'confirm') {
      execute();
      return;
    }
    close();
  };

  return (
    <NativeSheet
      visible={visible && !!action}
      onClose={close}
      title={title}
      trailing={
        <Pressable onPress={close} hitSlop={12} accessibilityLabel="关闭">
          <Text style={[styles.done, { color: c.limeDark }]}>关闭</Text>
        </Pressable>
      }>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}>
        {phase === 'confirm' && action && meta ? (
          <>
            <Text style={[styles.hint, { color: c.textSecondary }]}>{meta.hint}</Text>

            {action === 'supplement' ? (
              <SupplementForm
                name={name}
                price={price}
                category={category}
                onName={setName}
                onPrice={setPrice}
                onCycleCategory={cycleCategory}
              />
            ) : null}

            {action === 'status' ? (
              <AssetPicker
                label="选择要切换状态的资产"
                assets={statusCandidates}
                selectedId={assetId}
                onSelect={setAssetId}
                emptyText="没有可切换的服役/退役资产"
                renderMeta={(a) =>
                  a.status === 'active' ? '服役中 → 将标记退役' : '已退役 → 将恢复服役'
                }
              />
            ) : null}

            {action === 'sell' ? (
              <>
                <AssetPicker
                  label="选择要卖出的资产"
                  assets={sellCandidates}
                  selectedId={assetId}
                  onSelect={setAssetId}
                  emptyText="没有可卖出的资产"
                  renderMeta={(a) =>
                    `${STATUS_LABEL[a.status]} · 成本 ${formatMoney(a.purchasePrice, 0)}`
                  }
                />
                {selected ? (
                  <View style={{ marginTop: 14 }}>
                    <Text style={[styles.fieldLabel, { color: c.textSecondary }]}>卖出价格</Text>
                    <TextInput
                      value={sellPrice}
                      onChangeText={setSellPrice}
                      keyboardType="decimal-pad"
                      placeholder="0"
                      placeholderTextColor={c.textTertiary}
                      style={[
                        styles.input,
                        { backgroundColor: c.input, color: c.text, borderColor: c.line },
                      ]}
                    />
                    <Text style={[styles.subHint, { color: c.textTertiary }]}>
                      买入 {formatMoney(selected.purchasePrice, 0)} · 默认约六成回笼
                    </Text>
                  </View>
                ) : null}
              </>
            ) : null}
          </>
        ) : null}

        {phase === 'result' && result ? (
          <View style={[styles.resultCard, { backgroundColor: c.input }]}>
            <Text style={styles.resultEmoji}>{result.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.resultTitle, { color: c.text }]}>{result.title}</Text>
              <Text style={[styles.resultDetail, { color: c.textSecondary }]}>{result.detail}</Text>
            </View>
          </View>
        ) : null}

        {phase === 'result' ? (
          <Text style={[styles.hint, { color: c.textSecondary, marginTop: 12 }]}>
            已写入账本，关闭后总览净资产会自动刷新。
          </Text>
        ) : null}

        <Pressable
          disabled={phase === 'confirm' && !canExecute()}
          onPress={onPrimary}
          accessibilityRole="button"
          accessibilityLabel={phase === 'confirm' ? '确认执行' : '完成'}
          style={({ pressed }) => [
            styles.primary,
            {
              backgroundColor: LEMON,
              opacity: phase === 'confirm' && !canExecute() ? 0.45 : pressed ? 0.88 : 1,
            },
          ]}>
          <Text style={styles.primaryText}>{phase === 'confirm' ? '确认执行' : '完成'}</Text>
        </Pressable>

        {phase === 'confirm' ? (
          <Pressable onPress={close} style={styles.secondaryBtn} accessibilityRole="button">
            <Text style={{ color: c.textSecondary, fontSize: 15 }}>取消</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </NativeSheet>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: space.pageX,
    paddingBottom: 8,
  },
  done: { fontSize: 17, fontWeight: '600', paddingHorizontal: 8 },
  hint: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  input: {
    height: 48,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    fontSize: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  subHint: { marginTop: 8, fontSize: 12 },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: radius.lg,
    padding: 16,
  },
  resultEmoji: { fontSize: 32 },
  resultTitle: { fontSize: 17, fontWeight: '700' },
  resultDetail: { marginTop: 4, fontSize: 13, lineHeight: 18 },
  primary: {
    marginTop: 18,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { fontSize: 17, fontWeight: '700', color: '#111111' },
  secondaryBtn: { marginTop: 12, alignItems: 'center', paddingVertical: 8 },
});
