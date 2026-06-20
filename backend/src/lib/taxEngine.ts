import { CountryCode, TaxRegion } from '@prisma/client'
import { prisma } from './prisma'

export interface FiscalConfig {
  countryCode: CountryCode
  taxRegion: TaxRegion
  taxRate: number
  taxName: string
  defaultLocale: string
  timezone: string
}

export interface RestaurantSettingsLike {
  countryCode?: CountryCode | null
  taxRegion?: TaxRegion | null
  taxRate?: number | null
  defaultLocale?: string | null
  taxId?: string | null
}

const REGION_META: Record<
  TaxRegion,
  Omit<FiscalConfig, 'taxRate'> & { defaultTaxRate: number }
> = {
  IT_MAIN: {
    countryCode: 'IT',
    taxRegion: 'IT_MAIN',
    taxName: 'IVA',
    defaultLocale: 'it',
    timezone: 'Europe/Rome',
    defaultTaxRate: 10,
  },
  ES_CANARIAS: {
    countryCode: 'ES',
    taxRegion: 'ES_CANARIAS',
    taxName: 'IGIC',
    defaultLocale: 'es',
    timezone: 'Atlantic/Canary',
    defaultTaxRate: 7,
  },
  ES_PENINSULA: {
    countryCode: 'ES',
    taxRegion: 'ES_PENINSULA',
    taxName: 'IVA',
    defaultLocale: 'es',
    timezone: 'Europe/Madrid',
    defaultTaxRate: 10,
  },
}

export function resolveTaxRegion(
  countryCode: CountryCode,
  taxRegion?: TaxRegion | null,
): TaxRegion {
  if (taxRegion && REGION_META[taxRegion]?.countryCode === countryCode) {
    return taxRegion
  }
  return countryCode === 'ES' ? 'ES_CANARIAS' : 'IT_MAIN'
}

export function buildFiscalConfig(settings?: RestaurantSettingsLike | null): FiscalConfig {
  const countryCode = settings?.countryCode ?? 'IT'
  const taxRegion = resolveTaxRegion(countryCode, settings?.taxRegion ?? null)
  const meta = REGION_META[taxRegion]
  const taxRate =
    settings?.taxRate != null && settings.taxRate > 0
      ? settings.taxRate
      : meta.defaultTaxRate

  return {
    countryCode: meta.countryCode,
    taxRegion: meta.taxRegion,
    taxRate,
    taxName: meta.taxName,
    defaultLocale: settings?.defaultLocale ?? meta.defaultLocale,
    timezone: meta.timezone,
  }
}

export function computeOrderTax(subtotal: number, taxRate: number) {
  const rate = taxRate / 100
  const tax = roundMoney(subtotal * rate)
  const total = roundMoney(subtotal + tax)
  return { subtotal: roundMoney(subtotal), tax, total, taxRateApplied: taxRate }
}

export function roundMoney(n: number): number {
  return Math.round(n * 100) / 100
}

export function fiscalConfigPayload(config: FiscalConfig, taxId?: string | null) {
  return {
    countryCode: config.countryCode,
    taxRegion: config.taxRegion,
    taxRate: config.taxRate,
    taxName: config.taxName,
    defaultLocale: config.defaultLocale,
    timezone: config.timezone,
    taxId: taxId ?? null,
  }
}

export function settingsForRegistration(countryCode: CountryCode, taxRegion?: TaxRegion | null) {
  const resolvedRegion = resolveTaxRegion(countryCode, taxRegion)
  const config = buildFiscalConfig({ countryCode, taxRegion: resolvedRegion })
  return {
    countryCode: config.countryCode,
    taxRegion: config.taxRegion,
    defaultLocale: config.defaultLocale,
    taxRate: config.taxRate,
  }
}

export async function loadRestaurantFiscalConfig(restaurantId: string) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    include: { settings: true },
  })
  if (!restaurant) {
    throw new Error('Ristorante non trovato')
  }
  const config = buildFiscalConfig(restaurant.settings)
  return {
    ...config,
    taxId: restaurant.settings?.taxId ?? null,
  }
}
