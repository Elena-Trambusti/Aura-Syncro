import type { TFunction } from 'i18next'

export type CountryCode = 'IT' | 'ES'
export type TaxRegion = 'IT_MAIN' | 'ES_CANARIAS' | 'ES_PENINSULA'

export interface FiscalRegime {
  countryCode: CountryCode
  taxRegion: TaxRegion
  taxRate: number
  taxName: string
  defaultLocale: string
  timezone?: string
  taxId?: string | null
}

export const DEFAULT_FISCAL_REGIME: FiscalRegime = {
  countryCode: 'IT',
  taxRegion: 'IT_MAIN',
  taxRate: 10,
  taxName: 'IVA',
  defaultLocale: 'it',
}

export function fiscalRegimePrefix(taxRegion: TaxRegion): string {
  return `reportFiscal.byRegime.${taxRegion}`
}

export function tRegime(
  t: TFunction,
  taxRegion: TaxRegion,
  key: string,
  options?: Record<string, unknown>,
): string {
  return t(`${fiscalRegimePrefix(taxRegion)}.${key}`, options)
}

export function resolveFiscalRegime(
  source?: Partial<FiscalRegime> | null,
): FiscalRegime {
  if (!source?.taxRegion) return DEFAULT_FISCAL_REGIME
  return {
    countryCode: source.countryCode ?? DEFAULT_FISCAL_REGIME.countryCode,
    taxRegion: source.taxRegion,
    taxRate: source.taxRate ?? DEFAULT_FISCAL_REGIME.taxRate,
    taxName: source.taxName ?? DEFAULT_FISCAL_REGIME.taxName,
    defaultLocale: source.defaultLocale ?? DEFAULT_FISCAL_REGIME.defaultLocale,
    timezone: source.timezone,
    taxId: source.taxId ?? null,
  }
}

export function computeCartTax(subtotal: number, taxRate: number) {
  const tax = Math.round(subtotal * (taxRate / 100) * 100) / 100
  return { tax, total: Math.round((subtotal + tax) * 100) / 100 }
}
