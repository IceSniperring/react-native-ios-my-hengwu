import { router } from 'expo-router';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { formatMoney, todayISO } from '../../src/calc';
import { AddFab } from '../../src/components/AddFab';
import { CostBar } from '../../src/components/CostBar';
import { GroupedSection } from '../../src/components/GroupedList';
import { LargeTitleScreen } from '../../src/components/LargeTitleScreen';
import { PlatformIcon } from '../../src/native/PlatformIcon';
import { StickerImage } from '../../src/components/StickerImage';
import { LIME } from '../../src/theme';
import { useStore } from '../../src/store';
import { useColors } from '../../src/useColors';

export default function WishlistScreen() {
  const c = useColors();
  const wishes = useStore((s) => s.wishes);
  const updateWish = useStore((s) => s.updateWish);
  const removeWish = useStore((s) => s.removeWish);
  const addAsset = useStore((s) => s.addAsset);

  const saveMore = (id: string, saved: number) => {
    if (Platform.OS === 'ios' && Alert.prompt) {
      Alert.prompt('存一笔', '金额', (v) => {
        const n = Number(v);
        if (n) updateWish(id, { saved: saved + n });
      });
      return;
    }
    Alert.alert('存一笔', '选择金额', [
      { text: '取消', style: 'cancel' },
      { text: '+50', onPress: () => updateWish(id, { saved: saved + 50 }) },
      { text: '+200', onPress: () => updateWish(id, { saved: saved + 200 }) },
      { text: '+500', onPress: () => updateWish(id, { saved: saved + 500 }) },
    ]);
  };

  const buyIn = (w: (typeof wishes)[number]) => {
    const id = addAsset({
      name: w.name,
      category: w.category,
      status: 'active',
      purchasePrice: w.targetPrice,
      purchaseDate: todayISO(),
      targetDailyCost: Math.max(1, w.targetPrice / 365),
      expectedDays: 365,
      imageKey: w.imageKey,
      imageUri: w.imageUri,
      tags: w.tags,
    });
    removeWish(w.id);
    router.push(`/asset/${id}`);
  };

  return (
    <LargeTitleScreen
      title="心愿"
      subtitle="先攒够再买，每件东西心里有杆秤"
      overlay={<AddFab accessibilityLabel="添加心愿" onPress={() => router.push('/asset/form?kind=wish')} />}>
      {wishes.map((w) => {
        const p = Math.min(1, w.saved / w.targetPrice);
        const ready = p >= 1;
        return (
          <GroupedSection key={w.id}>
            <View>
              <View style={styles.card}>
                <StickerImage imageKey={w.imageKey} imageUri={w.imageUri} size={64} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.name, { color: c.text }]}>{w.name}</Text>
                  <Text style={[styles.meta, { color: c.textSecondary }]}>
                    已攒 {formatMoney(w.saved, 0)}  /  {formatMoney(w.targetPrice, 0)}
                  </Text>
                  <View style={{ marginTop: 10 }}>
                    <CostBar
                      progress={p}
                      color={LIME}
                      label={ready ? '可以买了' : `还差 ${formatMoney(w.targetPrice - w.saved, 0)}`}
                    />
                  </View>
                </View>
              </View>
              <View style={[styles.actions, { borderTopColor: c.line }]}>
                <Pressable
                  accessibilityLabel="存一笔"
                  onPress={() => saveMore(w.id, w.saved)}
                  style={({ pressed }) => [styles.action, pressed && { opacity: 0.6 }]}>
                  <Text style={[styles.actionText, { color: c.text }]}>存一笔</Text>
                </Pressable>
                <View style={[styles.vRule, { backgroundColor: c.line }]} />
                <Pressable
                  accessibilityLabel="买下入库"
                  onPress={() => buyIn(w)}
                  style={({ pressed }) => [styles.action, pressed && { opacity: 0.6 }]}>
                  <Text style={[styles.actionText, { color: ready ? LIME : c.text }]}>买下入库</Text>
                </Pressable>
                <View style={[styles.vRule, { backgroundColor: c.line }]} />
                <Pressable
                  accessibilityLabel="删除心愿"
                  hitSlop={8}
                  onPress={() =>
                    Alert.alert('删除心愿', `确定删除「${w.name}」？`, [
                      { text: '取消', style: 'cancel' },
                      { text: '确认删除', style: 'destructive', onPress: () => removeWish(w.id) },
                    ])
                  }
                  style={({ pressed }) => [styles.trashBtn, pressed && { opacity: 0.6 }]}>
                  <PlatformIcon name="trash" size={18} color={c.danger} />
                </Pressable>
              </View>
            </View>
          </GroupedSection>
        );
      })}

      {wishes.length === 0 ? (
        <View style={styles.emptyWrap}>
          <View style={[styles.emptyIcon, { backgroundColor: c.card }]}>
            <PlatformIcon name="heart" size={28} color={LIME} />
          </View>
          <Text style={[styles.emptyTitle, { color: c.text }]}>还没有心愿</Text>
          <Text style={[styles.emptySub, { color: c.textSecondary }]}>记下想买的东西，攒够再下手</Text>
          <Pressable
            onPress={() => router.push('/asset/form?kind=wish')}
            style={({ pressed }) => [styles.emptyCta, { backgroundColor: LIME, opacity: pressed ? 0.85 : 1 }]}>
            <Text style={styles.emptyCtaText}>添加心愿</Text>
          </Pressable>
        </View>
      ) : null}
    </LargeTitleScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
  },
  name: { fontSize: 17, fontWeight: '600' },
  meta: { fontSize: 13, marginTop: 4, fontVariant: ['tabular-nums'] },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    minHeight: 44,
  },
  action: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: { fontSize: 15, fontWeight: '600' },
  vRule: { width: StyleSheet.hairlineWidth, height: 22 },
  trashBtn: {
    width: 48,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWrap: { alignItems: 'center', paddingTop: 64, paddingHorizontal: 32 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: { fontSize: 20, fontWeight: '700' },
  emptySub: { marginTop: 6, fontSize: 15, textAlign: 'center' },
  emptyCta: {
    marginTop: 20,
    height: 44,
    paddingHorizontal: 22,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCtaText: { fontWeight: '700', color: '#1C1C1E', fontSize: 16 },
});
