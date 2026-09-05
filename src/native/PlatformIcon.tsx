import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import { Platform } from 'react-native';

const MD: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  xmark: 'close',
  checkmark: 'check',
  plus: 'add',
  trash: 'delete-outline',
  'trash.fill': 'delete',
  heart: 'favorite-border',
  'moon.fill': 'dark-mode',
  leaf: 'eco',
  calendar: 'calendar-today',
  'square.grid.2x2': 'grid-view',
  tag: 'label',
  'arrow.counterclockwise': 'restart-alt',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  magnifyingglass: 'search',
  pencil: 'edit',
  camera: 'photo-camera',
  photo: 'photo-library',
  'arrow.triangle.2.circlepath': 'sync',
  scope: 'my-location',
  'yensign.circle': 'attach-money',
  'point.3.connected.trianglepath.dotted': 'category',
  'calendar.badge.clock': 'schedule',
  cube: 'category',
  banknote: 'payments',
  shippingbox: 'inventory',
  person: 'person',
};

export function PlatformIcon({
  name,
  size,
  color,
}: {
  name: SFSymbol | string;
  size: number;
  color: string;
}) {
  if (Platform.OS === 'ios') {
    return <SymbolView name={name as SFSymbol} size={size} tintColor={color} />;
  }
  return <MaterialIcons name={MD[name] ?? 'circle'} size={size} color={color} />;
}
