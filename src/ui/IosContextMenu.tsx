import { BlurView } from 'expo-blur';
import {
  Check,
  Circle,
  Copy,
  Ellipsis,
  LayoutGrid,
  Link2,
  Pencil,
  Pin,
  SquareCheck,
  Tag,
  Trash2,
  type LucideIcon,
} from 'lucide-react-native';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { useStore } from '../store';
import { useColors } from '../useColors';

export type ContextMenuItem = {
  id: string;
  title: string;
  icon?: LucideIcon;
  destructive?: boolean;
  /** Solid status dot color (e.g. 转为已退役). */
  dot?: string;
};

export type ContextMenuSection = ContextMenuItem[];

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  sections: ContextMenuSection[];
};

/**
 * High-fidelity iOS context menu. System UIMenu in Expo/SwiftUI only accepts
 * SF Symbols — custom Lucide glyphs require this custom chrome.
 */
export function IosContextMenu({ visible, onClose, onSelect, sections }: Props) {
  const c = useColors();
  const scheme = useStore((s) => s.colorScheme);
  const dark = scheme === 'dark';
  const rowText = dark ? '#F2F2F7' : '#1C1C1E';
  const sep = dark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.10)';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.center} pointerEvents="box-none">
          <View style={styles.menuShadow}>
            <BlurView
              intensity={Platform.OS === 'ios' ? 48 : 100}
              tint={dark ? 'dark' : 'light'}
              style={styles.blur}>
              <View
                style={[
                  styles.menu,
                  {
                    backgroundColor: dark
                      ? 'rgba(40,40,42,0.55)'
                      : 'rgba(255,255,255,0.72)',
                  },
                ]}>
                {sections.map((section, si) => (
                  <View key={si}>
                    {si > 0 ? (
                      <View style={[styles.sep, { backgroundColor: sep }]} />
                    ) : null}
                    {section.map((item, ii) => {
                      const Icon = item.icon;
                      const tint = item.destructive ? c.danger : rowText;
                      return (
                        <Pressable
                          key={item.id}
                          onPress={() => {
                            onClose();
                            onSelect(item.id);
                          }}
                          style={({ pressed }) => [
                            styles.row,
                            pressed && {
                              backgroundColor: dark
                                ? 'rgba(255,255,255,0.08)'
                                : 'rgba(0,0,0,0.05)',
                            },
                            ii < section.length - 1 && {
                              borderBottomWidth: StyleSheet.hairlineWidth,
                              borderBottomColor: sep,
                            },
                          ]}>
                          <Text style={[styles.label, { color: tint }]}>{item.title}</Text>
                          {item.dot ? (
                            <View
                              style={[styles.dot, { backgroundColor: item.dot }]}
                            />
                          ) : Icon ? (
                            <Icon size={20} color={tint} strokeWidth={1.9} />
                          ) : null}
                        </Pressable>
                      );
                    })}
                  </View>
                ))}
              </View>
            </BlurView>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

export const MENU_ICONS = {
  edit: Pencil,
  copy: Copy,
  select: SquareCheck,
  delete: Trash2,
  pin: Pin,
  category: LayoutGrid,
  tag: Tag,
  link: Link2,
  more: Ellipsis,
  check: Check,
  circle: Circle,
} as const;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  menuShadow: {
    width: 260,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
    overflow: 'hidden',
  },
  blur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  menu: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    minHeight: 48,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 17,
    fontWeight: '400',
    letterSpacing: -0.2,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  sep: {
    height: StyleSheet.hairlineWidth,
  },
});
