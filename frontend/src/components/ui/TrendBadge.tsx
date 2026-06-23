import { TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '../../lib/utils'

interface TrendBadgeProps {
  value: number
  label: string
  className?: string
}

export default function TrendBadge({ value, label, className }: TrendBadgeProps) {
  const positive = value >= 0
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold tabular-nums tracking-wide',
        positive
          ? 'bg-emerald-500/100/10 text-emerald-400 border border-emerald-500/20'
          : 'bg-red-500/100/10 text-red-400 border border-red-500/20',
        className,
      )}
    >
      {positive ? (
        <TrendingUp className="h-3 w-3 shrink-0" aria-hidden />
      ) : (
        <TrendingDown className="h-3 w-3 shrink-0" aria-hidden />
      )}
      {label}
    </span>
  )
}
