import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import i18n from '../i18n'
import { api, setTenantHeader } from '../lib/api'
import { connectSocket, disconnectSocket } from '../lib/socket'
import { applyTenantCssVars } from '../lib/tenantTheme'
import type { CountryCode, FiscalRegime, TaxRegion } from '../lib/fiscalRegime'
import { DEFAULT_FISCAL_REGIME, resolveFiscalRegime } from '../lib/fiscalRegime'

interface User {
  id: string
  name: string
  email: string
  role: string
}

export interface Restaurant extends FiscalRegime {
  id: string
  name: string
  slug: string
  colorTheme: string
  logoUrl?: string | null
  timezone?: string
}

interface AuthContextType {
  user: User | null
  restaurant: Restaurant | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  refreshRestaurant: () => Promise<void>
}

export interface RegisterData {
  restaurantName: string
  name: string
  email: string
  password: string
  phone?: string
  countryCode?: CountryCode
  taxRegion?: TaxRegion
}

const AuthContext = createContext<AuthContextType | null>(null)
const LANG_KEY = 'aura-lang'

function normalizeRestaurant(raw: Record<string, unknown>): Restaurant {
  const fiscal = resolveFiscalRegime(raw as Partial<FiscalRegime>)
  return {
    id: String(raw.id),
    name: String(raw.name),
    slug: String(raw.slug),
    colorTheme: String(raw.colorTheme || '#c9a227'),
    logoUrl: (raw.logoUrl as string | null | undefined) ?? null,
    timezone: raw.timezone ? String(raw.timezone) : fiscal.timezone,
    ...fiscal,
  }
}

function applyRestaurantLocale(defaultLocale?: string) {
  if (!defaultLocale) return
  const saved = localStorage.getItem(LANG_KEY)
  if (!saved) {
    i18n.changeLanguage(defaultLocale)
    localStorage.setItem(LANG_KEY, defaultLocale)
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [isLoading, setIsLoading] = useState(() => !!localStorage.getItem('token'))

  const setAuth = useCallback((data: { token: string; user: User; restaurant: Record<string, unknown> }) => {
    const normalized = normalizeRestaurant(data.restaurant)
    localStorage.setItem('token', data.token)
    setTenantHeader(normalized.id)
    setToken(data.token)
    setUser(data.user)
    setRestaurant(normalized)
    applyTenantCssVars(normalized.colorTheme)
    applyRestaurantLocale(normalized.defaultLocale)
    connectSocket(data.token)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setTenantHeader(null)
    setToken(null)
    setUser(null)
    setRestaurant(null)
    applyTenantCssVars('#c9a227')
    disconnectSocket()
  }, [])

  const refreshRestaurant = useCallback(async () => {
    const res = await api.get('/auth/me')
    setUser(res.data.user)
    setRestaurant(normalizeRestaurant(res.data.restaurant))
  }, [])

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (!storedToken) {
      setIsLoading(false)
      return
    }
    api.get('/auth/me')
      .then(res => {
        setUser(res.data.user)
        const normalized = normalizeRestaurant(res.data.restaurant)
        setRestaurant(normalized)
        setTenantHeader(normalized.id)
        applyTenantCssVars(normalized.colorTheme)
        connectSocket(storedToken)
      })
      .catch(() => logout())
      .finally(() => setIsLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    applyTenantCssVars(restaurant?.colorTheme)
  }, [restaurant?.colorTheme])

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password })
    setAuth(res.data)
  }

  const register = async (data: RegisterData) => {
    const res = await api.post('/auth/register', data)
    setAuth(res.data)
  }

  return (
    <AuthContext.Provider value={{ user, restaurant, token, isLoading, login, register, logout, refreshRestaurant }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTenantTheme() {
  const { restaurant } = useAuth()
  return restaurant?.colorTheme ?? '#c9a227'
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFiscalRegime(): FiscalRegime {
  const { restaurant } = useAuth()
  return restaurant ?? DEFAULT_FISCAL_REGIME
}
