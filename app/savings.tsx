import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { formatMoney } from '../src/calc';
import { CostBar } from '../src/components/CostBar';
import { useStore } from '../src/store';
import { radius } from '../src/theme';
import { useColors } from '../src/useColors';

export default function SavingsScreen() {
  const c = useColors();
  const plans = useStore((s) => s.plans);
  const addPlan = useStore((s) => s.addPlan);
  const contributePlan = useStore((s) => s.contributePlan);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {plans.map((p) => {
          const prog = Math.min(1, p.currentAmount / p.targetAmount);
          return (
            <View key={p.id} style={styles.card}>
              <Text style={[styles.name, { color: c.text }]}>{p.name}</Text>
              <Text style={[styles.meta, { color: c.textSecondary }]}>
                {formatMoney(p.currentAmount, 0)}  /  {formatMoney(p.targetAmount, 0)}
              </Text>
              <View style={{ marginTop: 10 }}>
                <CostBar progress={prog} label={p.deadline ? `目标 ${p.deadline}` : undefined} />
              </View>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                {[50, 200, 500].map((n) => (
                  <Pressable key={n} onPress={() => contributePlan(p.id, n)} style={[styles.chip, { backgroundColor: c.limeSoft }]}>
                    <Text style={styles.chipText}>+{n}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          );
        })}

        <Text style={[styles.section, { color: c.text }]}>新建计划</Text>
        <TextInput value={name} onChangeText={setName} placeholder="计划名称，例如换机基金" placeholderTextColor={c.textTertiary} style={[styles.input, { backgroundColor: c.input, color: c.text }]} />
        <TextInput value={target} onChangeText={setTarget} placeholder="目标金额" placeholderTextColor={c.textTertiary} keyboardType="decimal-pad" style={[styles.input, { backgroundColor: c.input, color: c.text }]} />
        <Pressable
          style={[styles.cta, { backgroundColor: c.lime }]}
          onPress={() => {
            const t = Number(target);
            if (!name.trim() || !t) return Alert.alert('填写名称和目标金额');
            addPlan({ name: name.trim(), targetAmount: t, currentAmount: 0 });
            setName('');
            setTarget('');
          }}>
          <Text style={styles.ctaText}>创建计划</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800' },
  card: { borderWidth: 1, borderColor: '#F1F1F1', borderRadius: radius.lg, padding: 16, marginBottom: 12 },
  name: { fontSize: 17, fontWeight: '800' },
  meta: { marginTop: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  chipText: { fontWeight: '800', fontSize: 13 },
  section: { fontWeight: '800', marginTop: 12, marginBottom: 10 },
  input: { height: 48, borderRadius: 12, paddingHorizontal: 14, marginBottom: 10, fontSize: 16 },
  cta: { height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  ctaText: { fontWeight: '800' },
});
