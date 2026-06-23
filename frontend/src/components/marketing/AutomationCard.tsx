import { cn } from '../../lib/utils'

interface AutomationToggleProps {
  active: boolean
  disabled?: boolean
  onChange: (active: boolean) => void
  label: string
}

export function AutomationToggle({ active, disabled, onChange, label }: AutomationToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!active)}
      className={cn(
        'relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-aura-gold/30 focus:ring-offset-2',
        active ? 'bg-aura-gold' : 'bg-navy-surface',
        disabled && 'opacity-60 cursor-not-allowed',
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-navy-elevated shadow-sm transition-transform duration-200 mt-1',
          active ? 'translate-x-6 ml-0.5' : 'translate-x-1',
        )}
      />
    </button>
  )
}

interface AutomationCardProps {
  title: string
  description: string
  icon: React.ReactNode
  active: boolean
  saving?: boolean
  messageTemplate: string
  onToggle: (active: boolean) => void
  onMessageChange: (message: string) => void
  onMessageBlur?: () => void
  templateLabel: string
}

export default function AutomationCard({
  title,
  description,
  icon,
  active,
  saving,
  messageTemplate,
  onToggle,
  onMessageChange,
  onMessageBlur,
  templateLabel,
}: AutomationCardProps) {
  return (
    <article
      className={cn(
        'rounded-xl border bg-navy-elevated p-5 shadow-sm transition-shadow',
        active ? 'border-aura-gold/30 ring-1 ring-amber-200' : 'border-white/[0.08]',
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
              active ? 'bg-aura-gold/10 text-aura-gold' : 'bg-navy-surface text-fumo',
            )}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-pietra">{title}</h3>
            <p className="mt-1 text-sm text-fumo">{description}</p>
          </div>
        </div>
        <AutomationToggle
          active={active}
          disabled={saving}
          onChange={onToggle}
          label={title}
        />
      </div>

      <div className="mt-4">
        <label className="block text-xs font-medium text-fumo mb-1.5">{templateLabel}</label>
        <textarea
          value={messageTemplate}
          onChange={e => onMessageChange(e.target.value)}
          onBlur={() => onMessageBlur?.()}
          rows={3}
          disabled={saving}
          className="w-full rounded-xl premium-card px-3 py-2.5 text-sm text-pietra placeholder:text-fumo focus:outline-none focus:ring-2 focus:ring-aura-gold/30 focus:border-aura-gold/50 resize-none disabled:opacity-60"
        />
      </div>
    </article>
  )
}
