/** Backend DigitalOcean — usato in produzione se VITE_API_URL non è nel build. */
export const PRODUCTION_BACKEND_URL = 'https://aura-syncro-s98ae.ondigitalocean.app'

const PRODUCTION_HOSTS = new Set(['aurasyncro.com', 'www.aurasyncro.com'])

/** URL base del backend (senza /api). */
export function resolveBackendUrl(): string | undefined {
  const envUrl = import.meta.env.VITE_API_URL as string | undefined
  if (envUrl?.trim()) {
    return envUrl.trim().replace(/\/$/, '')
  }

  if (typeof window !== 'undefined' && PRODUCTION_HOSTS.has(window.location.hostname)) {
    return PRODUCTION_BACKEND_URL
  }

  return undefined
}

/** Base URL API (con /api). */
export function resolveApiBaseUrl(): string {
  const backend = resolveBackendUrl()
  if (backend) return `${backend}/api`
  return '/api'
}
