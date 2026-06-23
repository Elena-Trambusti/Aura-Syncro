import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { buildFiscalConfig } from '../../taxEngine'
import {
  buildFiscalSummary,
  getFiscalStrategy,
  getFiscalStrategyFromConfig,
} from './index'

describe('FiscalStrategy factory', () => {
  it('IT_ITALIA: IVA, RT, electronic tips tracking', () => {
    const strategy = getFiscalStrategy('ITALIA')
    const config = buildFiscalConfig({ fiscalRegion: 'ITALIA', taxRate: 10 })
    const profile = strategy.getComplianceProfile(config)

    assert.equal(profile.operativeRegime, 'IT_ITALIA')
    assert.equal(profile.taxName, 'IVA')
    assert.equal(profile.documentType, 'REGISTRATORE_TELEMATICO')
    assert.equal(profile.verifactuEnabled, false)
    assert.equal(strategy.resolveInvoicePrefix(null), 'FATT')

    const tax = strategy.computeRegimeOrderTax(config, 110, 15)
    assert.equal(tax.tipTaxTreatment, 'EXEMPT_IT')
    assert.equal(tax.electronicTipTracked, true)
    assert.equal(tax.customerTotal, 125)

    const labels = strategy.getReportLabels(10)
    assert.match(labels.netRevenueSub, /IVA/)
    assert.match(labels.tipsLabel, /Mance/)
  })

  it('ES_CANARIAS: IGIC 7%, Factura Simplificada T-, VeriFactu', () => {
    const strategy = getFiscalStrategy('ISOLE_CANARIE')
    const config = buildFiscalConfig({ fiscalRegion: 'ISOLE_CANARIE', taxRate: 7 })
    const profile = strategy.getComplianceProfile(config)

    assert.equal(profile.operativeRegime, 'ES_CANARIAS')
    assert.equal(profile.taxName, 'IGIC')
    assert.equal(profile.defaultTaxRate, 7)
    assert.equal(profile.documentType, 'FACTURA_SIMPLIFICADA')
    assert.equal(profile.invoiceSeriesPrefix, 'T-')
    assert.equal(profile.verifactuEnabled, true)
    assert.equal(strategy.resolveInvoicePrefix(null), 'T-')

    const tax = strategy.computeRegimeOrderTax(config, 107, 10)
    assert.equal(tax.tipTaxTreatment, 'EXEMPT_IGIC')
    assert.equal(tax.electronicTipTracked, false)

    const labels = strategy.getReportLabels(7)
    assert.match(labels.netRevenueSub, /IGIC/)
    assert.match(labels.tipsLabel, /Propinas/)
  })

  it('buildFiscalSummary delegates to strategy by taxRegion', () => {
    const rows = [
      {
        fecha: new Date(),
        orderId: 'o1',
        baseImponible: 90,
        tax: 10,
        taxRateApplied: 10,
        revenueAmount: 100,
        tipAmount: 5,
        total: 105,
        paymentMethod: 'CARD',
      },
    ]

    const itSummary = buildFiscalSummary(rows, 'IT_MAIN')
    assert.equal(itSummary.tipTaxStatus, 'EXEMPT_IT')
    assert.equal(itSummary.electronicTipsTotal, 5)
    assert.ok(itSummary.tipsDistribution?.legalBasis.includes('sostitutiva'))

    const esSummary = buildFiscalSummary(rows, 'ES_CANARIAS')
    assert.equal(esSummary.tipTaxStatus, 'EXEMPT_IGIC')
    assert.equal(esSummary.tipsDistribution?.exemptFromTax, 'IGIC')
  })

  it('getFiscalStrategyFromConfig resolves from tenant config', () => {
    const config = buildFiscalConfig({ countryCode: 'ES', taxRegion: 'ES_CANARIAS' })
    assert.equal(getFiscalStrategyFromConfig(config).taxRegion, 'ES_CANARIAS')
  })
})
