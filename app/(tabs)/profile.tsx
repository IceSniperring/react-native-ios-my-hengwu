import { useEffect } from 'react';
import { useAuth } from '@clerk/expo';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { CalendarDays, ChevronRight, LayoutGrid, Leaf, Moon, RotateCcw, Tag, Trash2 } from 'lucide-react-native';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { GroupedRow, GroupedSection, GROUPED_INSETS } from '../../src/components/GroupedList';
import { UserAvatar } from '../../src/components/UserAvatar';
import { MigratePanel } from '../../src/cloud/MigratePanel';
import { useCloudAssets } from '../../src/cloud/useCloudAssets';
import { useUserProfile } from '../../src/cloud/useUserProfile';
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
  const { isSignedIn, signOut } = useAuth();
  const profile = useUserProfile();
  const { loadMigrated } = useCloudAssets();
  const dark = scheme === 'dark';
  useEffect(() => { if (isSignedIn) void loadMigrated(); }, [isSignedIn, loadMigrated]);
  const glyph = 20; const iconColor = c.text; const stroke = 2.2;

  return (
    <LargeTitleScreen title="我的">
      <GroupedSection><Pressable onPress={() => router.push(isSignedIn ? '/profile/edit' : '/login')} accessibilityRole="button" accessibilityLabel={isSignedIn ? '编辑个人资料' : '登录'} style={({ pressed }) => [styles.hero, pressed && { backgroundColor: c.chip }]}><UserAvatar uri={profile.avatarUrl} glyph={isSignedIn ? profile.glyph : '衡'} size={60} /><View style={styles.heroText}><Text style={[styles.name, { color: c.text }]} numberOfLines={1}>{isSignedIn ? profile.displayName : '本地账本'}</Text><View style={[styles.localPill, { backgroundColor: c.chip }]}><View style={[styles.localDot, { backgroundColor: isSignedIn ? c.success : c.textTertiary }]} /><Text style={[styles.localText, { color: c.textSecondary }]} numberOfLines={1}>{isSignedIn ? profile.email ?? '已登录 · Clerk' : '登录后可跨设备同步'}</Text></View></View><ChevronRight size={18} color={c.textTertiary} strokeWidth={2.2} /></Pressable></GroupedSection>
      <GroupedSection><View style={styles.stats}><Stat n={overview.assets.length} l="资产" /><View style={[styles.statRule, { backgroundColor: c.line }]} /><Stat n={wishes.length} l="心愿" /><View style={[styles.statRule, { backgroundColor: c.line }]} /><Stat n={plans.length} l="攒钱计划" /></View></GroupedSection>
      {isSignedIn ? <GroupedSection header="云端" inset={GROUPED_INSETS.plain} footer="一键迁移会用本机 hengwu-db 全量替换云端。"><View style={{ paddingHorizontal: 16, paddingVertical: 12 }}><MigratePanel /></View></GroupedSection> : <GroupedSection header="云端" inset={GROUPED_INSETS.plain}><GroupedRow plain label="登录以同步云端" onPress={() => router.push('/login')} /></GroupedSection>}
      <GroupedSection header="外观" inset={GROUPED_INSETS.plain}><GroupedRow plain icon={<Moon size={glyph} color={iconColor} strokeWidth={stroke} />} label="深色模式" chevron={false} accessory={<Switch value={dark} onValueChange={(v) => { Haptics.selectionAsync(); setColorScheme(v ? 'dark' : 'light'); }} trackColor={{ false: c.track, true: LIME }} thumbColor="#FFFFFF" ios_backgroundColor={c.track} />} /></GroupedSection>
      <GroupedSection header="工具" inset={GROUPED_INSETS.plain}><GroupedRow plain icon={<Leaf size={glyph} color={iconColor} strokeWidth={stroke} />} label="智能攒钱计划" onPress={() => router.push('/savings')} /><GroupedRow plain icon={<CalendarDays size={glyph} color={iconColor} strokeWidth={stroke} />} label="购入日历" onPress={() => router.push('/calendar')} /></GroupedSection>
      <GroupedSection header="管理" inset={GROUPED_INSETS.plain}><GroupedRow plain icon={<LayoutGrid size={glyph} color={iconColor} strokeWidth={stroke} />} label="分类" onPress={() => router.push('/manage/categories')} /><GroupedRow plain icon={<Tag size={glyph} color={iconColor} strokeWidth={stroke} />} label="标签" onPress={() => router.push('/manage/tags')} /></GroupedSection>
      <GroupedSection header="数据" inset={GROUPED_INSETS.plain} footer="买入 · 服役 · 退役 · 卖出，把每件物品放上秤。登录后资产增删改走云 API。"><GroupedRow plain icon={<RotateCcw size={glyph} color={iconColor} strokeWidth={stroke} />} label="恢复演示数据" onPress={() => Alert.alert('恢复演示数据', '当前本地数据会被演示数据覆盖。', [{ text: '取消', style: 'cancel' }, { text: '确认恢复', style: 'destructive', onPress: restoreDemo }])} /><GroupedRow plain icon={<Trash2 size={glyph} color={c.danger} strokeWidth={stroke} />} label="清空全部数据" destructive onPress={() => Alert.alert('清空全部数据', '资产、心愿和攒钱计划都会被删除，且无法恢复。', [{ text: '取消', style: 'cancel' }, { text: '确认删除', style: 'destructive', onPress: clearAll }])} /></GroupedSection>
      {/* Sign out sits at the very bottom, below every other section. */}
      {isSignedIn ? (
        <GroupedSection inset={GROUPED_INSETS.plain}>
          <GroupedRow plain label="退出登录" destructive onPress={() => { void signOut(); }} />
        </GroupedSection>
      ) : null}
    </LargeTitleScreen>
  );
}

function Stat({ n, l }: { n: number; l: string }) { const c = useColors(); return <View style={styles.stat}><Text style={[styles.statN, { color: c.text }]}>{n}</Text><Text style={[styles.statL, { color: c.textSecondary }]}>{l}</Text></View>; }
const styles = StyleSheet.create({
  hero: { minHeight: 88, paddingHorizontal: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }, heroText: { flex: 1, gap: 6 }, name: { fontFamily: FONT.bold, fontSize: 20, letterSpacing: -0.2 }, localPill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 }, localDot: { width: 6, height: 6, borderRadius: 3 }, localText: { fontSize: 12, fontWeight: '500' }, stats: { minHeight: 80, flexDirection: 'row', alignItems: 'center', paddingVertical: 4 }, stat: { flex: 1, alignItems: 'center', paddingVertical: 12 }, statN: { fontSize: 24, ...numDisplay }, statL: { marginTop: 4, fontSize: 12, fontWeight: '500' }, statRule: { width: StyleSheet.hairlineWidth, height: 32 },
});
