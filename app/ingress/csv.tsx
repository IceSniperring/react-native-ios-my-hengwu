import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassIconButton } from '../../src/components/GlassIconButton';
import { parseAssetCsv, SAMPLE_CSV } from '../../src/parseCsv';
import { LEMON, space } from '../../src/theme';
import { useStore } from '../../src/store';
import { useColors } from '../../src/useColors';

export default function IngressCsv() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const setIngressDrafts = useStore((s) => s.setIngressDrafts);
  const [text, setText] = useState('');

  const runParse = () => {
    const result = parseAssetCsv(text);
    if (!result.ok) {
      Alert.alert('无法解析 CSV', result.error);
      return;
    }
    setIngressDrafts(result.drafts, {
      title: 'CSV 导入',
      badge: `表格解析完成 · ${result.drafts.length} 条`,
    });
    router.push('/ingress/confirm');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: c.bg, paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.chrome}>
        <GlassIconButton name="chevron.left" size={40} accessibilityLabel="返回" onPress={() => router.back()} />
        <Text style={[styles.title, { color: c.text }]}>导入 CSV</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: space.pageX,
          paddingBottom: insets.bottom + 40,
        }}>
        <Text style={[styles.hint, { color: c.textSecondary }]}>
          粘贴导出表内容。支持表头「名称,金额,分类,日期」，或无表头「名称,金额」。解析在本地完成。
        </Text>

        <TextInput
          value={text}
          onChangeText={setText}
          multiline
          textAlignVertical="top"
          placeholder={'名称,金额,分类,日期\n示例资产,1000,数码,2026-01-01'}
          placeholderTextColor={c.textTertiary}
          style={[
            styles.input,
            {
              color: c.text,
              backgroundColor: c.surface,
              borderColor: c.line,
            },
          ]}
          autoCorrect={false}
          autoCapitalize="none"
        />

        <Pressable
          onPress={() => setText(SAMPLE_CSV.trim())}
          style={({ pressed }) => [styles.secondary, { borderColor: c.line, opacity: pressed ? 0.7 : 1 }]}>
          <Text style={[styles.secondaryText, { color: c.tint }]}>填入示例 CSV</Text>
        </Pressable>

        <Pressable
          onPress={runParse}
          style={({ pressed }) => [
            styles.primary,
            { backgroundColor: LEMON, opacity: pressed ? 0.85 : 1 },
          ]}>
          <Text style={styles.primaryText}>解析并预览</Text>
        </Pressable>

        <Pressable onPress={() => router.back()} style={styles.cancel}>
          <Text style={[styles.cancelText, { color: c.textSecondary }]}>取消</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
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
  title: { fontSize: 17, fontWeight: '600' },
  hint: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  input: {
    minHeight: 220,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 20,
  },
  secondary: {
    marginTop: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: { fontSize: 15, fontWeight: '600' },
  primary: {
    marginTop: 12,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { fontSize: 17, fontWeight: '700', color: '#111111' },
  cancel: { marginTop: 16, alignItems: 'center', padding: 8 },
  cancelText: { fontSize: 15 },
});
