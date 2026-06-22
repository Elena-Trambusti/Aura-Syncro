import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  calculateExpectedDemand,
  calculateAffluenceForecast,
  calculateAffluenceForecastAdvanced,
  generateSmartAlerts,
  computeDishTrend,
  buildWeatherForecast,
  type InventoryInput,
  type PastSaleRecord,
} from './predictiveEngine'

function salesOnDow(baseDate: Date, dow: number, weeks: number, qty: number): PastSaleRecord[] {
  const records: PastSaleRecord[] = []
  for (let w = 0; w < weeks; w++) {
    const d = new Date(baseDate)
    d.setDate(d.getDate() - w * 7)
    const diff = dow - d.getDay()
    d.setDate(d.getDate() + diff)
    records.push({ date: d, quantity: qty, dayOfWeek: dow })
  }
  return records
}

describe('predictiveEngine', () => {
  it('calculateExpectedDemand — media mobile stesso giorno settimana', () => {
    const now = new Date('2026-06-20T12:00:00')
    const pastSales = salesOnDow(now, 6, 4, 10) // 4 sabati da 10 unità

    const result = calculateExpectedDemand('item-1', pastSales, 6, { windowWeeks: 4 })

    assert.equal(result.itemId, 'item-1')
    assert.equal(result.dayOfWeek, 6)
    assert.equal(result.expectedQuantity, 10)
    assert.equal(result.sampleCount, 4)
    assert.equal(result.method, 'moving_average_dow')
    assert.ok(result.confidence > 0)
  })

  it('calculateExpectedDemand — zero campioni → expected 0', () => {
    const result = calculateExpectedDemand('item-x', [], 3)
    assert.equal(result.expectedQuantity, 0)
    assert.equal(result.sampleCount, 0)
    assert.equal(result.confidence, 0)
  })

  it('generateSmartAlerts — REGOLA 1 stock weekend critico', () => {
    const inventory: InventoryInput[] = [{
      id: 'inv-flour',
      name: 'Farina',
      currentQuantity: 10,
      minimumThreshold: 5,
      unit: 'kg',
      category: 'Secchi',
    }]

    const expectedDemand = {
      'inv-flour': {
        6: {
          itemId: 'inv-flour',
          dayOfWeek: 6,
          expectedQuantity: 20,
          sampleCount: 4,
          confidence: 80,
          method: 'moving_average_dow' as const,
        },
      },
    }

    const weather = buildWeatherForecast(7)
    const alerts = generateSmartAlerts(inventory, expectedDemand, weather, {
      affluenceForecast: [{
        date: '2026-06-21',
        dayOfWeek: 6,
        predictedCovers: 150,
        baseCovers: 150,
        weather: 'sunny',
        weatherImpactPct: 0,
        confidence: 80,
        historicalSamples: 4,
      }],
    })

    const critical = alerts.find(a => a.ruleId === 'RULE_STOCK_WEEKEND')
    assert.ok(critical)
    assert.equal(critical.severity, 'critical')
    assert.equal(critical.params.orderQty, 10)
    assert.equal(critical.context?.peakWeekendDemand, 20)
  })

  it('generateSmartAlerts — REGOLA 2 pioggia + pesce → ottimizzazione 25%', () => {
    const inventory: InventoryInput[] = [{
      id: 'inv-fish',
      name: 'Branzino Fresco',
      currentQuantity: 4,
      minimumThreshold: 2,
      unit: 'kg',
      category: 'Pesce',
    }]

    const weather = [{
      date: '2026-06-22',
      dayOfWeek: 0,
      condition: 'rain' as const,
    }]

    const alerts = generateSmartAlerts(inventory, {}, weather, { rainReductionPct: 25 })
    const opt = alerts.find(a => a.ruleId === 'RULE_WEATHER_REDUCTION')
    assert.ok(opt)
    assert.equal(opt.severity, 'optimization')
    assert.equal(opt.params.pct, 25)
  })

  it('generateSmartAlerts — REGOLA 3 crescita ≥ 30% → opportunità', () => {
    const alerts = generateSmartAlerts([], {}, [], {
      growthThresholdPct: 30,
      dishTrends: [{
        menuItemId: 'dish-1',
        name: 'Tiramisù della Casa',
        qtyRecent2Weeks: 70,
        qtyPrev2Weeks: 50,
        growthPct: 40,
      }],
    })

    const opp = alerts.find(a => a.ruleId === 'RULE_DISH_GROWTH')
    assert.ok(opp)
    assert.equal(opp.severity, 'opportunity')
    assert.equal(opp.params.pct, 40)
  })

  it('computeDishTrend — calcola crescita percentuale', () => {
    const now = new Date()
    const recent: PastSaleRecord[] = [{ date: now, quantity: 14 }]
    const prevDate = new Date(now)
    prevDate.setDate(prevDate.getDate() - 20)
    const prev: PastSaleRecord[] = [{ date: prevDate, quantity: 10 }]

    const trend = computeDishTrend('d1', 'Piatto Test', [...recent, ...prev])
    assert.equal(trend.growthPct, 40)
  })

  it('calculateAffluenceForecast — applica impatto meteo pioggia', () => {
    const now = new Date('2026-06-20T12:00:00')
    const covers = salesOnDow(now, 0, 4, 100)
    const weather = [{ date: '2026-06-22', dayOfWeek: 0, condition: 'rain' as const }]

    const forecast = calculateAffluenceForecast(covers, weather)
    assert.equal(forecast[0].baseCovers, 100)
    assert.equal(forecast[0].predictedCovers, 75)
    assert.equal(forecast[0].weatherImpactPct, -25)
  })

  it('calculateAffluenceForecastAdvanced — include prenotazioni e walk-in', () => {
    const now = new Date('2026-06-20T12:00:00')
    const covers = salesOnDow(now, 6, 4, 100)
    const reservations = salesOnDow(now, 6, 4, 40)
    const weather = [{ date: '2026-06-21', dayOfWeek: 6, condition: 'sunny' as const }]

    const forecast = calculateAffluenceForecastAdvanced(
      covers,
      reservations,
      weather,
      { '2026-06-21': 50 },
    )

    assert.equal(forecast[0].reservedCovers, 50)
    assert.equal(forecast[0].walkInCovers, 60)
    assert.equal(forecast[0].baseCovers, 110)
    assert.equal(forecast[0].predictedCovers, 110)
  })
})
