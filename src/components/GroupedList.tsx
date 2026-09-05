import { SymbolView, type SFSymbol } from 'expo-symbols';
import { Children, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useColors } from '../useColors';

const ICON = 29;
const INSET = 16 + ICON + 12;

export function GroupedSection({
  header,
  footer,
  children,
}: {
  header?: string;
  footer?: string;
  children: ReactNode;
}) {
  const c = useColors();
  const items = Children.toArray(children).filter(Boolean);
  return (
    <View style={styles.section}>
      {header ? <Text style={[styles.header, { color: c.textSecondary }]}>{header}</Text> : null}
      <View style={[styles.card, { backgroundColor: c.card }]}>
        {items.map((child, i) => (
          <View key={i}>
            {child}
            {i < items.length - 1 ? (
              <View style={[styles.sep, { backgroundColor: c.line, marginLeft: INSET }]} />
            ) : null}
          </View>
        ))}
      </View>
      {footer ? <Text style={[styles.footer, { color: c.textSecondary }]}>{footer}</Text> : null}
    </View>
  );
}

export function GroupedRow({
  icon,
  iconBg,
  iconTint = '#FFFFFF',
  label,
  value,
  onPress,
  accessory,
  chevron,
  destructive,
}: {
  icon?: SFSymbol;
  iconBg?: string;
  iconTint?: string;
  label: string;
  value?: string;
  onPress?: () => void;
  accessory?: ReactNode;
  chevron?: boolean;
  destructive?: boolean;
}) {
  const c = useColors();
  const showChevron = chevron ?? Boolean(onPress);
  const color = destructive ? c.danger : c.text;
  const inner = (
    <>
      {icon ? (
        <View style={[styles.iconWell, { backgroundColor: iconBg ?? c.lime }]}>
          <SymbolView name={icon} size={16} tintColor={iconTint} />
        </View>
      ) : null}
      <Text style={[styles.label, { color }]} numberOfLines={1}>
        {label}
      </Text>
      {value ? (
        <Text style={[styles.value, { color: c.textSecondary }]} numberOfLines={1}>
          {value}
        </Text>
      ) : null}
      {accessory}
      {showChevron ? <SymbolView name="chevron.right" size={12} tintColor={c.textTertiary} /> : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={({ pressed }) => [styles.row, pressed && { backgroundColor: c.chip }]}>
        {inner}
      </Pressable>
    );
  }

  return <View style={styles.row}>{inner}</View>;
}

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  header: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.2,
    marginBottom: 6,
    marginLeft: 16,
  },
  card: {
    borderRadius: 26,
    overflow: 'hidden',
  },
  sep: {
    height: StyleSheet.hairlineWidth,
  },
  row: {
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWell: {
    width: ICON,
    height: ICON,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontSize: 17,
    fontWeight: '400',
  },
  value: {
    fontSize: 17,
    maxWidth: 160,
    textAlign: 'right',
  },
  footer: {
    marginTop: 8,
    marginHorizontal: 16,
    fontSize: 13,
    lineHeight: 18,
  },
});
