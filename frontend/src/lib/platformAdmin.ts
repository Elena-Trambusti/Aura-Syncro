import axios from 'axios'
import { getApiBaseUrl } from './api'

const ADMIN_KEY_STORAGE = 'aura_platform_admin_key'

export function getStoredAdminKey(): string | null {
  return sessionStorage.getItem(ADMIN_KEY_STORAGE)
}

export function setStoredAdminKey(key: string): void {
  sessionStorage.setItem(ADMIN_KEY_STORAGE, key)
}

export function clearStoredAdminKey(): void {
  sessionStorage.removeItem(ADMIN_KEY_STORAGE)
}

export interface PlatformRegistration {
  userId: string
  ownerName: string
  email: string
  phone: string | null
  registeredAt: string
  registeredAtRome: string
  restaurantId: string
  restaurantName: string
  slug: string
  restaurantEmail: string | null
  isSetupComplete: boolean
  hasActiveSubscription: boolean
  planTier: string
  countryCode: string
}

export interface RegistrationsResponse {
  count: number
  filter: { today?: boolean; date?: string; timezone: string }
  registrations: PlatformRegistration[]
}

export async function fetchRegistrations(
  adminKey: string,
  params: { today?: boolean; date?: string; limit?: number },
): Promise<RegistrationsResponse> {
  const base = getApiBaseUrl().replace(/\/api$/, '')
  const { data } = await axios.get<RegistrationsResponse>(`${base}/api/admin/registrations`, {
    headers: { 'X-Admin-Key': adminKey },
    params,
  })
  return data
}
