const DEMO_SESSION_KEY = 'aura-demo-session'

const LANDING_PATHS = new Set(['/', '/it', '/es', '/es-cn'])

export function isLandingPath(pathname: string): boolean {
  const normalized = pathname.toLowerCase().replace(/\/+$/, '') || '/'
  return LANDING_PATHS.has(normalized)
}

export function markDemoSession(): void {
  try {
    sessionStorage.setItem(DEMO_SESSION_KEY, '1')
  } catch {
    /* storage disabilitato */
  }
}

export function isDemoSession(): boolean {
  try {
    return sessionStorage.getItem(DEMO_SESSION_KEY) === '1'
  } catch {
    return false
  }
}

export function clearDemoSession(): void {
  try {
    sessionStorage.removeItem(DEMO_SESSION_KEY)
  } catch {
    /* storage disabilitato */
  }
}
