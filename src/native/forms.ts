/**
 * Shared contracts for the app's form surfaces.
 *
 * Both `LoginForm` and `ProfileForm` are built from React Native's platform
 * views (`UITextField`/`UILabel`/`UIView`) and styled to the iOS 26 visual
 * language, so there is a single implementation per form rather than a
 * per-platform split. `ConfirmDialog` is a thin wrapper over `Alert.alert`.
 */

export type LoginMode = 'signin' | 'signup';

export type LoginFormProps = {
  mode: LoginMode;
  busy: boolean;
  error: string | null;
  /** Fired with the live field values — the form owns its own text state. */
  onSubmit: (email: string, password: string) => void;
  /** Hosted (browser) sign-in — covers Google/Apple and passwordless. */
  onHosted: () => void;
  onToggleMode: () => void;
};

export type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export type ProfileFormProps = {
  /** Nickname from Clerk `unsafeMetadata`; empty string when unset. */
  nickname: string;
  email: string | null;
  /** Current avatar URL (Clerk CDN), or null when the user has none. */
  avatarUrl: string | null;
  busy: boolean;
  error: string | null;
  /** Glyph rendered when there is no avatar. */
  fallbackGlyph: string;
  onPickAvatar: () => void;
  onSave: (nickname: string) => void;
};
