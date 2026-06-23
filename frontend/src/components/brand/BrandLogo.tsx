import { cn } from '../../lib/utils'
import { useTranslation } from 'react-i18next'
import { BRAND } from '../../lib/brand'

const SIZES = {
  sm: { box: 'h-8 w-8 rounded-lg', img: 'h-5 w-5', text: 'text-sm' },
  md: { box: 'h-11 w-11 rounded-xl', img: 'h-6 w-6', text: 'text-base' },
  lg: { box: 'h-14 w-14 rounded-2xl', img: 'h-8 w-8', text: 'text-lg' },
} as const

const ICON_SRC = '/brand/aura-syncro-icon.svg'

type BrandLogoSize = keyof typeof SIZES

interface BrandLogoProps {
  size?: BrandLogoSize
  className?: string
  showName?: boolean
  layout?: 'icon' | 'horizontal'
}

export default function BrandLogo({
  size = 'md',
  className,
  showName = false,
  layout = 'icon',
}: BrandLogoProps) {
  const { t } = useTranslation()
  const s = SIZES[size]

  const iconBox = (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden border border-aura-gold/25 aura-pulse',
        'bg-gradient-to-br from-navy-elevated via-navy-surface to-navy-mid',
        s.box,
      )}
      style={{ boxShadow: '0 0 20px rgba(212, 175, 55, 0.12), inset 0 1px 0 rgba(255,255,255,0.06)' }}
    >
      <img
        src={ICON_SRC}
        alt=""
        className={cn(s.img, 'relative z-10 object-contain object-center')}
        aria-hidden
      />
    </div>
  )

  if (!showName || layout === 'icon') {
    return <div className={cn('inline-flex', className)}>{iconBox}</div>
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {iconBox}
      <div className="min-w-0 text-left">
        <p className={cn('font-display font-semibold tracking-tight text-pietra leading-tight', s.text)}>
          {BRAND.name}
        </p>
        <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-fumo">
          {t('brand.saasPlatform')}
        </p>
      </div>
    </div>
  )
}
