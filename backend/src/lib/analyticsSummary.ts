import { prisma } from './prisma'
import {
  buildMonthRangeInTimezone,
  calendarDateInTimezone,
  dayBoundsInTimezone,
} from './dates'
import { buildFiscalConfig } from './taxEngine'
import { kitchenActiveOrdersWhere } from './orderSession'

function sumFoodFromAggregate(agg: {
  _sum: {
    revenueAmount?: number | null
    subtotal?: number | null
    tax?: number | null
    tipAmount?: number | null
    total?: number | null
  }
}) {
  if (agg._sum.revenueAmount && agg._sum.revenueAmount > 0) return agg._sum.revenueAmount
  return (agg._sum.subtotal || 0) + (agg._sum.tax || 0)
}

function paidInRange(start: Date, end: Date) {
  return {
    status: 'PAID' as const,
    OR: [
      { paidAt: { gte: start, lt: end } },
      { paidAt: null, createdAt: { gte: start, lt: end } },
    ],
  }
}

async function loadTenantTimeRanges(restaurantId: string) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    include: { settings: true },
  })
  const fiscal = buildFiscalConfig(restaurant?.settings)
  const timeZone = restaurant?.timezone ?? fiscal.timezone
  const todayStr = calendarDateInTimezone(timeZone)
  const { gte: todayStart, lt: todayEnd } = dayBoundsInTimezone(todayStr, timeZone)

  const year = Number(todayStr.slice(0, 4))
  const month = Number(todayStr.slice(5, 7))
  const { start: monthStart } = buildMonthRangeInTimezone(year, month, timeZone)
  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year
  const { start: lastMonthStart } = buildMonthRangeInTimezone(prevYear, prevMonth, timeZone)
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year
  const nextMonthStart = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`
  const { gte: monthEndExclusive } = dayBoundsInTimezone(nextMonthStart, timeZone)
  const prevMonthEndStart = `${year}-${String(month).padStart(2, '0')}-01`
  const { gte: lastMonthEndExclusive } = dayBoundsInTimezone(prevMonthEndStart, timeZone)

  return {
    timeZone,
    todayStart,
    todayEnd,
    monthStart,
    monthEndExclusive,
    lastMonthStart,
    lastMonthEndExclusive,
  }
}

/** KPI dashboard — disponibile anche piano Base (senza Pro). */
export async function buildDashboardSummary(restaurantId: string) {
  const ranges = await loadTenantTimeRanges(restaurantId)

  const [
    todayOrders,
    todayRevenue,
    monthRevenue,
    lastMonthRevenue,
    totalCustomers,
    todayReservations,
    activeOrders,
    lowStockItems,
  ] = await Promise.all([
    prisma.order.count({
      where: {
        restaurantId,
        createdAt: { gte: ranges.todayStart, lt: ranges.todayEnd },
        status: { notIn: ['CANCELLED'] },
      },
    }),
    prisma.order.aggregate({
      where: { restaurantId, ...paidInRange(ranges.todayStart, ranges.todayEnd) },
      _sum: { revenueAmount: true, subtotal: true, tax: true, tipAmount: true, total: true },
    }),
    prisma.order.aggregate({
      where: { restaurantId, ...paidInRange(ranges.monthStart, ranges.monthEndExclusive) },
      _sum: { revenueAmount: true, subtotal: true, tax: true, tipAmount: true, total: true },
    }),
    prisma.order.aggregate({
      where: { restaurantId, ...paidInRange(ranges.lastMonthStart, ranges.lastMonthEndExclusive) },
      _sum: { revenueAmount: true, subtotal: true, tax: true, tipAmount: true, total: true },
    }),
    prisma.customer.count({ where: { restaurantId } }),
    prisma.reservation.count({
      where: {
        restaurantId,
        date: { gte: ranges.todayStart, lt: ranges.todayEnd },
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      },
    }),
    prisma.order.count({ where: kitchenActiveOrdersWhere(restaurantId) }),
    prisma.inventoryItem.count({
      where: { restaurantId, quantity: { lte: prisma.inventoryItem.fields.minQuantity } },
    }),
  ])

  const monthFood = sumFoodFromAggregate(monthRevenue)
  const lastMonthFood = sumFoodFromAggregate(lastMonthRevenue)
  const revenueGrowth = lastMonthFood ? ((monthFood - lastMonthFood) / lastMonthFood) * 100 : 0

  return {
    today: {
      orders: todayOrders,
      revenue: sumFoodFromAggregate(todayRevenue),
      tips: todayRevenue._sum.tipAmount || 0,
      collected: todayRevenue._sum.total || 0,
      reservations: todayReservations,
      activeOrders,
    },
    month: {
      revenue: monthFood,
      tips: monthRevenue._sum.tipAmount || 0,
      collected: monthRevenue._sum.total || 0,
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
    },
    totals: { customers: totalCustomers, lowStockAlerts: lowStockItems },
  }
}

export { loadTenantTimeRanges }
