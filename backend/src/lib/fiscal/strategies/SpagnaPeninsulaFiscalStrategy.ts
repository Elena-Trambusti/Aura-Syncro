import type { FiscalConfig } from '../../taxEngine'
import type { FiscalSummary, FiscalTransactionRow } from '../fiscalReportTypes'
import { sumElectronicTips } from '../tipTracking'
import { BaseFiscalStrategy } from './baseFiscalStrategy'
import type {
  CheckoutTipPolicy,
  FiscalComplianceProfile,
  FiscalPdfExportOptions,
  FiscalReportLabels,
} from './types'

export class SpagnaPeninsulaFiscalStrategy extends BaseFiscalStrategy {
  readonly fiscalRegion = 'SPAGNA_PENINSULA' as const
  readonly taxRegion = 'ES_PENINSULA' as const

  getTipTreatment() {
    return 'EXEMPT_IVA' as const
  }

  protected shouldTrackElectronicTips() {
    return false
  }

  getComplianceProfile(config: FiscalConfig): FiscalComplianceProfile {
    return {
      operativeRegime: 'ES_PENINSULA',
      fiscalRegion: 'SPAGNA_PENINSULA',
      taxRegion: 'ES_PENINSULA',
      taxName: 'IVA',
      defaultTaxRate: config.taxRate,
      documentType: 'FACTURA_ES',
      invoiceSeriesPrefix: 'F-',
      verifactuEnabled: true,
      integrityChainRequired: true,
      tipPolicyMessageKey: 'fiscal.tipPolicy.esPeninsula',
    }
  }

  getReportLabels(taxRate: number): FiscalReportLabels {
    return {
      netRevenueSub: `Sujeto a IVA (${taxRate}%)`,
      tipsLabel: 'Total Propinas Personal',
      tipsSub: 'Exentas de IVA · Ripartizione IRPF ordinario',
      taxColumnName: 'IVA',
      complianceNotice: 'Hash SHA-256 encadenado por transacción (Ley Antifraude 11/2021).',
      legalDisclaimer: 'Libro registro interno. No sustituye facturación oficial AEAT.',
    }
  }

  getCheckoutTipPolicy(): CheckoutTipPolicy {
    return {
      treatment: 'EXEMPT_IVA',
      messageKey: 'fiscal.tipPolicy.esPeninsula',
      message: 'La propina no está sujeta a IVA.',
    }
  }

  resolveInvoicePrefix(settingsPrefix?: string | null): string {
    const p = settingsPrefix?.trim().toUpperCase()
    return p || 'F-'
  }

  getPdfExportOptions(): FiscalPdfExportOptions {
    return {
      includePaymentMethod: false,
      includeIntegrityHash: true,
      tipsSection: true,
    }
  }

  buildReportSummary(rows: FiscalTransactionRow[]): FiscalSummary {
    const base = this.sumRows(rows)
    return {
      ...base,
      tipTaxStatus: 'EXEMPT_IVA',
      electronicTipsTotal: sumElectronicTips(rows),
      tipsDistribution: {
        totalTracked: base.totalPropinas,
        exemptFromTax: 'IVA',
        legalBasis: 'Propinas exentas de IVA peninsular',
        trackedMethods: [],
      },
    }
  }
}
