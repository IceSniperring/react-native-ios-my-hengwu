import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatMoney, todayISO } from '../../src/calc';
import { CostBar } from '../../src/components/CostBar';
import { StickerImage } from '../../src/components/StickerImage';
import { useStore } from '../../src/store';
import { radius } from '../../src/theme';
import type { ProductKey } from '../../src/types';
import { useColors } from '../../src/useColors';

export default function WishlistScreen() {
  const insets = useSafeAreaInsets();
  const c = useColors();
  const wishes = useStore((s) => s.wishes);
  const addWish = useStore((s) => s.addWish);
  const updateWish = useStore((s) => s.updateWish);
  const removeWish = useStore((s) => s.removeWish);
  const addAsset = useStore((s) => s.addAsset);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const create = () => {
    const targetPrice = Number(price);
    if (!name.trim() || !targetPrice) return Alert.alert('填写名称和目标价格');
    addWish({
      name: name.trim(),
      targetPrice,
      saved: 0,
      category: 'digital',
      imageKey: 'iphone' as ProductKey,
    });
    setName('');
    setPrice('');
    setOpen(false);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top, backgroundColor: c.bg }]}>
      <View style={styles.head}>
        <Text style={[styles.title, { color: c.text }]}>心愿清单</Text>
        <Pressable onPress={() => setOpen(true)} style={[styles.add, { backgroundColor: c.tint }]}>
          <SymbolView name="plus" size={18} tintColor="#FFFFFF" />
        </Pressable>
      </View>
      <Text style={[styles.sub, { color: c.textSecondary }]}>先攒够再买，每件东西心里有杆秤</Text>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {wishes.map((w) => {
          const p = Math.min(1, w.saved / w.targetPrice);
          return (
            <View key={w.id} style={[styles.card, { backgroundColor: c.card, borderColor: c.line }]}>
              <StickerImage imageKey={w.imageKey} imageUri={w.imageUri} size={72} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: c.text }]}>{w.name}</Text>
                <Text style={[styles.meta, { color: c.textSecondary }]}>
                  已攒 {formatMoney(w.saved, 0)}  /  {formatMoney(w.targetPrice, 0)}
                </Text>
                <View style={{ marginTop: 8 }}>
                  <CostBar progress={p} label={p >= 1 ? '可以买了' : `还差 ${formatMoney(w.targetPrice - w.saved, 0)}`} />
                </View>
                <View style={styles.row}>
                  <Pressable
                    style={[styles.mini, { backgroundColor: c.input }]}
                    onPress={() => {
                      Alert.prompt
                        ? Alert.prompt('存一笔', '金额', (v) => {
                            const n = Number(v);
                            if (n) updateWish(w.id, { saved: w.saved + n });
                          })
                        : updateWish(w.id, { saved: w.saved + 200 });
                    }}>
                    <Text style={[styles.miniText, { color: c.text }]}>+攒钱</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.mini, { backgroundColor: c.tint }]}
                    onPress={() => {
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
                      });
                      removeWish(w.id);
                      router.push(`/asset/${id}`);
                    }}>
                    <Text style={[styles.miniText, { color: '#FFFFFF' }]}>买下入库</Text>
                  </Pressable>
                  <Pressable onPress={() => removeWish(w.id)}>
                    <SymbolView name="trash" size={18} tintColor={c.textSecondary} />
                  </Pressable>
                </View>
              </View>
            </View>
          );
        })}
        {wishes.length === 0 ? <Text style={[styles.empty, { color: c.textSecondary }]}>还没有心愿，点右上角添加</Text> : null}
      </ScrollView>

      <Modal visible={open} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBg}>
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 16, backgroundColor: c.surface }]}>
            <Text style={[styles.sheetTitle, { color: c.text }]}>新心愿</Text>
            <TextInput value={name} onChangeText={setName} placeholder="想买什么" placeholderTextColor={c.textTertiary} style={[styles.input, { backgroundColor: c.input, color: c.text }]} />
            <TextInput value={price} onChangeText={setPrice} placeholder="目标价格" placeholderTextColor={c.textTertiary} keyboardType="decimal-pad" style={[styles.input, { backgroundColor: c.input, color: c.text }]} />
            <Pressable onPress={create} style={[styles.cta, { backgroundColor: c.tint }]}>
              <Text style={styles.ctaText}>加入清单</Text>
            </Pressable>
            <Pressable onPress={() => setOpen(false)} style={{ alignItems: 'center', padding: 10 }}>
              <Text style={{ color: c.textSecondary }}>取消</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  head: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 },
  title: { flex: 1, fontSize: 28, fontWeight: '800' },
  add: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  sub: { paddingHorizontal: 20, marginTop: 4, marginBottom: 8 },
  card: {
    flexDirection: 'row',
    gap: 14,
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: 12,
  },
  name: { fontSize: 16, fontWeight: '800' },
  meta: { fontSize: 12, marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  mini: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  miniText: { fontWeight: '700', fontSize: 12 },
  empty: { textAlign: 'center', marginTop: 40 },
  modalBg: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  sheetTitle: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
  input: { height: 48, borderRadius: 12, paddingHorizontal: 14, marginBottom: 10, fontSize: 16 },
  cta: { height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  ctaText: { fontWeight: '800', color: '#FFFFFF' },
});
