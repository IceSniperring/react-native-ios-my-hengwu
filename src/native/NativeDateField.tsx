import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import { parseISO, toISO } from '../calc';
import { radius } from '../theme';
import { useStore } from '../store';
import { useColors } from '../useColors';

type Props = {
  label: string;
  value: string;
  onChange: (iso: string) => void;
};

export function NativeDateField({ label, value, onChange }: Props) {
  const c = useColors();
  const scheme = useStore((s) => s.colorScheme);
  if (Platform.OS === 'web') {
    return (
      <View style={styles.block}>
        <Text style={[styles.label, { color: c.textSecondary }]}>{label}</Text>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="2024-01-01"
          style={[styles.input, { backgroundColor: c.input, color: c.text }]}
          placeholderTextColor={c.textTertiary}
        />
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: c.textSecondary }]}>{label}</Text>
      <DateTimePicker
        value={parseISO(value)}
        mode="date"
        display={Platform.OS === 'ios' ? 'compact' : 'default'}
        locale="zh-CN"
        themeVariant={scheme}
        onChange={(_, next) => {
          if (next) onChange(toISO(next));
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  block: { marginBottom: 14 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    minHeight: 44,
  },
  label: { fontSize: 13, fontWeight: '600' },
  input: {
    height: 48,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    fontSize: 16,
    marginTop: 8,
  },
});
