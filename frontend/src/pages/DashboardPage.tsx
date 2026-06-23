import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api } from '../lib/api'
import { formatCurrency, formatLongDate, getIntlLocale } from '../lib/utils'
import { useAuth, useTenantQueryKey } from '../contexts/AuthContext'
import { usePlanTier } from '../hooks/usePlanTier'
import { tq } from '../lib/queryKeys'
import { BRAND } from '../lib/brand'
import {
  TrendingUp, ShoppingBag, CalendarCheck,
  Users, AlertTriangle, ClipboardList, AlertCircle,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import KpiCard from '../components/ui/KpiCard'
import PremiumCard from '../components/ui/PremiumCard'

interface DashboardData {
  today: { orders: number; revenue: number; reservations: number; activeOrders: number }
  month: { revenue: number; revenueGrowth: number }
  totals: { customers: number; lowStockAlerts: number }
}

function ChartError({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-fumo">
      <AlertCircle className="mb-2 h-8 w-8 text-red-400" />
      <p className="text-sm text-red-400">{message}</p>
    </div>
  )
}

function RevenueTooltip({
  active,
  payload,
  label,
  locale,
}: {
  active?: boolean
  payload?: Array<{ value?: number }>
  label?: string
  locale: string
}) {
  if (!active || !payload?.length) return null

  const dateLabel = label
    ? new Date(label).toLocaleDateString(locale, {
        weekday: 'short',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : ''

  return (
    <div className="rounded-xl border border-white/10 bg-navy-elevated px-3 py-2.5 shadow-lg">
      <p className="text-xs font-medium text-fumo">{dateLabel}</p>
      <p className="mt-0.5 text-sm font-bold tabular-nums text-aura-gold">
        {formatCurrency(Number(payload[0]?.value) || 0)}
      </p>
    </div>
  )
}

function TopDishRow({
  rank,
  name,
  quantity,
  maxQuantity,
  piecesLabel,
}: {
  rank: number
  name: string
  quantity: number
  maxQuantity: number
  piecesLabel: string
}) {
  const [animated, setAnimated] = useState(false)
  const pct = Math.min(100, (quantity / maxQuantity) * 100)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimated(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-white/[0.03]">
      <span className="w-5 text-xs font-bold tabular-nums text-fumo transition-colors group-hover:text-aura-gold">
        {rank}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-pietra">{name}</p>
        <div className="premium-progress-track mt-1.5">
          <div
            className="premium-progress-bar"
            style={{
              width: animated ? `${pct}%` : '0%',
              transitionDelay: `${rank * 80}ms`,
            }}
          />
        </div>
      </div>
      <span className="text-xs font-semibold tabular-nums text-fumo transition-colors group-hover:text-pietra">
        {quantity} {piecesLabel}
      </span>
    </div>
  )
}

const CHART_GRID = 'rgba(255,255,255,0.06)'
const CHART_AXIS = '#71717A'

export default function DashboardPage() {
  const { t } = useTranslation()
  const { restaurant } = useAuth()
  const tk = useTenantQueryKey()
  const { hasProPlan } = usePlanTier()
  const locale = getIntlLocale()

  const { data: dashboard, isError: summaryError } = useQuery<DashboardData>({
    queryKey: tq(tk, 'analytics', 'summary'),
    queryFn: () => api.get('/analytics/summary').then(r => r.data),
    refetchInterval: 30_000,
  })

  const { data: revenueData, isError: revenueError } = useQuery({
    queryKey: tq(tk, 'analytics', 'revenue', '7d'),
    queryFn: () => api.get('/analytics/revenue?period=7d').then(r => r.data),
    enabled: hasProPlan,
  })

  const { data: topItems, isError: topItemsError } = useQuery({
    queryKey: tq(tk, 'analytics', 'top-items'),
    queryFn: () => api.get('/analytics/top-items').then(r => r.data),
    enabled: hasProPlan,
  })

  return (
    <div className="pwa-mobile-page">
      <div className="aura-executive-header">
        <div>
          <p className="aura-brand-eyebrow">{BRAND.name}</p>
          <h1 className="aura-page-title">
            {t('dashboard.title', { name: restaurant?.name || t('common.restaurant') })}
          </h1>
          <p className="aura-page-subtitle">{t('dashboard.executiveSubtitle', { defaultValue: 'Panoramica operativa in tempo reale' })}</p>
        </div>
        <div className="aura-date-badge">{formatLongDate()}</div>
      </div>

      {summaryError && (
        <div className="premium-alert-error">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
          <p className="text-sm text-red-300">{t('common.loadError')}</p>
        </div>
      )}

      <section aria-label={t('dashboard.kpiSection', { defaultValue: 'Indicatori chiave' })}>
        <div className="pwa-stat-grid">
          <KpiCard
            title={t('dashboard.todayRevenue')}
            value={formatCurrency(dashboard?.today.revenue || 0)}
            subtitle={t('dashboard.todayRevenueSub')}
            icon={TrendingUp}
            accent="gold"
          />
          <KpiCard
            title={t('dashboard.activeOrders')}
            value={String(dashboard?.today.activeOrders || 0)}
            subtitle={t('dashboard.activeOrdersSub')}
            icon={ClipboardList}
            accent="amber"
          />
          <KpiCard
            title={t('dashboard.todayReservations')}
            value={String(dashboard?.today.reservations || 0)}
            subtitle={t('dashboard.todayReservationsSub')}
            icon={CalendarCheck}
            accent="blue"
          />
          <KpiCard
            title={t('dashboard.monthlyRevenue')}
            value={formatCurrency(dashboard?.month.revenue || 0)}
            icon={ShoppingBag}
            trend={dashboard?.month.revenueGrowth}
            trendLabel={v => t('dashboard.vsLastMonth', { value: v })}
            accent="gold"
          />
        </div>

        <div className="pwa-stat-grid-2 mt-3 sm:mt-4">
          <KpiCard
            title={t('dashboard.totalCustomers')}
            value={String(dashboard?.totals.customers || 0)}
            subtitle={t('dashboard.totalCustomersSub')}
            icon={Users}
            accent="emerald"
          />
          <KpiCard
            title={t('dashboard.stockAlerts')}
            value={String(dashboard?.totals.lowStockAlerts || 0)}
            subtitle={t('dashboard.stockAlertsSub')}
            icon={AlertTriangle}
            accent="amber"
          />
        </div>
      </section>

      {hasProPlan && (
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-3 xl:gap-6" aria-label={t('dashboard.analyticsSection', { defaultValue: 'Analytics' })}>
          <PremiumCard padding="md" className="xl:col-span-2">
            <h3 className="premium-section-title mb-4 sm:mb-5">{t('dashboard.revenueChart')}</h3>
            {revenueError ? (
              <ChartError message={t('common.loadError')} />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={revenueData || []} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={BRAND.gold} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={BRAND.gold} stopOpacity={0} />
                    </linearGradient>
                    <filter id="goldGlow">
                      <feGaussianBlur stdDeviation="2" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={d => new Date(d).toLocaleDateString(locale, { day: '2-digit', month: '2-digit' })}
                    tick={{ fontSize: 11, fill: CHART_AXIS }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={v => `€${v}`}
                    tick={{ fontSize: 11, fill: CHART_AXIS }}
                    axisLine={false}
                    tickLine={false}
                    width={48}
                  />
                  <Tooltip
                    cursor={{ stroke: BRAND.gold, strokeWidth: 1, strokeDasharray: '4 4', strokeOpacity: 0.5 }}
                    content={({ active, payload, label }) => (
                      <RevenueTooltip
                        active={active}
                        payload={payload?.map(entry => ({ value: Number(entry.value) || 0 }))}
                        label={typeof label === 'string' ? label : String(label ?? '')}
                        locale={locale}
                      />
                    )}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={BRAND.gold}
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                    filter="url(#goldGlow)"
                    isAnimationActive
                    animationDuration={1200}
                    animationEasing="ease-out"
                    activeDot={{ r: 5, fill: BRAND.gold, stroke: BRAND.champagne, strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </PremiumCard>

          <PremiumCard padding="md">
            <h3 className="premium-section-title mb-4">{t('dashboard.topDishes')}</h3>
            {topItemsError ? (
              <ChartError message={t('common.loadError')} />
            ) : (
              <div className="space-y-0.5">
                {(topItems || []).slice(0, 6).map((item: { menuItemId: string; name: string; quantity: number; revenue: number }, idx: number) => (
                  <TopDishRow
                    key={item.menuItemId}
                    rank={idx + 1}
                    name={item.name}
                    quantity={item.quantity}
                    maxQuantity={topItems?.[0]?.quantity || 1}
                    piecesLabel={t('common.pieces')}
                  />
                ))}
                {(!topItems || topItems.length === 0) && (
                  <p className="py-6 text-center text-sm text-fumo">{t('common.noData')}</p>
                )}
              </div>
            )}
          </PremiumCard>
        </section>
      )}
    </div>
  )
}
