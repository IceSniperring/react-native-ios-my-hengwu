import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassIconButton } from '../../src/components/GlassIconButton';
import { demoOneDraft, demoScreenshotDrafts } from '../../src/ingressDemo';
import { PlatformIcon } from '../../src/native/PlatformIcon';
import { pickIngressScreenshot } from '../../src/pickImage';
import { LEMON, space } from '../../src/theme';
import { useStore } from '../../src/store';
import { useColors } from '../../src/useColors';

type Method = 'shot' | 'csv' | 'one';

const METHODS: {
  id: Method;
  title: string;
  desc: string;
  icon: 'camera' | 'square.grid.2x2' | 'pencil';
  tint: string;
}[] = [
  {
    id: 'shot',
    title: '上传截图',
    desc: '账单 / 持仓截图，自动识别金额',
    icon: 'camera',
    tint: '#007AFF',
  },
  {
    id: 'csv',
    title: '导入 CSV',
    desc: '券商 / 记账 App 导出表',
    icon: 'square.grid.2x2',
    tint: '#34C759',
  },
  {
    id: 'one',
    title: '补一条',
    desc: '手动录入一件资产或一笔现金',
    icon: 'pencil',
    tint: '#FF9500',
  },
];

export default function IngressHub() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const setIngressDrafts = useStore((s) => s.setIngressDrafts);
  const [busy, setBusy] = useState(false);

  const openConfirm = (
    drafts: ReturnType<typeof demoOneDraft>,
    title: string,
    badge: string,
  ) => {
    setIngressDrafts(drafts, { title, badge });
    router.push('/ingress/confirm');
  };

  const onMethod = async (id: Method) => {
    if (busy) return;
    if (id === 'csv') {
      router.push('/ingress/csv');
      return;
    }
    if (id === 'one') {
      openConfirm(demoOneDraft(), '补一条', '已生成草稿');
      return;
    }
    // screenshot
    setBusy(true);
    try {
      const picked = await pickIngressScreenshot();
      if (!picked.ok) {
        if (picked.reason === 'denied') {
          Alert.alert('无法访问相册', '请在系统设置中允许「有数」访问照片，再重试上传截图。');
        }
        // canceled → stay silent
        return;
      }
      openConfirm(
        demoScreenshotDrafts(picked.uri),
        '截图解析',
        '演示识别完成 · 可编辑后入账',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: c.bg, paddingTop: insets.top }]}>
      <View style={styles.chrome}>
        <GlassIconButton name="xmark" size={40} accessibilityLabel="关闭" onPress={() => router.back()} />
        <Text style={[styles.brand, { color: c.text }]}>有数</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: space.pageX,
          paddingBottom: insets.bottom + 32,
        }}
        showsVerticalScrollIndicator={false}>
        <Text style={[styles.kicker, { color: c.textSecondary }]}>把生活变成资产账本</Text>
        <Text style={[styles.title, { color: c.text }]}>
          先记一笔，{'\n'}一眼看清净资产
        </Text>
        <Text style={[styles.sub, { color: c.textSecondary }]}>
          三种低摩擦入账方式，选一种即可开始。
        </Text>

        <View style={[styles.list, { backgroundColor: c.surface }]}>
          {METHODS.map((m, i) => (
            <Pressable
              key={m.id}
              disabled={busy}
              onPress={() => void onMethod(m.id)}
              style={({ pressed }) => [
                styles.row,
                i < METHODS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.line },
                pressed && { opacity: 0.72 },
              ]}
              accessibilityRole="button"
              accessibilityLabel={m.title}>
              <View style={[styles.iconWrap, { backgroundColor: `${m.tint}18` }]}>
                <PlatformIcon name={m.icon} size={22} color={m.tint} />
              </View>
              <View style={styles.body}>
                <Text style={[styles.rowTitle, { color: c.text }]}>{m.title}</Text>
                <Text style={[styles.rowDesc, { color: c.textSecondary }]}>{m.desc}</Text>
              </View>
              {busy && m.id === 'shot' ? (
                <ActivityIndicator color={LEMON} />
              ) : (
                <PlatformIcon name="chevron.right" size={16} color={c.textTertiary} />
              )}
            </Pressable>
          ))}
        </View>

        <Text style={[styles.note, { color: c.textTertiary }]}>
          截图暂无云端 OCR 时，会生成可编辑的演示识别草稿；CSV 为本地简单解析。不会上传文件。
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  chrome: {
    paddingHorizontal: space.pageX,
    paddingTop: 10,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { fontSize: 20, fontWeight: '700' },
  kicker: { marginTop: 12, fontSize: 14, fontWeight: '500' },
  title: { marginTop: 8, fontSize: 28, fontWeight: '700', lineHeight: 34 },
  sub: { marginTop: 10, fontSize: 15, lineHeight: 22, marginBottom: 20 },
  list: { borderRadius: 20, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
    minHeight: 72,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1 },
  rowTitle: { fontSize: 17, fontWeight: '600' },
  rowDesc: { marginTop: 3, fontSize: 13, lineHeight: 18 },
  note: { marginTop: 16, fontSize: 12, lineHeight: 18, paddingHorizontal: 4 },
});
