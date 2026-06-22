/**
 * Ricalcola subtotal/tax/total degli ordini con formula IVA inclusa (scorporo).
 *
 * Uso:
 *   npx tsx scripts/recalculate-order-taxes.ts [--dry-run] [--issue-invoices] [--restaurant-id=ID]
 */
import { PrismaClient } from '@prisma/client'
import { computeOrderTax } from '../src/lib/taxEngine'
import { buildFiscalConfig } from '../src/lib/taxEngine'
import { issueInvoiceForOrder } from '../src/lib/fiscalInvoice'

const prisma = new PrismaClient()

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const issueInvoices = args.includes('--issue-invoices')
const restaurantFilter = args.find(a => a.startsWith('--restaurant-id='))?.split('=')[1]

async function main() {
  const restaurants = await prisma.restaurant.findMany({
    where: restaurantFilter ? { id: restaurantFilter } : undefined,
    include: { settings: true },
  })

  if (restaurants.length === 0) {
    console.log('Nessun ristorante trovato.')
    return
  }

  let updated = 0
  let invoicesCreated = 0

  for (const restaurant of restaurants) {
    const defaultRate = buildFiscalConfig(restaurant.settings).taxRate
    const orders = await prisma.order.findMany({
      where: {
        restaurantId: restaurant.id,
        status: { not: 'CANCELLED' },
      },
      include: { items: true, invoice: true },
      orderBy: { createdAt: 'asc' },
    })

    console.log(`\n[${restaurant.name}] ${orders.length} ordini da verificare`)

    for (const order of orders) {
      const grossTotal = order.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
      if (grossTotal <= 0) continue

      const rate = order.taxRateApplied && order.taxRateApplied > 0
        ? order.taxRateApplied
        : defaultRate

      const { subtotal, tax, total: foodTotal } = computeOrderTax(grossTotal, rate)
      const tip = order.tipAmount ?? 0
      const newTotal = order.status === 'PAID' ? foodTotal + tip : foodTotal
      const newRevenue = foodTotal

      const changed =
        Math.abs(order.subtotal - subtotal) > 0.001 ||
        Math.abs(order.tax - tax) > 0.001 ||
        Math.abs(order.total - newTotal) > 0.001 ||
        (order.status === 'PAID' && Math.abs(order.revenueAmount - newRevenue) > 0.001)

      if (!changed && (!issueInvoices || order.invoice || order.status !== 'PAID')) continue

      if (dryRun) {
        if (changed) {
          console.log(
            `  [dry-run] ${order.id.slice(-6)}: imponibile ${order.subtotal}→${subtotal}, ` +
            `tax ${order.tax}→${tax}, total ${order.total}→${newTotal}`,
          )
        }
        if (issueInvoices && order.status === 'PAID' && !order.invoice) {
          console.log(`  [dry-run] ${order.id.slice(-6)}: emetterebbe fattura`)
        }
        updated += changed ? 1 : 0
        if (issueInvoices && order.status === 'PAID' && !order.invoice) invoicesCreated++
        continue
      }

      await prisma.$transaction(async tx => {
        if (changed) {
          await tx.order.update({
            where: { id: order.id },
            data: {
              subtotal,
              tax,
              total: newTotal,
              taxRateApplied: rate,
              ...(order.status === 'PAID' ? { revenueAmount: newRevenue } : {}),
            },
          })
        }
        if (issueInvoices && order.status === 'PAID' && !order.invoice) {
          const paidAt = order.paidAt ?? order.createdAt
          await issueInvoiceForOrder(tx, order.id, restaurant.id, paidAt)
          invoicesCreated++
        }
      })

      if (changed) updated++
    }
  }

  console.log(`\nCompletato: ${updated} ordini aggiornati, ${invoicesCreated} fatture emesse.`)
}

main()
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
