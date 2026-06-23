import { cn } from '../../lib/utils'

interface PremiumCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const PADDING = {
  none: '',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
} as const

export default function PremiumCard({
  children,
  className,
  hover = false,
  padding = 'md',
}: PremiumCardProps) {
  return (
    <div
      className={cn(
        'premium-card',
        hover && 'premium-card-hover',
        PADDING[padding],
        className,
      )}
    >
      {children}
    </div>
  )
}
