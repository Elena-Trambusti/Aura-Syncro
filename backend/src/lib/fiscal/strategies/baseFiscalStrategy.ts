import type { FiscalConfig, FoodTaxResult, RegimeOrderTaxResult, TipTaxTreatment } from '../../taxEngine'
import { computeOrderTaxFromLines, roundMoney, scorporoTaxFromGross } from '../../taxEngine'
import type { FiscalSummary, FiscalTransactionRow } from '../fiscalReportTypes'
import type { FiscalStrategy } from './types'
import type {
  CheckoutTipPolicy,
  FiscalComplianceProfile,
  FiscalPdfExportOptions,
  FiscalReportLabels,
} from './types'

export abstract class BaseFiscalStrategy implements FiscalStrategy {
  abstract readonly fiscalRegion: FiscalStrategy['fiscalRegion']
  abstract readonly taxRegion: FiscalStrategy['taxRegion']

  abstract getTipTreatment(): TipTaxTreatment
  abstract getComplianceProfile(config: FiscalConfig): FiscalComplianceProfile
  abstract buildReportSummary(rows: FiscalTransactionRow[]): FiscalSummary
  abstract getReportLabels(taxRate: number): FiscalReportLabels
  abstract getCheckoutTipPolicy(): CheckoutTipPolicy
  abstract resolveInvoicePrefix(settingsPrefix?: string | null): string
  abstract getPdfExportOptions(): FiscalPdfExportOptions
  protected abstract shouldTrackElectronicTips(): boolean
  scorporoFromGross(grossFoodAmount: number, taxRate: number): FoodTaxResult {
    return scorporoTaxFromGross(grossFoodAmount, taxRate)
  }

  computeRegimeOrderTax(
    config: FiscalConfig,
    grossFoodAmount: number,
    tipAmount = 0,
  ): RegimeOrderTaxResult {
    const food = scorporoTaxFromGross(grossFoodAmount, config.taxRate)
    const tip = roundMoney(Math.max(0, Number(tipAmount) || 0))
    return {
      ...food,
      tipAmount: tip,
      tipTaxTreatment: this.getTipTreatment(),
      taxableGross: food.total,
      customerTotal: roundMoney(food.total + tip),
      electronicTipTracked: this.shouldTrackElectronicTips() && tip > 0,
    }
  }

  computeFromLines(config: FiscalConfig, lines: Parameters<typeof computeOrderTaxFromLines>[1]) {
    return computeOrderTaxFromLines(config, lines)
  }

  protected sumRows(rows: FiscalTransactionRow[]) {
    const totalFacturadoNeto = roundMoney(rows.reduce((s, r) => s + r.revenueAmount, 0))
    const totalPropinas = roundMoney(rows.reduce((s, r) => s + r.tipAmount, 0))
    const totalConciliacion = roundMoney(rows.reduce((s, r) => s + r.total, 0))
    return { totalFacturadoNeto, totalPropinas, totalConciliacion, transactionCount: rows.length }
  }
}
