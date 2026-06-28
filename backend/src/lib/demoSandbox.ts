/** Account demo live (prospect sandbox). */
export function isDemoUserEmail(email: string): boolean {
  return email === 'admin@demo.it' || /^admin@demo-[\w-]+\.com$/.test(email)
}

/** API consentite in scrittura durante la demo (flusso tavoli + comanda + incasso). */
const DEMO_WRITE_PREFIXES = [
  '/api/tables',
  '/api/orders',
  '/api/payments',
  '/api/checkout',
] as const

export function normalizeApiPath(path: string): string {
  const clean = path.split('?')[0]
  if (clean.startsWith('/api')) return clean
  return clean.startsWith('/') ? `/api${clean}` : `/api/${clean}`
}

export function isDemoWritePathAllowed(apiPath: string, method: string): boolean {
  const verb = method.toUpperCase()
  if (verb === 'GET' || verb === 'HEAD' || verb === 'OPTIONS') return true
  const path = normalizeApiPath(apiPath)
  return DEMO_WRITE_PREFIXES.some(prefix => path.startsWith(prefix))
}
