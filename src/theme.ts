export type ColorScheme = 'light' | 'dark';

/** Brand lime — tab bar selected only (designer lock) */
export const LIME = '#A9D62E';

export const palettes = {
  light: {
    tint: '#007AFF',
    statusActive: '#34C759',
    statusRetired: '#FF9500',
    statusSold: '#8E8E93',
    yellow: '#FF9500',
    orange: '#FF9500',
    teal: '#64D2FF',
    blue: '#007AFF',
    purple: '#AF52DE',
    lime: LIME,
    limeDark: '#607D0B',
    bg: '#F2F2F7',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    input: '#FFFFFF',
    chip: '#E5E5EA',
    chipSelectedBg: '#000000',
    chipSelectedText: '#FFFFFF',
    line: '#E5E5EA',
    track: '#E5E5EA',
    text: '#111111',
    textSecondary: '#8E8E93',
    textTertiary: '#AEAEB2',
    headerText: '#111111',
    tabInactive: '#8E8E93',
    tabSelected: LIME,
    danger: '#FF3B30',
    success: '#34C759',
    imageBg: '#F2F2F7',
    badgeBg: 'rgba(255,255,255,0.92)',
  },
  dark: {
    tint: '#0A84FF',
    statusActive: '#30D158',
    statusRetired: '#FF9F0A',
    statusSold: '#8E8E93',
    yellow: '#FF9F0A',
    orange: '#FF9F0A',
    teal: '#64D2FF',
    blue: '#0A84FF',
    purple: '#BF5AF2',
    lime: LIME,
    limeDark: '#C8F04D',
    bg: '#161618',
    surface: '#1C1C1E',
    card: '#2C2C2E',
    input: '#3A3A3C',
    chip: '#3A3A3C',
    chipSelectedBg: '#F2F2F7',
    chipSelectedText: '#1C1C1E',
    line: '#3A3A3C',
    track: '#48484A',
    text: '#F2F2F7',
    textSecondary: '#A1A1A6',
    textTertiary: '#8E8E93',
    headerText: '#F2F2F7',
    tabInactive: '#8E8E93',
    tabSelected: LIME,
    danger: '#FF453A',
    success: '#30D158',
    imageBg: '#3A3A3C',
    badgeBg: 'rgba(44,44,46,0.92)',
  },
} as const;

export type Palette = { [K in keyof (typeof palettes)['light']]: string };

/** @deprecated use useColors() so dark mode updates */
export const colors = palettes.light;

export const radius = {
  sm: 12,
  md: 16,
  lg: 22,
  xl: 26,
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
