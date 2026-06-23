import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react'

export default function PaymentCancelPage() {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const returnSlug = params.get('slug')

  return (
    <div className="aura-auth-shell mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center p-6">
      <div className="premium-card w-full max-w-sm p-8 text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10">
          <XCircle className="h-10 w-10 text-red-400" />
        </div>
        <h1 className="mb-2 text-2xl font-black text-pietra">{t('guestCheckout.cancelTitle')}</h1>
        <p className="mb-8 text-fumo">{t('guestCheckout.cancelDesc')}</p>

        <div className="space-y-3">
          {returnSlug && (
            <Link
              to={`/menu/${returnSlug}`}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-aura-gold py-3.5 font-semibold text-navy transition-colors hover:bg-aura-gold-light"
            >
              <RefreshCw className="h-4 w-4" />
              {t('guestCheckout.retryOrder')}
            </Link>
          )}
          <Link
            to="/"
            className="aura-btn-ghost flex w-full items-center justify-center gap-2 py-3.5 font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('guestCheckout.backHome')}
          </Link>
        </div>
      </div>
    </div>
  )
}
