import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { AssetCard } from '../src/components/AssetCard';
import { useFilteredAssets } from '../src/hooks';
import { useColors } from '../src/useColors';

export default function SearchScreen() {
  const c = useColors();
  const [q, setQ] = useState('');
  const list = useFilteredAssets('all', 'all', q);

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      <Stack.Screen
        options={{
          title: '搜索',
          headerSearchBarOptions:
            Platform.OS === 'ios'
              ? {
                  placeholder: '搜资产名称',
                  hideWhenScrolling: false,
                  cancelButtonText: '取消',
                  onChangeText: (e) => setQ(e.nativeEvent.text),
                  onCancelButtonPress: () => setQ(''),
                }
              : undefined,
        }}
      />
      {Platform.OS !== 'ios' ? (
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="搜资产名称"
          style={styles.androidSearch}
          placeholderTextColor={c.textTertiary}
        />
      ) : null}
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 16 }}>
        {q && list.length === 0 ? <Text style={[styles.empty, { color: c.textSecondary }]}>没有匹配的资产</Text> : null}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {(q ? list : []).map((a) => (
            <View key={a.id} style={{ width: '48%', flexGrow: 1, maxWidth: '48%' }}>
              <AssetCard asset={a} onPress={() => router.push(`/asset/${a.id}`)} />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  androidSearch: {
    margin: 16,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F4F4F4',
    paddingHorizontal: 12,
    fontSize: 16,
  },
  empty: { textAlign: 'center', marginTop: 24 },
});
