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

/** Trattamento fiscale mance per regime (sempre esenti da IVA/IGIC sul conto). */
export type TipTaxTreatment = 'EXEMPT_IT' | 'EXEMPT_IGIC' | 'EXEMPT_IVA'

export type FoodTaxResult = {
  subtotal: number
  tax: number
  /** Totale lordo piatti (imponibile + imposta), senza mancia */
  total: number
  taxRateApplied: number
}

export type RegimeOrderTaxResult = FoodTaxResult & {
  /** Mancia aggiunta al pagamento — mai inclusa in subtotal/tax */
  tipAmount: number
  tipTaxTreatment: TipTaxTreatment
  /** Lordo soggetto a scorporo (solo piatti) */
  taxableGross: number
  /** Totale incassato dal cliente (piatti + mancia) */
  customerTotal: number
  /** IT: mancia elettronica tracciata per registro (POS/app) */
  electronicTipTracked: boolean
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
  return countryCode === 'ES' ? 'ES_PENINSULA' : 'IT_MAIN'
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

/**
 * Scorporo IVA/IGIC da prezzo lordo menu (IVA/IGIC inclusa).
 * @param grossFoodAmount Somma prezzi menu — NON includere mai la mancia.
 */
export function scorporoTaxFromGross(grossFoodAmount: number, taxRate: number): FoodTaxResult {
  const rate = taxRate / 100
  const taxableBase = roundMoney(grossFoodAmount / (1 + rate))
  const tax = roundMoney(grossFoodAmount - taxableBase)
  const total = roundMoney(grossFoodAmount)
  return { subtotal: taxableBase, tax, total, taxRateApplied: taxRate }
}

/**
 * Scorporo IVA/IGIC da prezzo lordo (menu IVA inclusa — obbligo ristorazione IT/ES).
 * @param grossAmount Somma prezzi menu (totale piatti, imposta inclusa). Non passare la mancia.
 */
export function computeOrderTax(grossAmount: number, taxRate: number): FoodTaxResult {
  return scorporoTaxFromGross(grossAmount, taxRate)
}

export function getTipTaxTreatment(taxRegion: TaxRegion): TipTaxTreatment {
  if (taxRegion === 'ES_CANARIAS') return 'EXEMPT_IGIC'
  if (taxRegion === 'ES_PENINSULA') return 'EXEMPT_IVA'
  return 'EXEMPT_IT'
}

/**
 * Calcolo fiscale per regime ristorante: scorporo sui soli piatti, mancia sempre esclusa.
 */
export function computeOrderTaxForRegime(
  config: FiscalConfig,
  grossFoodAmount: number,
  tipAmount = 0,
): RegimeOrderTaxResult {
  const food = scorporoTaxFromGross(grossFoodAmount, config.taxRate)
  const tip = roundMoney(Math.max(0, Number(tipAmount) || 0))
  return {
    ...food,
    tipAmount: tip,
    tipTaxTreatment: getTipTaxTreatment(config.taxRegion),
    taxableGross: food.total,
    customerTotal: roundMoney(food.total + tip),
    electronicTipTracked: config.taxRegion === 'IT_MAIN' && tip > 0,
  }
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
