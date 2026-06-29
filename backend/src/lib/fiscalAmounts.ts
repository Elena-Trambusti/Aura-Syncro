import type { MoneyInput } from './money'
import { moneyNumber } from './money'

/** Resolve revenueAmount with legacy fallback (pre-migration orders may have 0/null). */
export function resolveRevenueAmount(order: {
  revenueAmount: MoneyInput | null
  total: MoneyInput
  subtotal: MoneyInput
  tax: MoneyInput
  tipAmount?: MoneyInput | null
}): number {
  const revenue = order.revenueAmount != null ? moneyNumber(order.revenueAmount) : null
  if (revenue != null && revenue > 0) {
    return revenue
  }
  const foodTotal = moneyNumber(order.subtotal) + moneyNumber(order.tax)
  if (foodTotal > 0) return foodTotal
  const tip = moneyNumber(order.tipAmount)
  return Math.max(0, moneyNumber(order.total) - tip)
}

export function resolveTipAmount(tipAmount: MoneyInput | null | undefined): number {
  return moneyNumber(tipAmount)
}

export function resolveOrderTotal(order: {
  total: MoneyInput
  revenueAmount: MoneyInput | null
  subtotal: MoneyInput
  tax: MoneyInput
  tipAmount?: MoneyInput | null
}): number {
  const total = moneyNumber(order.total)
  if (total > 0) return total
  return resolveRevenueAmount(order) + resolveTipAmount(order.tipAmount)
}
