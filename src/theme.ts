export type ColorScheme = 'light' | 'dark';

/** Brand lime (tab selected / accent) */
export const LIME = '#C8F04D';

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
    bg: '#000000',
    surface: '#1C1C1E',
    card: '#1C1C1E',
    input: '#2C2C2E',
    chip: '#2C2C2E',
    chipSelectedBg: '#FFFFFF',
    chipSelectedText: '#000000',
    line: '#38383A',
    track: '#3A3A3C',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    textTertiary: '#636366',
    headerText: '#FFFFFF',
    tabInactive: '#8E8E93',
    tabSelected: LIME,
    danger: '#FF453A',
    success: '#30D158',
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
  lg: 16,
  xl: 16,
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
