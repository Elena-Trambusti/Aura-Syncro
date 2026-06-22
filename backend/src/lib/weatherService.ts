import type { WeatherCondition, WeatherForecastDay } from './predictiveEngine'

export interface Coordinates {
  lat: number
  lon: number
}

const GEOCODE_TTL_MS = 7 * 24 * 60 * 60 * 1000
const geoCache = new Map<string, { coords: Coordinates; at: number }>()

/** WMO weather codes → condizione semplificata per il motore predittivo */
export function mapWmoCodeToCondition(code: number): WeatherCondition {
  if (code === 0) return 'sunny'
  if (code >= 1 && code <= 3) return 'cloudy'
  if (code >= 45 && code <= 48) return 'cloudy'
  if (code >= 51) return 'rain'
  return 'cloudy'
}

/**
 * Geocoding gratuito via Open-Meteo (nessuna API key).
 * Usa indirizzo legale o indirizzo operativo del ristorante.
 */
export async function geocodeAddress(
  query: string,
  countryCode?: string,
): Promise<Coordinates | null> {
  const normalized = query.trim()
  if (!normalized) return null

  const cacheKey = `${countryCode ?? ''}|${normalized.toLowerCase()}`
  const cached = geoCache.get(cacheKey)
  if (cached && Date.now() - cached.at < GEOCODE_TTL_MS) {
    return cached.coords
  }

  const params = new URLSearchParams({
    name: normalized,
    count: '1',
    language: 'en',
    format: 'json',
  })
  if (countryCode) params.set('countryCode', countryCode)

  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`, {
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    const data = await res.json() as { results?: Array<{ latitude: number; longitude: number }> }
    const hit = data.results?.[0]
    if (!hit) return null

    const coords = { lat: hit.latitude, lon: hit.longitude }
    geoCache.set(cacheKey, { coords, at: Date.now() })
    return coords
  } catch {
    return null
  }
}

export async function resolveRestaurantCoordinates(input: {
  legalAddress?: string | null
  address?: string | null
  countryCode?: string
  latitude?: number | null
  longitude?: number | null
}): Promise<Coordinates | null> {
  if (input.latitude != null && input.longitude != null) {
    return { lat: input.latitude, lon: input.longitude }
  }
  const query = input.legalAddress?.trim() || input.address?.trim()
  if (!query) return null
  return geocodeAddress(query, input.countryCode)
}

/**
 * Previsione meteo 7 giorni via Open-Meteo (gratuito, senza API key).
 * Fallback: null se coordinate assenti o API non raggiungibile.
 */
export async function fetchOpenMeteoForecast(
  coords: Coordinates,
  daysAhead = 7,
  startOffset = 1,
): Promise<WeatherForecastDay[] | null> {
  const params = new URLSearchParams({
    latitude: String(coords.lat),
    longitude: String(coords.lon),
    daily: 'weather_code',
    timezone: 'auto',
    forecast_days: String(Math.min(16, startOffset + daysAhead)),
  })

  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return null

    const data = await res.json() as {
      daily?: { time?: string[]; weather_code?: number[] }
    }
    const times = data.daily?.time ?? []
    const codes = data.daily?.weather_code ?? []
    if (times.length === 0) return null

    const forecast: WeatherForecastDay[] = []
    for (let i = startOffset; i < startOffset + daysAhead && i < times.length; i++) {
      const dateStr = times[i]!
      const date = new Date(`${dateStr}T12:00:00`)
      forecast.push({
        date: dateStr,
        dayOfWeek: date.getDay(),
        condition: mapWmoCodeToCondition(codes[i] ?? 1),
      })
    }
    return forecast.length > 0 ? forecast : null
  } catch {
    return null
  }
}
