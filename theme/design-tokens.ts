
export const colors = {
  archive: {
    dark: '#0a0a0a',
    darker: '#000000',
    purple: '#6B46C1',
    purpleLight: '#8B5CF6',
    purpleDark: '#5B21B6',
    teal: '#0D9488',
    tealDark: '#0F766E',
    white: '#ffffff',
    backgroundDark: 'rgba(255, 255, 255, 0.08)',
    borderSubtle: 'rgba(255, 255, 255, 0.2)',
  },
  void: {
    black: '#000000',
    dark: '#1a0a1a',
    purple: '#2D1B4E',
  },
  crisisHelp: {
    cardBackground: 'rgba(255, 255, 255, 0.1)',
    cardBorder: 'rgba(255, 255, 255, 0.2)',
    actionButtonBackground: 'rgba(255, 255, 255, 0.15)',
    actionButtonBorder: 'rgba(255, 255, 255, 0.3)',
  },
} as const


/** Font stacks. Keys here are used by components/ui/Text (see variantToFont). */
export const fontFamily = {
  /** Text variant: serif. System fallback. */
  serif: ['Georgia', 'serif'],
  /** Text variant: body. Body/copy: CrimsonPro-Medium-Italic. */
  body: ['CrimsonPro-Medium-Italic', 'serif'],
  /** Text variant: label. UI/labels: Quicksand-SemiBold. */
  ui: ['Quicksand-SemiBold', 'sans-serif'],
  /** Text variants: heading, tagline. Display/headings: BeyondWonderland. */
  display: ['BeyondWonderland', 'serif'],
  /** Text variant: titleWhite. Legacy title (manaspc / FontTitle-White). */
  titleWhite: ['FontTitle-White', 'sans-serif'],
  /** Text variant: title. Credits, card titles: VT323-Regular. */
  title: ['VT323-Regular', 'monospace'],
} as const

/** Typography sizes: fontSize and lineHeight. Used by components/ui/Text. */
export const typography = {
  heading: {
    1: { fontSize: 42, lineHeight: 48 },
    2: { fontSize: 32, lineHeight: 38 },
    3: { fontSize: 24, lineHeight: 28 },
  },
  body: {
    1: { fontSize: 16, lineHeight: 24 },
    2: { fontSize: 14, lineHeight: 20 },
    3: { fontSize: 13, lineHeight: 18, fontWeight: '500' as const },
    4: { fontSize: 12, lineHeight: 16, fontWeight: '600' as const },
  },
  title: {
    1: { fontSize: 20, lineHeight: 24 },
    2: { fontSize: 14, lineHeight: 18 },
    3: { fontSize: 13, lineHeight: 16 },
    4: { fontSize: 12, lineHeight: 14 },
  },
  /** Same scale as title; used by variant titleWhite (FontTitle-White). */
  titleWhite: {
    1: { fontSize: 20, lineHeight: 24 },
    2: { fontSize: 14, lineHeight: 18 },
    3: { fontSize: 13, lineHeight: 16 },
    4: { fontSize: 12, lineHeight: 14 },
  },
  tagline: {
    1: { fontSize: 24, lineHeight: 24 },
    2: { fontSize: 20, lineHeight: 20 },
    3: { fontSize: 18, lineHeight: 18 },
  },
  label: {
    fontSize: 13,
    fontWeight: '500' as const,
    letterSpacing: 3,
    opacity: 0.8,
  },
} as const

export const textColorDefault = colors.archive.white
