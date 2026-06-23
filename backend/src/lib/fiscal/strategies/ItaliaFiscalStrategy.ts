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

const TRACKED_TIP_METHODS = new Set(['CASH', 'CARD', 'DIGITAL', 'STRIPE'])

export class ItaliaFiscalStrategy extends BaseFiscalStrategy {
  readonly fiscalRegion = 'ITALIA' as const
  readonly taxRegion = 'IT_MAIN' as const

  getTipTreatment() {
    return 'EXEMPT_IT' as const
  }

  protected shouldTrackElectronicTips() {
    return true
  }

  getComplianceProfile(config: FiscalConfig): FiscalComplianceProfile {
    return {
      operativeRegime: 'IT_ITALIA',
      fiscalRegion: 'ITALIA',
      taxRegion: 'IT_MAIN',
      taxName: 'IVA',
      defaultTaxRate: config.taxRate,
      documentType: 'REGISTRATORE_TELEMATICO',
      invoiceSeriesPrefix: 'FATT',
      verifactuEnabled: false,
      integrityChainRequired: true,
      tipPolicyMessageKey: 'fiscal.tipPolicy.it',
    }
  }

  getReportLabels(taxRate: number): FiscalReportLabels {
    return {
      netRevenueSub: `Soggetto a imposta IVA (${taxRate}%)`,
      tipsLabel: 'Mance Elettroniche Tracciate',
      tipsSub: 'Esenti da IVA · Registro imposta sostitutiva 5% (art. 5 DPR 633/72)',
      tipsSectionTitle: 'Mance Elettroniche Tracciate (Esenti IVA — Soggette a imposta sostitutiva)',
      taxColumnName: 'IVA',
      complianceNotice: 'Catena di integrità crittografica attiva su ogni chiusura conto (predisposizione AgID).',
      legalDisclaimer:
        'Documento ad uso gestionale interno. Non sostituisce lo scontrino del Registratore Telematico né l\'invio allo SDI/FatturaPA.',
    }
  }

  getCheckoutTipPolicy(): CheckoutTipPolicy {
    return {
      treatment: 'EXEMPT_IT',
      messageKey: 'fiscal.tipPolicy.it',
      message: 'La mancia non concorre alla base imponibile IVA ed è tracciata per l\'imposta sostitutiva del 5%.',
    }
  }

  resolveInvoicePrefix(settingsPrefix?: string | null): string {
    const p = settingsPrefix?.trim().toUpperCase()
    return p || 'FATT'
  }

  getPdfExportOptions(): FiscalPdfExportOptions {
    return {
      includePaymentMethod: true,
      includeIntegrityHash: false,
      tipsSection: true,
    }
  }

  buildReportSummary(rows: FiscalTransactionRow[]): FiscalSummary {
    const base = this.sumRows(rows)
    const electronicTipsTotal = sumElectronicTips(rows)

    return {
      ...base,
      tipTaxStatus: 'EXEMPT_IT',
      electronicTipsTotal,
      tipsDistribution: {
        totalTracked: electronicTipsTotal,
        exemptFromTax: 'IVA',
        legalBasis: 'Imposta sostitutiva 5% su mance elettroniche tracciate (dipendenti)',
        trackedMethods: [...TRACKED_TIP_METHODS],
      },
    }
  }
}
