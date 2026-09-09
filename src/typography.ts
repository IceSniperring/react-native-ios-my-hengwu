import {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/nunito';
import { StyleSheet, type TextStyle } from 'react-native';

export const FONT = {
  regular: 'Nunito_400Regular',
  medium: 'Nunito_500Medium',
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extrabold: 'Nunito_800ExtraBold',
} as const;

const WEIGHT_FAMILY: Record<string, string> = {
  '100': FONT.regular,
  '200': FONT.regular,
  '300': FONT.regular,
  '400': FONT.regular,
  normal: FONT.regular,
  '500': FONT.medium,
  '600': FONT.semibold,
  '700': FONT.bold,
  bold: FONT.bold,
  '800': FONT.extrabold,
  '900': FONT.extrabold,
};

function flatten(style: unknown): TextStyle | undefined {
  if (!style) return undefined;
  if (Array.isArray(style)) {
    const out: TextStyle = {};
    for (const s of style) {
      const flat = flatten(s);
      if (flat) Object.assign(out, flat);
    }
    return out;
  }
  return style as TextStyle;
}

export function familyFor(style: unknown): string {
  const flat = flatten(style);
  if (flat?.fontFamily && String(flat.fontFamily).startsWith('Nunito_')) {
    return flat.fontFamily;
  }
  const weight = String(flat?.fontWeight ?? '400');
  return WEIGHT_FAMILY[weight] ?? FONT.regular;
}

export function useAppFonts() {
  const [loaded, error] = useFonts({
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });
  return loaded || !!error;
}

export const typeStyles = StyleSheet.create({
  title: { fontFamily: FONT.bold },
  body: { fontFamily: FONT.regular },
});
