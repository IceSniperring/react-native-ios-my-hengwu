import { ChevronRight } from 'lucide-react-native';
import { Children, isValidElement, type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { PlatformIcon, type AppIconName } from '../native/PlatformIcon';
import { useColors } from '../useColors';

const WELL = 32;
const WELL_INSET = 16 + WELL + 12;
const PLAIN_ICON = 20;
const PLAIN_INSET = 16 + PLAIN_ICON + 10;

export function GroupedSection({
  header,
  footer,
  inset,
  children,
}: {
  header?: string;
  footer?: string;
  /** Leading indent for separators. Defaults to icon-well layout. */
  inset?: number;
  children: ReactNode;
}) {
  const c = useColors();
  const items = Children.toArray(children).filter(Boolean);
  const sepInset = inset ?? WELL_INSET;
  return (
    <View style={styles.section}>
      {header ? <Text style={[styles.header, { color: c.textSecondary }]}>{header}</Text> : null}
      <View
        style={[
          styles.card,
          Platform.OS !== 'ios' && styles.cardMd,
          { backgroundColor: c.card },
        ]}>
        {items.map((child, i) => (
          <View key={i}>
            {child}
            {i < items.length - 1 ? (
              <View style={[styles.sep, { backgroundColor: c.line, marginLeft: sepInset }]} />
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
  plain,
  label,
  value,
  onPress,
  accessory,
  chevron,
  destructive,
}: {
  /** SF name, or a custom SVG/element node. */
  icon?: AppIconName | string | ReactNode;
  iconBg?: string;
  iconTint?: string;
  /** Render the leading icon without a colored well. */
  plain?: boolean;
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
  const hasIcon = icon != null && icon !== false;
  const iconNode = hasIcon
    ? isValidElement(icon)
      ? icon
      : (
          <PlatformIcon
            name={icon as string}
            size={plain ? 20 : 17}
            color={plain ? (destructive ? c.danger : c.text) : iconTint}
          />
        )
    : null;
  const inner = (
    <>
      {hasIcon ? (
        plain ? (
          <View style={styles.plainIcon}>{iconNode}</View>
        ) : (
          <View
            style={[
              styles.iconWell,
              Platform.OS !== 'ios' && styles.iconWellMd,
              { backgroundColor: iconBg ?? c.lime },
            ]}>
            {iconNode}
          </View>
        )
      ) : null}
      <Text style={[styles.label, Platform.OS !== 'ios' && styles.labelMd, { color }]} numberOfLines={1}>
        {label}
      </Text>
      {value ? (
        <Text style={[styles.value, { color: c.textSecondary }]} numberOfLines={1}>
          {value}
        </Text>
      ) : null}
      {accessory}
      {showChevron ? <ChevronRight size={16} color={c.textTertiary} strokeWidth={2.2} /> : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        android_ripple={Platform.OS === 'android' ? { color: 'rgba(128,128,128,0.16)' } : undefined}
        style={({ pressed }) => [
          styles.row,
          Platform.OS !== 'ios' && styles.rowMd,
          pressed && Platform.OS !== 'android' && { backgroundColor: c.chip },
        ]}>
        {inner}
      </Pressable>
    );
  }

  return <View style={[styles.row, Platform.OS !== 'ios' && styles.rowMd]}>{inner}</View>;
}

export const GROUPED_INSETS = {
  well: WELL_INSET,
  plain: PLAIN_INSET,
} as const;

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
  cardMd: {
    borderRadius: 12,
    elevation: 1,
  },
  rowMd: {
    minHeight: 56,
  },
  iconWellMd: {
    borderRadius: 8,
  },
  labelMd: {
    fontSize: 16,
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
    width: WELL,
    height: WELL,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plainIcon: {
    width: PLAIN_ICON,
    height: PLAIN_ICON,
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
