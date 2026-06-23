import type { FiscalRegion, TaxRegion } from '@prisma/client'
import type {
  FiscalConfig,
  FoodTaxResult,
  RegimeOrderTaxResult,
  TipTaxTreatment,
} from '../../taxEngine'
import type { FiscalSummary, FiscalTransactionRow } from '../fiscalReportTypes'

/**
 * Regime operativo tenant (UI / API).
 * Mappa 1:1 su Prisma FiscalRegion.
 */
export type FiscalOperativeRegime = 'IT_ITALIA' | 'ES_CANARIAS' | 'ES_PENINSULA'

export type FiscalDocumentType = 'REGISTRATORE_TELEMATICO' | 'FACTURA_SIMPLIFICADA' | 'FACTURA_ES'

export type FiscalComplianceProfile = {
  operativeRegime: FiscalOperativeRegime
  fiscalRegion: FiscalRegion
  taxRegion: TaxRegion
  taxName: string
  defaultTaxRate: number
  documentType: FiscalDocumentType
  /** Serie numerazione (es. FATT, T-) */
  invoiceSeriesPrefix: string
  verifactuEnabled: boolean
  integrityChainRequired: boolean
  tipPolicyMessageKey: string
}

export type FiscalReportLabels = {
  netRevenueSub: string
  tipsLabel: string
  tipsSub: string
  tipsSectionTitle?: string
  taxColumnName: string
  complianceNotice: string
  legalDisclaimer: string
}

export type FiscalPdfExportOptions = {
  includePaymentMethod: boolean
  includeIntegrityHash: boolean
  tipsSection: boolean
}

export type CheckoutTipPolicy = {
  treatment: TipTaxTreatment
  messageKey: string
  message: string
}

/** Strategia fiscale per nazione/regime tenant (Strategy pattern). */
export interface FiscalStrategy {
  readonly fiscalRegion: FiscalRegion
  readonly taxRegion: TaxRegion

  getComplianceProfile(config: FiscalConfig): FiscalComplianceProfile
  getTipTreatment(): TipTaxTreatment
  computeRegimeOrderTax(
    config: FiscalConfig,
    grossFoodAmount: number,
    tipAmount?: number,
  ): RegimeOrderTaxResult
  buildReportSummary(rows: FiscalTransactionRow[]): FiscalSummary
  getReportLabels(taxRate: number): FiscalReportLabels
  getCheckoutTipPolicy(): CheckoutTipPolicy
  resolveInvoicePrefix(settingsPrefix?: string | null): string
  getPdfExportOptions(): FiscalPdfExportOptions
  scorporoFromGross(grossFoodAmount: number, taxRate: number): FoodTaxResult
}
