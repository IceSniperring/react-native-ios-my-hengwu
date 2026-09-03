export type ColorScheme = 'light' | 'dark';

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
    bg: '#F2F2F7',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    input: '#FFFFFF',
    fill: 'rgba(120,120,128,0.12)',
    fill2: 'rgba(120,120,128,0.08)',
    chip: 'rgba(120,120,128,0.12)',
    chipSelectedBg: '#000000',
    chipSelectedText: '#FFFFFF',
    line: 'rgba(60,60,67,0.12)',
    separator: 'rgba(60,60,67,0.12)',
    track: 'rgba(120,120,128,0.12)',
    text: '#000000',
    textSecondary: 'rgba(60,60,67,0.60)',
    textTertiary: 'rgba(60,60,67,0.30)',
    headerText: '#000000',
    tabInactive: '#8E8E93',
    tabSelected: '#007AFF',
    danger: '#FF3B30',
    success: '#34C759',
    imageBg: '#F5F5F7',
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
    bg: '#000000',
    surface: '#1C1C1E',
    card: '#1C1C1E',
    input: '#2C2C2E',
    fill: 'rgba(120,120,128,0.24)',
    fill2: 'rgba(120,120,128,0.18)',
    chip: 'rgba(120,120,128,0.24)',
    chipSelectedBg: '#FFFFFF',
    chipSelectedText: '#000000',
    line: 'rgba(84,84,88,0.65)',
    separator: 'rgba(84,84,88,0.65)',
    track: 'rgba(120,120,128,0.24)',
    text: '#FFFFFF',
    textSecondary: 'rgba(235,235,245,0.60)',
    textTertiary: 'rgba(235,235,245,0.30)',
    headerText: '#FFFFFF',
    tabInactive: '#8E8E93',
    tabSelected: '#0A84FF',
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
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
};
