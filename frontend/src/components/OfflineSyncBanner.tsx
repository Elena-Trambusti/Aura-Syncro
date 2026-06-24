import { CloudOff, Loader2, RefreshCw, Wifi } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '../lib/utils'
import { useOfflineSync } from '../hooks/useOfflineSync'

interface OfflineSyncBannerProps {
  enabled: boolean
  onSynced?: () => void
  className?: string
}

export default function OfflineSyncBanner({ enabled, onSynced, className }: OfflineSyncBannerProps) {
  const { t } = useTranslation()
  const { pendingCount, isSyncing, isOnline, retryNow } = useOfflineSync(enabled, onSynced)

  const visible = !isOnline || pendingCount > 0

  if (!visible) return null

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2 text-xs sm:text-sm',
        !isOnline
          ? 'border-amber-300 bg-amber-50 text-amber-950'
          : 'border-sky-200 bg-sky-50 text-sky-950',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex min-w-0 items-center gap-2">
        {!isOnline ? (
          <CloudOff className="h-4 w-4 shrink-0" aria-hidden />
        ) : isSyncing ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
        ) : (
          <Wifi className="h-4 w-4 shrink-0" aria-hidden />
        )}
        <span className="font-medium">
          {!isOnline
            ? t('offline.bannerOffline', { defaultValue: 'Sei offline — le comande verranno inviate appena torna la connessione' })
            : isSyncing
              ? t('offline.bannerSyncing', { defaultValue: 'Sincronizzazione in corso…' })
              : t('offline.bannerPending', {
                  count: pendingCount,
                  defaultValue: '{{count}} comanda/e in attesa di invio',
                })}
        </span>
      </div>

      {isOnline && pendingCount > 0 && (
        <button
          type="button"
          onClick={() => void retryNow()}
          disabled={isSyncing}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-current/20 bg-white/70 px-2.5 py-1 font-semibold transition-colors hover:bg-white disabled:opacity-50"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', isSyncing && 'animate-spin')} />
          {t('offline.retryNow', { defaultValue: 'Riprova ora' })}
        </button>
      )}
    </div>
  )
}
