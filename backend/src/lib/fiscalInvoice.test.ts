import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { formatInvoiceDocumentNumber } from './fiscalInvoice'

describe('fiscalInvoice', () => {
  it('formats document number with zero-padded sequence', () => {
    assert.equal(formatInvoiceDocumentNumber('FATT', 2026, 1), 'FATT-2026-001')
    assert.equal(formatInvoiceDocumentNumber('fatt', 2026, 42), 'FATT-2026-042')
    assert.equal(formatInvoiceDocumentNumber('', 2026, 1), 'FATT-2026-001')
  })
})
