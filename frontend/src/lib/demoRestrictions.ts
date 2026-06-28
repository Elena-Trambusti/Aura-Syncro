import { isDemoUserEmail } from './demoAccounts'

const DEMO_WRITE_PREFIXES = [
  '/api/tables',
  '/api/orders',
  '/api/payments',
  '/api/checkout',
] as const

export function normalizeApiPath(path: string): string {
  const clean = path.split('?')[0]
  if (clean.startsWith('http')) {
    try {
      return normalizeApiPath(new URL(clean).pathname)
    } catch {
      return clean
    }
  }
  if (clean.startsWith('/api')) return clean
  return clean.startsWith('/') ? `/api${clean}` : `/api/${clean}`
}

export function isDemoMutationAllowed(url: string, method: string): boolean {
  const verb = (method || 'get').toUpperCase()
  if (verb === 'GET' || verb === 'HEAD' || verb === 'OPTIONS') return true
  const path = normalizeApiPath(url)
  return DEMO_WRITE_PREFIXES.some(prefix => path.startsWith(prefix))
}

/** Rotte dashboard dove la demo può modificare dati (tavoli + checkout collegato). */
export function isDemoWritableAppRoute(pathname: string): boolean {
  return pathname.startsWith('/tavoli') || pathname.startsWith('/checkout/')
}

export function isDemoReadOnlyRoute(pathname: string, userEmail?: string | null): boolean {
  if (!isDemoUserEmail(userEmail)) return false
  return !isDemoWritableAppRoute(pathname)
}
