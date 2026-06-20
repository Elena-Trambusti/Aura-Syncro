import { prisma } from './prisma'
import {
  runPredictiveEngine,
  buildWeatherForecast,
  aggregateInventoryDemand,
  computeDishTrend,
  type InventoryInput,
  type ExpectedDemandMap,
  type PastSaleRecord,
  type PredictiveEngineOutput,
  type SmartAlert,
  type AffluenceForecastDay,
} from './predictiveEngine'

export type {
  WeatherCondition,
  AlertSeverity,
  SmartAlert as PredictiveAlert,
  AffluenceForecastDay,
  PredictiveEngineOutput,
} from './predictiveEngine'

export { getDayI18nKey } from './predictiveEngine'

export interface PredictiveAIResult {
  forecast: AffluenceForecastDay[]
  alerts: SmartAlert[]
  factorsUsed: ('orderHistory' | 'dayOfWeek' | 'weather')[]
  engineVersion: string
  generatedAt: string
}

function weeksAgo(n: number) {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - n * 7)
  return d
}

/**
 * Carica dati dal DB e delega al motore statistico puro `predictiveEngine`.
 */
export async function runPredictiveAnalysis(restaurantId: string): Promise<PredictiveAIResult> {
  const windowStart = weeksAgo(4)

  const [orders, inventoryRows, orderItems, menuItems] = await Promise.all([
    prisma.order.findMany({
      where: {
        restaurantId,
        createdAt: { gte: windowStart },
        status: { notIn: ['CANCELLED'] },
      },
      select: {
        createdAt: true,
        items: { select: { menuItemId: true, quantity: true } },
      },
    }),
    prisma.inventoryItem.findMany({
      where: { restaurantId },
      include: {
        menuLinks: { select: { menuItemId: true, quantity: true } },
      },
    }),
    prisma.orderItem.findMany({
      where: {
        order: {
          restaurantId,
          createdAt: { gte: weeksAgo(8) },
          status: { notIn: ['CANCELLED'] },
        },
      },
      select: {
        menuItemId: true,
        quantity: true,
        createdAt: true,
        menuItem: { select: { name: true } },
      },
    }),
    prisma.menuItem.findMany({
      where: { restaurantId },
      select: { id: true, name: true },
    }),
  ])

  // Storico coperti per affluenza (1 record = coperti di un ordine)
  const coverHistory: PastSaleRecord[] = orders.map(order => ({
    date: order.createdAt,
    quantity: order.items.reduce((sum, it) => sum + it.quantity, 0),
    dayOfWeek: order.createdAt.getDay(),
  }))

  // Storico vendite per menuItemId
  const salesByMenuItem = new Map<string, PastSaleRecord[]>()
  for (const oi of orderItems) {
    const list = salesByMenuItem.get(oi.menuItemId) ?? []
    list.push({
      date: oi.createdAt,
      quantity: oi.quantity,
      dayOfWeek: oi.createdAt.getDay(),
    })
    salesByMenuItem.set(oi.menuItemId, list)
  }

  // Demand inventario aggregato da ricette (BOM)
  const expectedDemand: ExpectedDemandMap = {}
  const inventory: InventoryInput[] = inventoryRows.map(row => ({
    id: row.id,
    name: row.name,
    currentQuantity: row.quantity,
    minimumThreshold: row.minQuantity,
    unit: row.unit,
    category: row.category,
  }))

  for (const row of inventoryRows) {
    if (row.menuLinks.length > 0) {
      expectedDemand[row.id] = aggregateInventoryDemand(
        row.id,
        row.menuLinks.map(link => ({
          menuItemId: link.menuItemId,
          recipeQty: link.quantity,
          pastSales: salesByMenuItem.get(link.menuItemId) ?? [],
        })),
      )
    } else {
      // Fallback: stima da consumo storico ordini se non collegato a piatti
      const syntheticSales: PastSaleRecord[] = orders
        .filter(() => row.quantity > 0)
        .map(o => ({
          date: o.createdAt,
          quantity: Math.max(0.1, row.minQuantity / 7),
          dayOfWeek: o.createdAt.getDay(),
        }))
      expectedDemand[row.id] = aggregateInventoryDemand(row.id, [{
        menuItemId: row.id,
        recipeQty: 1,
        pastSales: syntheticSales,
      }])
    }
  }

  // Trend piatti (ultime 2 settimane vs precedenti 2)
  const dishTrends = menuItems.map(m =>
    computeDishTrend(m.id, m.name, salesByMenuItem.get(m.id) ?? []),
  )

  const result = runPredictiveEngine({
    inventory,
    expectedDemand,
    coverHistory,
    dishTrends,
    weatherForecast: buildWeatherForecast(),
  })

  return {
    forecast: result.forecast,
    alerts: result.alerts,
    factorsUsed: result.factorsUsed,
    engineVersion: result.engineVersion,
    generatedAt: result.generatedAt,
  }
}
