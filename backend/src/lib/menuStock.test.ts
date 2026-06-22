import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  maxPortionsFromLinks,
  isStockDepleted,
  canFulfillQuantity,
  computeMenuStockFields,
} from './menuStock'

describe('menuStock', () => {
  it('returns null max portions when no recipe links', () => {
    assert.equal(maxPortionsFromLinks([]), null)
    assert.equal(isStockDepleted([]), false)
    assert.equal(canFulfillQuantity([], 5), true)
  })

  it('computes limiting ingredient for portions', () => {
    const links = [
      { quantity: 0.2, inventoryItem: { quantity: 1 } },
      { quantity: 0.5, inventoryItem: { quantity: 2 } },
    ]
    assert.equal(maxPortionsFromLinks(links), 4)
    assert.equal(isStockDepleted(links), false)
    assert.equal(canFulfillQuantity(links, 4), true)
    assert.equal(canFulfillQuantity(links, 5), false)
  })

  it('marks sold out when stock cannot cover one portion', () => {
    const links = [{ quantity: 1, inventoryItem: { quantity: 0 } }]
    assert.equal(isStockDepleted(links), true)
    const fields = computeMenuStockFields({ available: true }, links)
    assert.equal(fields.soldOut, true)
    assert.equal(fields.orderable, false)
    assert.equal(fields.maxPortions, 0)
  })

  it('does not mark manually unavailable items as sold out', () => {
    const links = [{ quantity: 1, inventoryItem: { quantity: 0 } }]
    const fields = computeMenuStockFields({ available: false }, links)
    assert.equal(fields.soldOut, false)
    assert.equal(fields.orderable, false)
  })
})
