import { roundMoney } from '../taxEngine'

const TRACKED_TIP_METHODS = new Set(['CARD', 'DIGITAL', 'STRIPE'])

/** IT/ES: mance tracciate via POS/app (metodi elettronici). */
export function sumElectronicTips(
  rows: Array<{ tipAmount: number; paymentMethod?: string | null }>,
): number {
  return roundMoney(
    rows.reduce((sum, r) => {
      if (r.tipAmount <= 0) return sum
      if (r.paymentMethod && !TRACKED_TIP_METHODS.has(r.paymentMethod)) return sum
      return sum + r.tipAmount
    }, 0),
  )
}

export { TRACKED_TIP_METHODS }
