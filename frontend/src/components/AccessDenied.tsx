import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ShieldX } from 'lucide-react'

interface Props {
  message?: string
}

export default function AccessDenied({ message }: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-xl premium-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
          <ShieldX className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-pietra">{t('rbac.accessDeniedTitle')}</h1>
        <p className="mt-3 text-sm leading-relaxed text-fumo">
          {message ?? t('rbac.accessDeniedMessage')}
        </p>
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="mt-8 w-full saas-btn-primary py-3 text-sm"
        >
          {t('rbac.backToDashboard')}
        </button>
      </div>
    </div>
  )
}
