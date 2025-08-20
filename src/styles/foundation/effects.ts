/**
 * Standard gradient configurations for The Archive RPG aesthetic
 */
export const standardGradients = {
  mystical: ['rgba(60, 30, 20, 0.95)', 'rgba(30, 20, 40, 0.95)', 'rgba(20, 30, 60, 0.95)'],
  archive: ['rgba(40, 25, 15, 0.98)', 'rgba(25, 20, 30, 0.98)'],
  personality: ['rgba(25, 35, 50, 0.95)', 'rgba(35, 25, 45, 0.95)'],
  character: ['rgba(35, 25, 20, 0.98)', 'rgba(25, 35, 40, 0.98)'],
  story: ['rgba(20, 25, 35, 0.96)', 'rgba(30, 20, 25, 0.96)'],
  modal: ['rgba(15, 10, 20, 0.98)', 'rgba(20, 15, 25, 0.98)'],
  card: ['rgba(45, 35, 25, 0.92)', 'rgba(35, 45, 55, 0.92)'],
} as const;

/**
 * Standard shadow configurations
 */
export const standardShadows = {
  card: {
    shadowColor: 'rgba(0, 0, 0, 0.4)',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
  button: {
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  modal: {
    shadowColor: 'rgba(0, 0, 0, 0.6)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 16,
  },
  floating: {
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
  deep: {
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowOffset: { width: 4, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 12,
  },
  subtle: {
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
} as const;

/**
 * Standard border configurations
 */
export const standardBorders = {
  thin: {
    borderWidth: 1,
    borderStyle: 'solid' as const,
  },
  medium: {
    borderWidth: 2,
    borderStyle: 'solid' as const,
  },
  thick: {
    borderWidth: 3,
    borderStyle: 'solid' as const,
  },
  mystical: {
    borderWidth: 2,
    borderStyle: 'solid' as const,
    borderRadius: 8,
  },
  rounded: {
    borderWidth: 1,
    borderStyle: 'solid' as const,
    borderRadius: 12,
  },
} as const;
