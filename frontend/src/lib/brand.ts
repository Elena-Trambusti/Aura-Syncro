/** Aura Syncro — brand tokens condivisi */
export const BRAND = {
  name: 'Aura Syncro',
  tagline: 'Sincronizza ogni istante del tuo ristorante',
  /** Colore logo celeste — brand identity */
  celeste: '#38bdf8',
  celesteDark: '#0ea5e9',
  logoGradient: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
  /** @deprecated Usare celeste / logoGradient per il brand */
  gold: '#38bdf8',
  goldHover: '#0ea5e9',
  amber: '#0ea5e9',
  /** Sfondo app — grigio caldo, non nero puro */
  dark: '#181614',
  /** Sidebar / header */
  darkSurface: '#1f1d1a',
  /** Card e pannelli */
  darkElevated: '#262320',
  darkBorder: '#3d3832',
} as const

/** Hex legacy oro → mappa al celeste brand */
export const LEGACY_GOLD_HEX = '#c9a227'

export function isLegacyGold(color?: string | null): boolean {
  if (!color) return true
  return color.toLowerCase() === LEGACY_GOLD_HEX
}
