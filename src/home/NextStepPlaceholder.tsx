import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useColors } from '../useColors';

/**
 * PR② only: UI placeholder for next-step actions.
 * Confirm Sheets / full flows land in PR③ — keep disabled.
 */
export function NextStepPlaceholder() {
  const c = useColors();
  const schemeDark = c.bg === '#000000';

  return (
    <View style={styles.wrap}>
      <Pressable
        disabled
        accessibilityRole="button"
        accessibilityState={{ disabled: true }}
        accessibilityLabel="下一步该做什么？即将开放"
        style={[
          styles.cta,
          schemeDark
            ? { backgroundColor: '#1A2408' }
            : { backgroundColor: '#EAF8A8' },
        ]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: schemeDark ? '#EAF8A8' : '#111111' }]}>
            下一步该做什么？
          </Text>
          <Text style={[styles.desc, { color: schemeDark ? 'rgba(234,248,168,0.7)' : 'rgba(17,17,17,0.7)' }]}>
            补录 · 服役·退役 · 卖出（PR③）
          </Text>
        </View>
        <View style={[styles.go, { backgroundColor: schemeDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)' }]}>
          <Text style={{ color: schemeDark ? '#EAF8A8' : '#111', fontSize: 16 }}>→</Text>
        </View>
      </Pressable>

      <View style={styles.bar}>
        {[
          { ico: '＋', lab: '补录' },
          { ico: '⇄', lab: '服役·退役' },
          { ico: '¥', lab: '卖出' },
        ].map((item) => (
          <Pressable
            key={item.lab}
            disabled
            accessibilityRole="button"
            accessibilityState={{ disabled: true }}
            accessibilityLabel={`${item.lab}（即将开放）`}
            style={[styles.chip, { backgroundColor: c.surface, opacity: 0.55 }]}>
            <Text style={[styles.ico, { color: c.text }]}>{item.ico}</Text>
            <Text style={[styles.lab, { color: c.text }]}>{item.lab}</Text>
          </Pressable>
        ))}
      </View>
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
    opacity: 0.72,
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
});
