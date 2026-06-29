import { Router, Response } from 'express'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/auth'
import { requirePermission } from '../middleware/permissions'
import { calendarDateInTimezone, dayBoundsInTimezone, hourInTimezone, shiftCalendarDate } from '../lib/dates'
import { resolveRevenueAmount } from '../lib/fiscalAmounts'
import { loadTenantTimeRanges } from '../lib/analyticsSummary'
import { sumFoodFromMoneyAgg, moneyNumber } from '../lib/money'

export const analyticsRouter = Router()

/** PAID orders whose payment date (paidAt or createdAt fallback) falls in [start, end). */
function paidInRange(start: Date, end: Date) {
  return {
    status: 'PAID' as const,
    OR: [
      { paidAt: { gte: start, lt: end } },
      { paidAt: null, createdAt: { gte: start, lt: end } },
    ],
  }
}

analyticsRouter.get('/dashboard', requirePermission('analytics.read'), async (req: AuthRequest, res: Response): Promise<void> => {
  const restaurantId = req.restaurantId!
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
    prisma.order.count({ where: { restaurantId, createdAt: { gte: ranges.todayStart, lt: ranges.todayEnd }, status: { notIn: ['CANCELLED'] } } }),
    prisma.order.aggregate({ where: { restaurantId, ...paidInRange(ranges.todayStart, ranges.todayEnd) }, _sum: { revenueAmount: true, subtotal: true, tax: true, tipAmount: true, total: true } }),
    prisma.order.aggregate({ where: { restaurantId, ...paidInRange(ranges.monthStart, ranges.monthEndExclusive) }, _sum: { revenueAmount: true, subtotal: true, tax: true, tipAmount: true, total: true } }),
    prisma.order.aggregate({ where: { restaurantId, ...paidInRange(ranges.lastMonthStart, ranges.lastMonthEndExclusive) }, _sum: { revenueAmount: true, subtotal: true, tax: true, tipAmount: true, total: true } }),
    prisma.customer.count({ where: { restaurantId } }),
    prisma.reservation.count({ where: { restaurantId, date: { gte: ranges.todayStart, lt: ranges.todayEnd }, status: { notIn: ['CANCELLED', 'NO_SHOW'] } } }),
    prisma.order.count({ where: { restaurantId, status: { notIn: ['PAID', 'CANCELLED'] } } }),
    prisma.inventoryItem.count({ where: { restaurantId, quantity: { lte: prisma.inventoryItem.fields.minQuantity } } }),
  ])

  const monthFood = sumFoodFromMoneyAgg(monthRevenue)
  const lastMonthFood = sumFoodFromMoneyAgg(lastMonthRevenue)
  const revenueGrowth = lastMonthFood
    ? ((monthFood - lastMonthFood) / lastMonthFood) * 100
    : 0

  const turnoverOrders = await prisma.order.findMany({
    where: { restaurantId, ...paidInRange(ranges.todayStart, ranges.todayEnd), tableId: { not: null } },
    select: { createdAt: true, paidAt: true },
  })
  let totalMinutes = 0
  let turnoverCount = 0
  turnoverOrders.forEach(o => {
    if (o.paidAt) {
      totalMinutes += (o.paidAt.getTime() - o.createdAt.getTime()) / 60000
      turnoverCount++
    }
  })
  const avgTurnoverMinutes = turnoverCount > 0 ? Math.round(totalMinutes / turnoverCount) : 0

  res.json({
    today: {
      orders: todayOrders,
      revenue: sumFoodFromMoneyAgg(todayRevenue),
      tips: moneyNumber(todayRevenue._sum.tipAmount),
      collected: moneyNumber(todayRevenue._sum.total),
      reservations: todayReservations,
      activeOrders,
    },
    month: {
      revenue: monthFood,
      tips: moneyNumber(monthRevenue._sum.tipAmount),
      collected: moneyNumber(monthRevenue._sum.total),
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
    },
    totals: { customers: totalCustomers, lowStockAlerts: lowStockItems, avgTurnoverMinutes },
  })
})

analyticsRouter.get('/revenue', requirePermission('analytics.read'), async (req: AuthRequest, res: Response): Promise<void> => {
  const { period = '7d' } = req.query
  const restaurantId = req.restaurantId!
  const ranges = await loadTenantTimeRanges(restaurantId)
  const days = period === '30d' ? 30 : period === '90d' ? 90 : 7

  const todayStr = calendarDateInTimezone(ranges.timeZone)
  const startDateStr = shiftCalendarDate(todayStr, -(days - 1))
  const { gte: startDate } = dayBoundsInTimezone(startDateStr, ranges.timeZone)
  const { lt: endDate } = dayBoundsInTimezone(shiftCalendarDate(todayStr, 1), ranges.timeZone)

  const orders = await prisma.order.findMany({
    where: {
      restaurantId,
      status: 'PAID',
      OR: [
        { paidAt: { gte: startDate, lt: endDate } },
        { paidAt: null, createdAt: { gte: startDate, lt: endDate } },
      ],
    },
    select: { revenueAmount: true, subtotal: true, tax: true, tipAmount: true, total: true, paidAt: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })

  const groupedByDay: Record<string, { revenue: number; orders: number }> = {}
  for (let i = 0; i < days; i++) {
    const key = shiftCalendarDate(startDateStr, i)
    groupedByDay[key] = { revenue: 0, orders: 0 }
  }

  orders.forEach(order => {
    const paidAt = order.paidAt ?? order.createdAt
    const key = calendarDateInTimezone(ranges.timeZone, paidAt)
    if (groupedByDay[key]) {
      groupedByDay[key].revenue += resolveRevenueAmount(order)
      groupedByDay[key].orders += 1
    }
  })

  const data = Object.entries(groupedByDay).map(([date, values]) => ({
    date,
    revenue: Math.round(values.revenue * 100) / 100,
    orders: values.orders,
  }))

  res.json(data)
})

analyticsRouter.get('/top-items', requirePermission('analytics.read'), async (req: AuthRequest, res: Response): Promise<void> => {
  const restaurantId = req.restaurantId!
  const ranges = await loadTenantTimeRanges(restaurantId)
  const thirtyDaysAgoStr = shiftCalendarDate(calendarDateInTimezone(ranges.timeZone), -30)
  const { gte: thirtyDaysAgo } = dayBoundsInTimezone(thirtyDaysAgoStr, ranges.timeZone)

  const items = await prisma.orderItem.groupBy({
    by: ['menuItemId'],
    where: { order: { restaurantId, status: 'PAID', createdAt: { gte: thirtyDaysAgo } } },
    _sum: { quantity: true },
    _count: { id: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 10,
  })

  const menuItems = await prisma.menuItem.findMany({
    where: {
      restaurantId,
      id: { in: items.map((i: { menuItemId: string }) => i.menuItemId) },
    },
    select: { id: true, name: true, price: true, category: { select: { name: true } } },
  })

  const result = items.map((item) => {
    const menuItem = menuItems.find(m => m.id === item.menuItemId)
    const price = moneyNumber(menuItem?.price)
    return {
      menuItemId: item.menuItemId,
      name: menuItem?.name || 'Sconosciuto',
      category: menuItem?.category.name || '',
      price,
      quantity: item._sum.quantity || 0,
      revenue: price * (item._sum.quantity || 0),
    }
  })

  res.json(result)
})

analyticsRouter.get('/hourly', requirePermission('analytics.read'), async (req: AuthRequest, res: Response): Promise<void> => {
  const restaurantId = req.restaurantId!
  const ranges = await loadTenantTimeRanges(restaurantId)
  const sevenDaysAgoStr = shiftCalendarDate(calendarDateInTimezone(ranges.timeZone), -7)
  const { gte: sevenDaysAgo } = dayBoundsInTimezone(sevenDaysAgoStr, ranges.timeZone)

  const orders = await prisma.order.findMany({
    where: { restaurantId, status: 'PAID', createdAt: { gte: sevenDaysAgo } },
    select: { createdAt: true, paidAt: true, revenueAmount: true, subtotal: true, tax: true, tipAmount: true, total: true },
  })

  const byHour: Record<number, { revenue: number; orders: number }> = {}
  for (let h = 0; h < 24; h++) byHour[h] = { revenue: 0, orders: 0 }

  orders.forEach(order => {
    const paidAt = order.paidAt ?? order.createdAt
    const hour = hourInTimezone(ranges.timeZone, paidAt)
    byHour[hour].revenue += resolveRevenueAmount(order)
    byHour[hour].orders += 1
  })

  const data = Object.entries(byHour).map(([hour, values]) => ({
    hour: `${String(hour).padStart(2, '0')}:00`,
    revenue: Math.round(values.revenue * 100) / 100,
    orders: values.orders,
  }))

  res.json(data)
})
