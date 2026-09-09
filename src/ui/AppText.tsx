import { Text as RNText, TextInput as RNTextInput } from 'react-native';
import type { TextProps, TextInputProps, TextStyle } from 'react-native';
import React from 'react';

import { familyFor } from '../typography';

function flattenStyle(style: unknown): TextStyle | undefined {
  if (!style) return undefined;
  if (Array.isArray(style)) {
    const out: TextStyle = {};
    for (const s of style) {
      const flat = flattenStyle(s);
      if (flat) Object.assign(out, flat);
    }
    return out;
  }
  return style as TextStyle;
}

/** Drop-in Text that uses the app face; CJK glyphs fall back to PingFang. */
export function Text(props: TextProps) {
  const { style, ...rest } = props;
  // Icon fonts (Ionicons, etc.) set fontFamily themselves — never override.
  if (flattenStyle(style)?.fontFamily) {
    return <RNText {...rest} style={style} />;
  }
  return <RNText {...rest} style={[{ fontFamily: familyFor(style) }, style]} />;
}

export function TextInput(props: TextInputProps) {
  const { style, ...rest } = props;
  if (flattenStyle(style)?.fontFamily) {
    return <RNTextInput {...rest} style={style} />;
  }
  return <RNTextInput {...rest} style={[{ fontFamily: familyFor(style) }, style]} />;
}

Text.displayName = 'AppText';
TextInput.displayName = 'AppTextInput';
