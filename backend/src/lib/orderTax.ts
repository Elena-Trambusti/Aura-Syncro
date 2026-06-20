import { loadRestaurantFiscalConfig, computeOrderTax } from './taxEngine'

export async function computeTaxForRestaurant(restaurantId: string, subtotal: number) {
  const { taxRate } = await loadRestaurantFiscalConfig(restaurantId)
  return computeOrderTax(subtotal, taxRate)
}

export async function computeTaxForExistingOrder(
  order: { restaurantId: string; taxRateApplied?: number | null },
  subtotal: number,
) {
  if (order.taxRateApplied != null && order.taxRateApplied > 0) {
    return computeOrderTax(subtotal, order.taxRateApplied)
  }
  return computeTaxForRestaurant(order.restaurantId, subtotal)
}
