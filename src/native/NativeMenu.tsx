import { MenuView } from '@expo/ui/community/menu';
import type { SFSymbol } from 'expo-symbols';
import { useState, type ReactNode } from 'react';
import { View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';

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
  const [box, setBox] = useState({ w: 0, h: 0 });

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
