import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';

import type { ConfirmDialogProps } from './forms';

/**
 * Confirmation dialog.
 *
 * `Alert.alert` is the platform's own dialog — `UIAlertController` on iOS and
 * `AlertDialog` on Android — so there is no dialog chrome to hand-build and no
 * iOS/Android split is needed. It stays a declarative component so callers can
 * drive it from a `visible` boolean.
 */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = '取消',
  destructive,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Latched: re-renders while visible must not stack duplicate dialogs.
  const shown = useRef(false);

  useEffect(() => {
    if (!visible) {
      shown.current = false;
      return;
    }
    if (shown.current) return;
    shown.current = true;
    Alert.alert(
      title,
      message,
      [
        { text: cancelLabel, style: 'cancel', onPress: onCancel },
        {
          text: confirmLabel,
          style: destructive ? 'destructive' : 'default',
          onPress: onConfirm,
        },
      ],
      { cancelable: true, onDismiss: onCancel },
    );
  }, [visible, title, message, confirmLabel, cancelLabel, destructive, onConfirm, onCancel]);

  return null;
}
