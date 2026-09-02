import { ActionSheetIOS, Alert, Platform } from 'react-native';

export type SheetItem = {
  label: string;
  destructive?: boolean;
  onPress: () => void;
};

export function showNativeSheet(opts: {
  title?: string;
  message?: string;
  cancel?: string;
  items: SheetItem[];
}) {
  const cancel = opts.cancel ?? '取消';
  if (Platform.OS === 'ios') {
    const labels = [...opts.items.map((i) => i.label), cancel];
    const destructive = opts.items.findIndex((i) => i.destructive);
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: opts.title,
        message: opts.message,
        options: labels,
        cancelButtonIndex: labels.length - 1,
        destructiveButtonIndex: destructive >= 0 ? destructive : undefined,
        userInterfaceStyle: 'light',
      },
      (index) => {
        if (index === labels.length - 1 || index == null) return;
        opts.items[index]?.onPress();
      },
    );
    return;
  }

  Alert.alert(opts.title ?? '', opts.message, [
    ...opts.items.map((item) => ({
      text: item.label,
      style: item.destructive ? ('destructive' as const) : ('default' as const),
      onPress: item.onPress,
    })),
    { text: cancel, style: 'cancel' as const },
  ]);
}
