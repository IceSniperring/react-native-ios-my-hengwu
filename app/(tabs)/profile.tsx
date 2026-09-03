import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useOverview } from '../../src/hooks';
import { showNativeSheet } from '../../src/native/sheet';
import { useStore } from '../../src/store';
import { radius } from '../../src/theme';
import { useColors } from '../../src/useColors';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const c = useColors();
  const overview = useOverview();
  const wishes = useStore((s) => s.wishes);
  const plans = useStore((s) => s.plans);
  const scheme = useStore((s) => s.colorScheme);
  const setColorScheme = useStore((s) => s.setColorScheme);
  const restoreDemo = useStore((s) => s.restoreDemo);
  const clearAll = useStore((s) => s.clearAll);
  const dark = scheme === 'dark';

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="never"
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={[styles.root, { paddingTop: insets.top }]}>
      <Text style={[styles.title, { color: c.text }]}>我的</Text>
      <View style={styles.hero}>
        <View style={[styles.avatar, { backgroundColor: c.tint }]}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: '#FFFFFF' }}>有</Text>
        </View>
        <View>
          <Text style={[styles.name, { color: c.text }]}>有数 · 本地账本</Text>
          <Text style={[styles.meta, { color: c.textSecondary }]}>数据只存在这台手机</Text>
        </View>
      </View>

      <View style={[styles.stats, { backgroundColor: c.input }]}>
        <Stat n={overview.assets.length} l="资产" color={c.text} muted={c.textSecondary} />
        <Stat n={wishes.length} l="心愿" color={c.text} muted={c.textSecondary} />
        <Stat n={plans.length} l="攒钱计划" color={c.text} muted={c.textSecondary} />
      </View>

      <View style={[styles.row, { borderBottomColor: c.line }]}>
        <SymbolView name="moon.fill" size={20} tintColor={c.text} />
        <Text style={[styles.rowText, { color: c.text }]}>深色模式</Text>
        <Switch
          value={dark}
          onValueChange={(v) => setColorScheme(v ? 'dark' : 'light')}
          trackColor={{ false: '#E5E5EA', true: c.tint }}
          thumbColor="#FFFFFF"
          ios_backgroundColor="#E5E5EA"
        />
      </View>

      <Row icon="leaf" label="智能攒钱计划" color={c.text} chevron={c.textTertiary} line={c.line} onPress={() => router.push('/savings')} />
      <Row icon="calendar" label="购入日历" color={c.text} chevron={c.textTertiary} line={c.line} onPress={() => router.push('/calendar')} />
      <Row
        icon="arrow.counterclockwise"
        label="恢复演示数据"
        color={c.text}
        chevron={c.textTertiary}
        line={c.line}
        onPress={() =>
          showNativeSheet({
            title: '恢复演示数据',
            message: '当前数据会被覆盖。',
            items: [{ label: '恢复', destructive: true, onPress: restoreDemo }],
          })
        }
      />
      <Row
        icon="trash"
        label="清空全部数据"
        color={c.danger}
        chevron={c.textTertiary}
        line={c.line}
        onPress={() =>
          showNativeSheet({
            title: '清空数据',
            message: '所有资产、心愿和攒钱计划都会删除。',
            items: [{ label: '清空', destructive: true, onPress: clearAll }],
          })
        }
      />

      <Text style={[styles.foot, { color: c.textTertiary }]}>
        有数 · 像素级复刻学习版{'\n'}买入 · 服役 · 退役 · 卖出，让每一件物品心中有数
      </Text>
    </ScrollView>
  );
}

function Stat({ n, l, color, muted }: { n: number; l: string; color: string; muted: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ fontSize: 22, fontWeight: '800', color }}>{n}</Text>
      <Text style={{ fontSize: 12, color: muted, marginTop: 4 }}>{l}</Text>
    </View>
  );
}

function Row({
  icon,
  label,
  onPress,
  color,
  chevron,
  line,
}: {
  icon: 'leaf' | 'calendar' | 'arrow.counterclockwise' | 'trash';
  label: string;
  onPress: () => void;
  color: string;
  chevron: string;
  line: string;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.row, { borderBottomColor: line }]}>
      <SymbolView name={icon} size={20} tintColor={color} />
      <Text style={[styles.rowText, { color }]}>{label}</Text>
      <SymbolView name="chevron.right" size={14} tintColor={chevron} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { paddingHorizontal: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 16 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 18 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 18, fontWeight: '800' },
  meta: { marginTop: 4, fontSize: 13 },
  stats: {
    flexDirection: 'row',
    borderRadius: radius.lg,
    paddingVertical: 16,
    marginBottom: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 52,
  },
  rowText: { flex: 1, fontSize: 16, fontWeight: '600' },
  foot: { marginTop: 28, textAlign: 'center', lineHeight: 20, fontSize: 12 },
});
