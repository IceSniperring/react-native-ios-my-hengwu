import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  CalendarDays,
  LayoutGrid,
  Leaf,
  Moon,
  RotateCcw,
  Tag,
  Trash2,
} from 'lucide-react-native';
import { Alert, Platform, StyleSheet, Switch, Text, View } from 'react-native';

import { GroupedRow, GroupedSection, GROUPED_INSETS } from '../../src/components/GroupedList';
import { LargeTitleScreen } from '../../src/components/LargeTitleScreen';
import { useOverview } from '../../src/hooks';
import { LIME, numDisplay } from '../../src/theme';
import { FONT } from '../../src/typography';
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
  const glyph = 20;
  const iconColor = c.text;
  const stroke = 2.2;

  return (
    <LargeTitleScreen title="我的">
      <GroupedSection>
        <View style={styles.hero}>
          <View style={[styles.avatar, { backgroundColor: LIME }]}>
            <Text style={styles.avatarGlyph}>衡</Text>
          </View>
          <View style={styles.heroText}>
            <Text style={[styles.name, { color: c.text }]}>衡物</Text>
            <View style={[styles.localPill, { backgroundColor: c.chip }]}>
              <View style={[styles.localDot, { backgroundColor: c.success }]} />
              <Text style={[styles.localText, { color: c.textSecondary }]}>本地账本</Text>
            </View>
          </View>
        </View>
      </GroupedSection>

      <GroupedSection>
        <View style={styles.stats}>
          <Stat n={overview.assets.length} l="资产" />
          <View style={[styles.statRule, { backgroundColor: c.line }]} />
          <Stat n={wishes.length} l="心愿" />
          <View style={[styles.statRule, { backgroundColor: c.line }]} />
          <Stat n={plans.length} l="攒钱计划" />
        </View>
      </GroupedSection>

      <GroupedSection header="外观" inset={GROUPED_INSETS.plain}>
        <GroupedRow
          plain
          icon={<Moon size={glyph} color={iconColor} strokeWidth={stroke} />}
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

      <GroupedSection header="工具" inset={GROUPED_INSETS.plain}>
        <GroupedRow
          plain
          icon={<Leaf size={glyph} color={iconColor} strokeWidth={stroke} />}
          label="智能攒钱计划"
          onPress={() => router.push('/savings')}
        />
        <GroupedRow
          plain
          icon={<CalendarDays size={glyph} color={iconColor} strokeWidth={stroke} />}
          label="购入日历"
          onPress={() => router.push('/calendar')}
        />
      </GroupedSection>

      <GroupedSection header="管理" inset={GROUPED_INSETS.plain}>
        <GroupedRow
          plain
          icon={<LayoutGrid size={glyph} color={iconColor} strokeWidth={stroke} />}
          label="分类"
          onPress={() => router.push('/manage/categories')}
        />
        <GroupedRow
          plain
          icon={<Tag size={glyph} color={iconColor} strokeWidth={stroke} />}
          label="标签"
          onPress={() => router.push('/manage/tags')}
        />
      </GroupedSection>

      <GroupedSection
        header="数据"
        inset={GROUPED_INSETS.plain}
        footer="买入 · 服役 · 退役 · 卖出，把每件物品放上秤。数据只存在这台手机。">
        <GroupedRow
          plain
          icon={<RotateCcw size={glyph} color={iconColor} strokeWidth={stroke} />}
          label="恢复演示数据"
          onPress={() =>
            Alert.alert('恢复演示数据', '当前本地数据会被演示数据覆盖。', [
              { text: '取消', style: 'cancel' },
              { text: '确认恢复', style: 'destructive', onPress: restoreDemo },
            ])
          }
        />
        <GroupedRow
          plain
          icon={<Trash2 size={glyph} color={c.danger} strokeWidth={stroke} />}
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

function Stat({ n, l }: { n: number; l: string }) {
  const c = useColors();
  return (
    <View style={styles.stat}>
      <Text style={[styles.statN, { color: c.text }]}>{n}</Text>
      <Text style={[styles.statL, { color: c.textSecondary }]}>{l}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    minHeight: 88,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGlyph: {
    fontFamily: FONT.extrabold,
    fontSize: 26,
    color: '#1C1C1E',
  },
  heroText: {
    flex: 1,
    gap: 6,
  },
  name: {
    fontFamily: FONT.bold,
    fontSize: 20,
    letterSpacing: -0.2,
  },
  localPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  localDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  localText: {
    fontSize: 12,
    fontWeight: '500',
  },
  stats: {
    minHeight: 80,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  statN: {
    fontSize: 24,
    ...numDisplay,
  },
  statL: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  statRule: {
    width: StyleSheet.hairlineWidth,
    height: 32,
  },
});
