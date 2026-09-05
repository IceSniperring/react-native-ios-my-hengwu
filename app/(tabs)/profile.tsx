import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';

import { GroupedRow, GroupedSection } from '../../src/components/GroupedList';
import { LargeTitleScreen } from '../../src/components/LargeTitleScreen';
import { useOverview } from '../../src/hooks';
import { LIME } from '../../src/theme';
import { useStore } from '../../src/store';
import { useColors } from '../../src/useColors';

export default function ProfileScreen() {
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
    <LargeTitleScreen title="我的">
      <GroupedSection>
        <View style={styles.hero}>
          <View style={[styles.avatar, { backgroundColor: LIME }]}>
            <Text style={styles.avatarGlyph}>衡</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.name, { color: c.text }]}>衡物 · 本地账本</Text>
            <Text style={[styles.meta, { color: c.textSecondary }]}>数据只存在这台手机</Text>
          </View>
        </View>
      </GroupedSection>

      <GroupedSection>
        <View style={styles.stats}>
          <Stat n={overview.assets.length} l="资产" color={c.text} muted={c.textSecondary} />
          <View style={[styles.statRule, { backgroundColor: c.line }]} />
          <Stat n={wishes.length} l="心愿" color={c.text} muted={c.textSecondary} />
          <View style={[styles.statRule, { backgroundColor: c.line }]} />
          <Stat n={plans.length} l="攒钱计划" color={c.text} muted={c.textSecondary} />
        </View>
      </GroupedSection>

      <GroupedSection header="外观">
        <GroupedRow
          icon="moon.fill"
          iconBg="#5856D6"
          label="深色模式"
          chevron={false}
          accessory={
            <Switch
              value={dark}
              onValueChange={(v) => {
                Haptics.selectionAsync();
                setColorScheme(v ? 'dark' : 'light');
              }}
              trackColor={{ false: c.track, true: LIME }}
              thumbColor="#FFFFFF"
              ios_backgroundColor={c.track}
            />
          }
        />
      </GroupedSection>

      <GroupedSection header="工具">
        <GroupedRow
          icon="leaf"
          iconBg={LIME}
          iconTint="#1C1C1E"
          label="智能攒钱计划"
          onPress={() => router.push('/savings')}
        />
        <GroupedRow
          icon="calendar"
          iconBg="#FF9500"
          label="购入日历"
          onPress={() => router.push('/calendar')}
        />
      </GroupedSection>

      <GroupedSection header="管理">
        <GroupedRow
          icon="square.grid.2x2"
          iconBg="#007AFF"
          label="分类"
          onPress={() => router.push('/manage/categories')}
        />
        <GroupedRow
          icon="tag"
          iconBg="#AF52DE"
          label="标签"
          onPress={() => router.push('/manage/tags')}
        />
      </GroupedSection>

      <GroupedSection header="数据" footer="衡物是本地资产账本。买入 · 服役 · 退役 · 卖出，把每件物品放上秤。">
        <GroupedRow
          icon="arrow.counterclockwise"
          iconBg="#8E8E93"
          label="恢复演示数据"
          onPress={() =>
            Alert.alert('恢复演示数据', '当前本地数据会被演示数据覆盖。', [
              { text: '取消', style: 'cancel' },
              { text: '确认恢复', style: 'destructive', onPress: restoreDemo },
            ])
          }
        />
        <GroupedRow
          icon="trash.fill"
          iconBg={c.danger}
          label="清空全部数据"
          destructive
          onPress={() =>
            Alert.alert('清空全部数据', '资产、心愿和攒钱计划都会被删除，且无法恢复。', [
              { text: '取消', style: 'cancel' },
              { text: '确认删除', style: 'destructive', onPress: clearAll },
            ])
          }
        />
      </GroupedSection>
    </LargeTitleScreen>
  );
}

function Stat({ n, l, color, muted }: { n: number; l: string; color: string; muted: string }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statN, { color }]}>{n}</Text>
      <Text style={[styles.statL, { color: muted }]}>{l}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    minHeight: 76,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGlyph: { fontSize: 24, fontWeight: '800', color: '#1C1C1E' },
  name: { fontSize: 17, fontWeight: '600' },
  meta: { marginTop: 3, fontSize: 13 },
  stats: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statN: { fontSize: 22, fontWeight: '700', fontVariant: ['tabular-nums'] },
  statL: { fontSize: 12, marginTop: 4 },
  statRule: { width: StyleSheet.hairlineWidth, height: 36 },
});
