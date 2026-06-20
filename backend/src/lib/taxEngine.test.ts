import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  buildFiscalConfig,
  computeOrderTax,
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

  it('computes order tax from rate', () => {
    const result = computeOrderTax(100, 10)
    assert.deepEqual(result, { subtotal: 100, tax: 10, total: 110, taxRateApplied: 10 })
  })

  it('resolves tax region from country when region is invalid', () => {
    assert.equal(resolveTaxRegion('ES', 'IT_MAIN'), 'ES_CANARIAS')
    assert.equal(resolveTaxRegion('IT', 'ES_CANARIAS'), 'IT_MAIN')
  })

  it('builds registration settings for Spain peninsula', () => {
    const settings = settingsForRegistration('ES', 'ES_PENINSULA')
    assert.equal(settings.taxRegion, 'ES_PENINSULA')
    assert.equal(settings.defaultLocale, 'es')
    assert.equal(settings.taxRate, 10)
  })
})
