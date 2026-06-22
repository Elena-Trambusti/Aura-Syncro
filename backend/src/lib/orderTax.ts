import { loadRestaurantFiscalConfig, computeOrderTaxForRegime, scorporoTaxFromGross } from './taxEngine'

/** @param grossAmount Somma prezzi menu IVA/IGIC inclusa (senza mancia) */
export async function computeTaxForRestaurant(restaurantId: string, grossAmount: number) {
  const config = await loadRestaurantFiscalConfig(restaurantId)
  return computeOrderTaxForRegime(config, grossAmount, 0)
}

/** @param grossAmount Somma prezzi menu IVA/IGIC inclusa (senza mancia) */
export async function computeTaxForExistingOrder(
  order: { restaurantId: string; taxRateApplied?: number | null },
  grossAmount: number,
) {
  if (order.taxRateApplied != null && order.taxRateApplied > 0) {
    return scorporoTaxFromGross(grossAmount, order.taxRateApplied)
  }
  return computeTaxForRestaurant(order.restaurantId, grossAmount)
}
