import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  buildFiscalConfig,
  computeOrderTax,
  computeOrderTaxForRegime,
  resolveTaxRegion,
  settingsForRegistration,
} from './taxEngine'

describe('taxEngine', () => {
  it('defaults to Italy when settings are missing', () => {
    const config = buildFiscalConfig(null)
    assert.equal(config.countryCode, 'IT')
    assert.equal(config.taxRegion, 'IT_MAIN')
    assert.equal(config.taxName, 'IVA')
    assert.equal(config.taxRate, 10)
  })

  it('uses Canarias IGIC defaults for ES_CANARIAS', () => {
    const config = buildFiscalConfig({ countryCode: 'ES', taxRegion: 'ES_CANARIAS' })
    assert.equal(config.taxName, 'IGIC')
    assert.equal(config.taxRate, 7)
  })

  it('respects custom taxRate override', () => {
    const config = buildFiscalConfig({ countryCode: 'IT', taxRegion: 'IT_MAIN', taxRate: 22 })
    assert.equal(config.taxRate, 22)
  })

  it('scorpora IVA 10% da prezzo lordo (ristorazione IT)', () => {
    const result = computeOrderTax(110, 10)
    assert.deepEqual(result, { subtotal: 100, tax: 10, total: 110, taxRateApplied: 10 })
  })

  it('scorpora IGIC 7% da prezzo lordo (ristorazione Canarie)', () => {
    const result = computeOrderTax(107, 7)
    assert.deepEqual(result, { subtotal: 100, tax: 7, total: 107, taxRateApplied: 7 })
  })

  it('gestisce arrotondamento su importi non tondi', () => {
    const result = computeOrderTax(100, 10)
    assert.equal(result.subtotal, 90.91)
    assert.equal(result.tax, 9.09)
    assert.equal(result.total, 100)
    assert.equal(result.subtotal + result.tax, result.total)
  })

  it('resolves tax region from country when region is invalid', () => {
    assert.equal(resolveTaxRegion('ES', 'IT_MAIN'), 'ES_PENINSULA')
    assert.equal(resolveTaxRegion('ES', null), 'ES_PENINSULA')
    assert.equal(resolveTaxRegion('IT', 'ES_CANARIAS'), 'IT_MAIN')
  })

  it('builds registration settings for Spain peninsula', () => {
    const settings = settingsForRegistration('ES', 'ES_PENINSULA')
    assert.equal(settings.taxRegion, 'ES_PENINSULA')
    assert.equal(settings.defaultLocale, 'es')
    assert.equal(settings.taxRate, 10)
  })

  it('computeOrderTaxForRegime keeps tip out of taxable base (IT)', () => {
    const config = buildFiscalConfig({ countryCode: 'IT', taxRegion: 'IT_MAIN' })
    const withTip = computeOrderTaxForRegime(config, 110, 25)
    const foodOnly = computeOrderTaxForRegime(config, 110, 0)
    assert.equal(withTip.subtotal, foodOnly.subtotal)
    assert.equal(withTip.tax, foodOnly.tax)
    assert.equal(withTip.customerTotal, 135)
  })
})
