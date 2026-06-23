import type { ElementType } from 'react'
import { cn } from '../../lib/utils'
import TrendBadge from './TrendBadge'

interface KpiCardProps {
  title: string
  value: string
  subtitle?: string
  icon: ElementType
  trend?: number
  trendLabel?: (value: number) => string
  accent?: 'gold' | 'emerald' | 'blue' | 'amber'
  className?: string
}

const ACCENT_ICON = {
  gold: 'text-aura-gold border-aura-gold/25 bg-aura-gold/10',
  emerald: 'text-emerald-400 border-emerald-500/25 bg-emerald-500/100/10',
  blue: 'text-blue-400 border-blue-500/25 bg-blue-500/100/10',
  amber: 'text-amber-400 border-amber-500/25 bg-aura-gold/10',
} as const

export default function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  accent = 'gold',
  className,
}: KpiCardProps) {
  return (
    <div className={cn('premium-kpi', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="premium-kpi-label">{title}</p>
          <p className="premium-kpi-value">{value}</p>
        </div>
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border sm:h-11 sm:w-11',
            ACCENT_ICON[accent],
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {subtitle && <p className="text-xs text-fumo/80">{subtitle}</p>}
        {trend !== undefined && trendLabel && (
          <TrendBadge value={trend} label={trendLabel(Math.abs(trend))} />
        )}
      </div>
      <div className="premium-kpi-sparkline" aria-hidden />
    </div>
  )
}
