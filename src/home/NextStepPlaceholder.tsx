import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useColors } from '../useColors';
import {
  NEXT_ACTION_META,
  NextActionsSheet,
  type NextActionKind,
} from './NextActionsSheet';

const ACTIONS: NextActionKind[] = ['supplement', 'status', 'sell'];

/**
 * PR③: 下一步动作入口 — 点 CTA / 三动作条打开 Confirm Sheet，
 * 执行后写 store，总览净资产自动刷新。
 */
export function NextStepPlaceholder() {
  const c = useColors();
  const schemeDark = c.bg === '#000000';
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<NextActionKind | null>(null);
  /** CTA 先选动作，再进入对应 Sheet */
  const [picking, setPicking] = useState(false);

  const openAction = (kind: NextActionKind) => {
    setPicking(false);
    setAction(kind);
    setOpen(true);
  };

  const openPicker = () => {
    setAction(null);
    setOpen(false);
    setPicking(true);
  };

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="下一步该做什么？"
        onPress={openPicker}
        style={({ pressed }) => [
          styles.cta,
          schemeDark
            ? { backgroundColor: '#1A2408' }
            : { backgroundColor: '#EAF8A8' },
          pressed && { opacity: 0.88 },
        ]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: schemeDark ? '#EAF8A8' : '#111111' }]}>
            下一步该做什么？
          </Text>
          <Text
            style={[
              styles.desc,
              { color: schemeDark ? 'rgba(234,248,168,0.7)' : 'rgba(17,17,17,0.7)' },
            ]}>
            补录 · 服役·退役 · 卖出
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
      </Pressable>

      <View style={styles.bar}>
        {ACTIONS.map((kind) => {
          const item = NEXT_ACTION_META[kind];
          return (
            <Pressable
              key={kind}
              accessibilityRole="button"
              accessibilityLabel={item.lab}
              onPress={() => openAction(kind)}
              style={({ pressed }) => [
                styles.chip,
                { backgroundColor: c.surface },
                pressed && { opacity: 0.72 },
              ]}>
              <Text style={[styles.ico, { color: c.text }]}>{item.ico}</Text>
              <Text style={[styles.lab, { color: c.text }]}>{item.lab}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* CTA → 轻量动作选择（非第四屏） */}
      {picking ? (
        <View
          style={[
            styles.pickerCard,
            { backgroundColor: c.surface, borderColor: c.line },
          ]}>
          <Text style={[styles.pickerTitle, { color: c.text }]}>选一个下一步</Text>
          {ACTIONS.map((kind) => {
            const item = NEXT_ACTION_META[kind];
            return (
              <Pressable
                key={kind}
                onPress={() => openAction(kind)}
                style={({ pressed }) => [
                  styles.pickerRow,
                  { borderBottomColor: c.line },
                  pressed && { opacity: 0.72 },
                ]}
                accessibilityRole="button"
                accessibilityLabel={item.lab}>
                <Text style={[styles.ico, { color: c.text, marginBottom: 0 }]}>
                  {item.ico}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.pickerLab, { color: c.text }]}>{item.lab}</Text>
                  <Text style={[styles.pickerHint, { color: c.textSecondary }]}>
                    {item.hint}
                  </Text>
                </View>
                <Text style={{ color: c.textTertiary }}>›</Text>
              </Pressable>
            );
          })}
          <Pressable
            onPress={() => setPicking(false)}
            style={styles.pickerCancel}
            accessibilityRole="button">
            <Text style={{ color: c.textSecondary, fontSize: 14 }}>收起</Text>
          </Pressable>
        </View>
      ) : null}

      <NextActionsSheet
        visible={open}
        action={action}
        onClose={() => {
          setOpen(false);
          setAction(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 8, marginBottom: 4 },
  cta: {
    marginHorizontal: 0,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: { fontSize: 15, fontWeight: '700' },
  desc: { marginTop: 2, fontSize: 12 },
  go: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bar: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  ico: { fontSize: 18, marginBottom: 4 },
  lab: { fontSize: 12, fontWeight: '600' },
  pickerCard: {
    marginTop: 10,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  pickerTitle: {
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 4,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  pickerLab: { fontSize: 15, fontWeight: '600' },
  pickerHint: { marginTop: 2, fontSize: 12, lineHeight: 16 },
  pickerCancel: { alignItems: 'center', paddingVertical: 12 },
});
