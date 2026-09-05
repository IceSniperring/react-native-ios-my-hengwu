import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LIME } from '../theme';
import { useStore } from '../store';
import { useColors } from '../useColors';

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
};

/** iOS-style page sheet: grabber, large corners, elevated vs page background. */
export function NativeSheet({ visible, onClose, title, children, leading, trailing }: Props) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const scheme = useStore((s) => s.colorScheme);
  const sheetBg = c.card;
  const grabber = scheme === 'dark' ? 'rgba(235,235,245,0.32)' : 'rgba(60,60,67,0.28)';
  const right =
    trailing ??
    (title ? (
      <Pressable onPress={onClose} hitSlop={12} accessibilityLabel="完成">
        <Text style={styles.done}>完成</Text>
      </Pressable>
    ) : null);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.root}>
        <Pressable style={styles.dim} onPress={onClose} accessibilityLabel="关闭" />
        <View
          style={[
            styles.sheet,
            Platform.OS !== 'ios' && styles.sheetMd,
            { backgroundColor: sheetBg, paddingBottom: Math.max(insets.bottom, 16) },
          ]}>
          {Platform.OS === 'ios' ? (
            <View style={styles.grabberWrap}>
              <View style={[styles.grabber, { backgroundColor: grabber }]} />
            </View>
          ) : (
            <View style={styles.mdHandle} />
          )}
          {title ? (
            <View style={styles.titleRow}>
              <View style={styles.side}>{leading}</View>
              <Text pointerEvents="none" style={[styles.title, { color: c.text }]}>
                {title}
              </Text>
              <View style={[styles.side, styles.sideEnd]}>{right}</View>
            </View>
          ) : null}
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  dim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  sheetMd: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    elevation: 8,
  },
  mdHandle: { height: 8 },
  grabberWrap: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 6,
  },
  grabber: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 4,
  },
  side: { width: 64, alignItems: 'flex-start', justifyContent: 'center', zIndex: 1 },
  sideEnd: { alignItems: 'flex-end' },
  title: {
    ...StyleSheet.absoluteFill,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 44,
  },
  done: { fontSize: 17, fontWeight: '600', color: LIME, paddingHorizontal: 8 },
});
