import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LEMON } from '../theme';
import { useStore } from '../store';
import { useColors } from '../useColors';
import {
  NEXT_ACTION_META,
  NextActionsSheet,
  type NextActionKind,
} from './NextActionsSheet';
import {
  recommendNextAction,
  type RecommendScene,
} from './recommendNextAction';

/**
 * PR④: 同屏只推 1 个主 CTA + 其余收进「更多」。
 * Sheet 确认→结果→完成复用 NextActionsSheet；禁止「调仓」。
 */
export function NextStepPlaceholder() {
  const c = useColors();
  const schemeDark = c.bg === '#000000';
  const assets = useStore((s) => s.assets);

  const [scene, setScene] = useState<RecommendScene>('auto');
  const [moreOpen, setMoreOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<NextActionKind | null>(null);
  const [focusAssetId, setFocusAssetId] = useState<string | undefined>();

  const rec = useMemo(
    () => recommendNextAction(assets, scene === 'auto' ? 'auto' : scene),
    [assets, scene],
  );
  const primaryMeta = NEXT_ACTION_META[rec.primary];

  const openAction = (kind: NextActionKind, assetId?: string) => {
    setMoreOpen(false);
    setAction(kind);
    setFocusAssetId(assetId);
    setOpen(true);
  };

  const openPrimary = () => openAction(rec.primary, rec.focusAssetId);

  return (
    <View style={styles.wrap}>
      {__DEV__ ? (
        <View style={styles.sceneRow}>
          {(
            [
              { id: 'auto' as const, lab: '自动' },
              { id: 'A' as const, lab: '缺字段' },
              { id: 'B' as const, lab: '该退役' },
              { id: 'C' as const, lab: '有回笼价' },
            ] as const
          ).map((s) => {
            const on = scene === s.id;
            return (
              <Pressable
                key={s.id}
                onPress={() => {
                  setScene(s.id);
                  setMoreOpen(false);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                style={[
                  styles.sceneChip,
                  {
                    backgroundColor: on ? c.lemonSoft : c.surface,
                    borderColor: on ? LEMON : c.line,
                  },
                ]}>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: on ? '700' : '500',
                    color: c.text,
                  }}>
                  {s.lab}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {/* 主 CTA：大按钮 + 理由文案 */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${primaryMeta.lab}：${rec.reason}`}
        onPress={openPrimary}
        style={({ pressed }) => [
          styles.primary,
          {
            backgroundColor: schemeDark ? '#1A2408' : '#EAF8A8',
            opacity: pressed ? 0.88 : 1,
          },
        ]}>
        <View style={styles.primaryTop}>
          <Text style={[styles.primaryIco, { color: schemeDark ? '#EAF8A8' : '#111' }]}>
            {primaryMeta.ico}
          </Text>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.primaryLab,
                { color: schemeDark ? '#EAF8A8' : '#111111' },
              ]}>
              {primaryMeta.lab}
            </Text>
            <Text
              style={[
                styles.whyNow,
                {
                  color: schemeDark
                    ? 'rgba(234,248,168,0.75)'
                    : 'rgba(17,17,17,0.65)',
                },
              ]}>
              {rec.whyNow}
            </Text>
          </View>
          <View
            style={[
              styles.go,
              {
                backgroundColor: schemeDark
                  ? 'rgba(255,255,255,0.12)'
                  : 'rgba(0,0,0,0.12)',
              },
            ]}>
            <Text style={{ color: schemeDark ? '#EAF8A8' : '#111', fontSize: 16 }}>→</Text>
          </View>
        </View>
        <Text
          style={[
            styles.reason,
            {
              color: schemeDark
                ? 'rgba(234,248,168,0.85)'
                : 'rgba(17,17,17,0.78)',
            },
          ]}>
          {rec.reason}
        </Text>
      </Pressable>

      {/* 更多：弱入口，展开另两个动作 */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={moreOpen ? '收起更多动作' : '更多动作'}
        onPress={() => setMoreOpen((v) => !v)}
        style={styles.moreToggle}>
        <Text style={{ color: c.textSecondary, fontSize: 13, fontWeight: '600' }}>
          {moreOpen ? '收起' : '更多'} {moreOpen ? '▴' : '▾'}
        </Text>
      </Pressable>

      {moreOpen ? (
        <View style={styles.moreBar}>
          {rec.secondaries.map((kind) => {
            const item = NEXT_ACTION_META[kind];
            return (
              <Pressable
                key={kind}
                accessibilityRole="button"
                accessibilityLabel={item.lab}
                onPress={() => openAction(kind)}
                style={({ pressed }) => [
                  styles.moreChip,
                  { backgroundColor: c.surface, borderColor: c.line },
                  pressed && { opacity: 0.72 },
                ]}>
                <Text style={[styles.moreIco, { color: c.textSecondary }]}>{item.ico}</Text>
                <Text style={[styles.moreLab, { color: c.textSecondary }]}>{item.lab}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <NextActionsSheet
        visible={open}
        action={action}
        preferredAssetId={focusAssetId}
        onClose={() => {
          setOpen(false);
          setAction(null);
          setFocusAssetId(undefined);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 8, marginBottom: 4 },
  sceneRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  sceneChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  primary: {
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  primaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  primaryIco: { fontSize: 22, fontWeight: '700' },
  primaryLab: { fontSize: 17, fontWeight: '700' },
  whyNow: { marginTop: 2, fontSize: 12, fontWeight: '600' },
  go: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reason: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  moreToggle: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  moreBar: {
    marginTop: 6,
    flexDirection: 'row',
    gap: 8,
  },
  moreChip: {
    flex: 1,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    opacity: 0.92,
  },
  moreIco: { fontSize: 16, marginBottom: 2 },
  moreLab: { fontSize: 12, fontWeight: '600' },
});
