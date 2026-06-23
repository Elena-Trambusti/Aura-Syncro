/** Pastel badge styles for CRM customer tags */
const TAG_STYLES: Record<string, string> = {
  VIP: 'bg-aura-gold/10 text-amber-800 border-aura-gold/25',
  Celiaco: 'bg-orange-50 text-orange-800 border-orange-200',
  'Vino Rosso': 'bg-rose-50 text-rose-800 border-rose-200',
  Vegan: 'bg-emerald-500/10 text-emerald-800 border-emerald-500/25',
  Vegetariano: 'bg-green-50 text-green-800 border-green-200',
  Allergico: 'bg-red-500/10 text-red-800 border-red-500/25',
}

const DEFAULT_TAG_STYLE = 'bg-navy-surface text-fumo border-white/[0.08]'

export function tagBadgeClass(tag: string): string {
  return TAG_STYLES[tag] ?? DEFAULT_TAG_STYLE
}

export function customerDisplayName(c: { firstName?: string; lastName?: string; name: string }): string {
  const full = [c.firstName, c.lastName].filter(Boolean).join(' ').trim()
  return full || c.name
}

export function isVipCustomer(c: { tags?: string[]; totalVisits: number; totalSpent: number }): boolean {
  return c.tags?.includes('VIP') || c.totalVisits >= 10 || c.totalSpent >= 500
}
