/** Riga del libro registro fiscale (chiusura conto pagata). */
export type FiscalTransactionRow = {
  fecha: Date
  orderId: string
  baseImponible: number
  tax: number
  taxRateApplied: number | null
  revenueAmount: number
  tipAmount: number
  total: number
  paymentMethod?: string | null
  fiscalIntegrityHash?: string | null
  fiscalPrevHash?: string | null
}

/** Totali aggregati del report fiscale per periodo. */
export type FiscalSummary = {
  totalFacturadoNeto: number
  totalPropinas: number
  totalConciliacion: number
  transactionCount: number
  /** IT — registro mance elettroniche tracciate (POS/app). */
  electronicTipsTotal?: number
  tipTaxStatus: 'EXEMPT_IGIC' | 'EXEMPT_IVA' | 'EXEMPT_IT'
  /** Ripartizione mance/propinas per regime (IT sostitutiva 5%, ES IRPF). */
  tipsDistribution?: {
    totalTracked: number
    exemptFromTax: string
    legalBasis: string
    trackedMethods?: string[]
  }
}
