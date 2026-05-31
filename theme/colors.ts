// theme/colors.ts
// Material You — динамические цвета (имитация для React Native)

export const Colors = {
  // Primary — зелёный (ягоды/природа)
  primary: '#4CAF82',
  onPrimary: '#FFFFFF',
  primaryContainer: '#1E4A35',
  onPrimaryContainer: '#B7F0D3',

  // Secondary
  secondary: '#8FB59A',
  onSecondary: '#1A3525',
  secondaryContainer: '#2B4D3A',
  onSecondaryContainer: '#C5E8D2',

  // Tertiary — акцент
  tertiary: '#A8C4A0',
  onTertiary: '#1E3319',

  // Error
  error: '#FFB4AB',
  onError: '#690005',
  errorContainer: '#93000A',
  onErrorContainer: '#FFDAD6',

  // Warning
  warning: '#FFD740',
  warningContainer: '#332B00',

  // Surface — тёмная тема
  surface: '#1A1C1E',
  surfaceVariant: '#252829',
  surfaceContainer: '#1F2224',
  surfaceContainerHigh: '#292C2E',
  surfaceContainerHighest: '#333638',

  // Outline
  outline: '#3D4042',
  outlineVariant: '#2E3133',

  // Text
  onSurface: '#E2E2E6',
  onSurfaceVariant: '#A0A9A5',

  // Background
  background: '#111314',
  onBackground: '#E2E2E6',

  // Scrim
  scrim: 'rgba(0,0,0,0.6)',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 100,
} as const;

export const Typography = {
  displayLarge: { fontSize: 57, lineHeight: 64, fontWeight: '400' as const },
  displayMedium: { fontSize: 45, lineHeight: 52, fontWeight: '400' as const },
  displaySmall: { fontSize: 36, lineHeight: 44, fontWeight: '400' as const },
  headlineLarge: { fontSize: 32, lineHeight: 40, fontWeight: '400' as const },
  headlineMedium: { fontSize: 28, lineHeight: 36, fontWeight: '400' as const },
  headlineSmall: { fontSize: 24, lineHeight: 32, fontWeight: '400' as const },
  titleLarge: { fontSize: 22, lineHeight: 28, fontWeight: '500' as const },
  titleMedium: { fontSize: 16, lineHeight: 24, fontWeight: '500' as const },
  titleSmall: { fontSize: 14, lineHeight: 20, fontWeight: '500' as const },
  bodyLarge: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  bodyMedium: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  bodySmall: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
  labelLarge: { fontSize: 14, lineHeight: 20, fontWeight: '500' as const },
  labelMedium: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
  labelSmall: { fontSize: 11, lineHeight: 16, fontWeight: '500' as const },
} as const;
