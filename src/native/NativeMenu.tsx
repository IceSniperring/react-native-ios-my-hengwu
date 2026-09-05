import { MenuView } from '@expo/ui/community/menu';
import type { SFSymbol } from 'expo-symbols';
import { useState, type ReactNode } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useColors } from '../useColors';

export type NativeMenuItem = {
  id: string;
  title: string;
  image?: SFSymbol;
  destructive?: boolean;
  state?: 'on' | 'off';
};

type Props = {
  children: ReactNode;
  actions: NativeMenuItem[];
  title?: string;
  onSelect: (id: string) => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * Anchored system menu. Layout comes from `children`; the menu host is an
 * overlay so SwiftUI Host padding cannot stretch the row.
 */
export function NativeMenu({ children, actions, title, onSelect, style }: Props) {
  const c = useColors();
  const [open, setOpen] = useState(false);
  const [box, setBox] = useState({ w: 0, h: 0 });

  if (Platform.OS !== 'ios') {
    return (
      <View style={style}>
        <Pressable onPress={() => setOpen(true)}>{children}</Pressable>
        <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
          <View style={styles.mdRoot}>
            <Pressable style={styles.dim} onPress={() => setOpen(false)} />
            <View style={[styles.sheet, { backgroundColor: c.card }]}>
              {title ? <Text style={[styles.title, { color: c.textSecondary }]}>{title}</Text> : null}
              {actions.map((a) => (
                <Pressable
                  key={a.id}
                  android_ripple={{ color: 'rgba(0,0,0,0.08)' }}
                  onPress={() => {
                    setOpen(false);
                    onSelect(a.id);
                  }}
                  style={styles.row}>
                  <Text style={[styles.rowText, { color: a.destructive ? c.danger : c.text }]}>{a.title}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setBox((prev) => (prev.w === width && prev.h === height ? prev : { w: width, h: height }));
  };

  return (
    <View style={style} onLayout={onLayout}>
      {children}
      {box.w > 0 && box.h > 0 ? (
        <MenuView
          style={{ position: 'absolute', left: 0, top: 0, width: box.w, height: box.h }}
          title={title}
          shouldOpenOnLongPress={false}
          actions={actions.map((a) => ({
            id: a.id,
            title: a.title,
            image: a.image,
            state: a.state,
            attributes: a.destructive ? { destructive: true } : undefined,
          }))}
          onPressAction={({ nativeEvent }) => onSelect(nativeEvent.event)}>
          <View style={{ width: box.w, height: box.h }} collapsable={false} />
        </MenuView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  mdRoot: { flex: 1, justifyContent: 'flex-end', padding: 16, paddingBottom: 24 },
  dim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    paddingVertical: 8,
  },
  title: { fontSize: 13, paddingHorizontal: 20, paddingVertical: 8 },
  row: { minHeight: 48, paddingHorizontal: 20, justifyContent: 'center' },
  rowText: { fontSize: 16 },
});
