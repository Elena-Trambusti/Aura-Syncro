import * as Tooltip from '@radix-ui/react-tooltip'
import { Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function ReservationsHelpTooltip() {
  const { t } = useTranslation()

  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg premium-card text-fumo hover:border-aura-gold/30 hover:text-aura-gold"
            aria-label={t('reservations.howItWorksTitle')}
          >
            <Info className="h-4 w-4" />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="bottom"
            align="start"
            sideOffset={8}
            className="z-50 max-w-sm rounded-xl premium-card p-4 text-sm text-fumo shadow-md"
          >
            <p className="font-semibold text-pietra">{t('reservations.howItWorksTitle')}</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-4 text-xs leading-relaxed">
              <li>{t('reservations.howItWorksBookings')}</li>
              <li>{t('reservations.howItWorksWaitlist')}</li>
              <li>{t('reservations.howItWorksPublic')}</li>
            </ul>
            <p className="mt-2 text-xs text-fumo">{t('reservations.workflowHint')}</p>
            <Tooltip.Arrow className="fill-white" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}
