import { useTranslation } from 'react-i18next'
import { AlertCircle } from 'lucide-react'

interface QueryErrorBannerProps {
  message?: string
}

export default function QueryErrorBanner({ message }: QueryErrorBannerProps) {
  const { t } = useTranslation()
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-8 flex flex-col items-center gap-3 text-center">
      <AlertCircle className="w-10 h-10 text-red-400" />
      <p className="text-sm text-red-700">{message ?? t('common.loadError')}</p>
    </div>
  )
}
