import { useTranslation } from 'react-i18next'
import { AlertCircle } from 'lucide-react'

interface QueryErrorBannerProps {
  message?: string
}

export default function QueryErrorBanner({ message }: QueryErrorBannerProps) {
  const { t } = useTranslation()
  return (
    <div className="premium-alert-error flex flex-col items-center gap-3 p-8 text-center">
      <AlertCircle className="h-10 w-10 text-red-400" />
      <p className="text-sm text-red-300">{message ?? t('common.loadError')}</p>
    </div>
  )
}
