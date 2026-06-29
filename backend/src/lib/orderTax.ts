import { prisma } from './prisma'
import {
  loadRestaurantFiscalConfig,
  computeOrderTaxForRegime,
  computeOrderTaxFromLines,
  scorporoTaxFromGross,
  type OrderLineForTax,
} from './taxEngine'
import type { MoneyInput } from './money'

/** @param grossAmount Somma prezzi menu IVA/IGIC inclusa (senza mancia) */
export async function computeTaxForRestaurant(restaurantId: string, grossAmount: number) {
  const config = await loadRestaurantFiscalConfig(restaurantId)
  return computeOrderTaxForRegime(config, grossAmount, 0)
}

/** Scorporo multi-aliquota da righe con prezzi lordi menu. */
export async function computeTaxFromGrossLines(
  restaurantId: string,
  lines: OrderLineForTax[],
) {
  const config = await loadRestaurantFiscalConfig(restaurantId)
  return computeOrderTaxFromLines(config, lines)
}

type OrderItemForTax = {
  quantity: number
  unitPrice: MoneyInput
  menuItemId: string
  status?: string
}

/** Ricalcolo fiscale da righe ordine (usa taxRate del menuItem). */
export async function computeTaxForOrderItems(
  restaurantId: string,
  items: OrderItemForTax[],
) {
  const active = items.filter(i => i.status !== 'CANCELLED')
  if (active.length === 0) {
    return computeTaxFromGrossLines(restaurantId, [])
  }

  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: active.map(i => i.menuItemId) }, restaurantId },
    select: { id: true, taxRate: true },
  })
  const rateByMenuItem = new Map(menuItems.map(m => [m.id, m.taxRate]))

  return computeTaxFromGrossLines(
    restaurantId,
    active.map(i => ({
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      taxRate: rateByMenuItem.get(i.menuItemId),
    })),
  )
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
