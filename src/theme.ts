export type ColorScheme = 'light' | 'dark';

const lime = '#C8F04D';

export const palettes = {
  light: {
    lime,
    limeDeep: '#B6E62A',
    limeDark: '#8FBE12',
    limeSoft: '#EAF8A8',
    limeHeader: '#C9F247',
    limeHeaderTop: '#D8F86A',
    limeTrack: '#EEF8C8',
    yellow: '#F5C400',
    orange: '#FF8A3A',
    teal: '#3EE0C8',
    blue: '#5B8CFF',
    purple: '#A78BFA',
    bg: '#FFFFFF',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    input: '#F7F7F7',
    chip: '#F2F2F2',
    line: '#EFEFEF',
    text: '#111111',
    textSecondary: '#8B8B8B',
    textTertiary: '#B4B4B4',
    headerText: '#111111',
    tabInactive: '#8E8E93',
    tabSelected: lime,
    danger: '#FF4D4F',
    success: '#22C55E',
    imageBg: '#FAFAFA',
    badgeBg: 'rgba(255,255,255,0.92)',
  },
  dark: {
    lime,
    limeDeep: '#C8F04D',
    limeDark: '#C8F04D',
    limeSoft: '#2A3A10',
    limeHeader: '#1A2408',
    limeHeaderTop: '#24300A',
    limeTrack: '#2A3A10',
    yellow: '#F5C400',
    orange: '#FF8A3A',
    teal: '#3EE0C8',
    blue: '#5B8CFF',
    purple: '#A78BFA',
    bg: '#0E0E0E',
    surface: '#1C1C1E',
    card: '#1C1C1E',
    input: '#2C2C2E',
    chip: '#2C2C2E',
    line: '#2C2C2E',
    text: '#F4F4F0',
    textSecondary: '#A3A3A0',
    textTertiary: '#6E6E6B',
    headerText: '#EAF8A8',
    tabInactive: '#8E8E93',
    tabSelected: lime,
    danger: '#FF6B6D',
    success: '#3DDC84',
    imageBg: '#2C2C2E',
    badgeBg: 'rgba(28,28,30,0.92)',
  },
} as const;

export type Palette = { [K in keyof (typeof palettes)['light']]: string };

/** @deprecated use useColors() so dark mode updates */
export const colors = palettes.light;

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 24,
  pill: 999,
};

export const shadow = {
  card: {
    shadowColor: '#111111',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
};
