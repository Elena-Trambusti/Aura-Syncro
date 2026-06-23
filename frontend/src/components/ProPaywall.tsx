import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

/** Paywall per moduli inclusi nel piano Premium (€199/mo). */
export default function ProPaywall() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-xl premium-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-aura-gold/10">
          <Sparkles className="h-8 w-8 text-aura-gold" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-widest text-aura-gold">
          {t('paywall.proBadge')}
        </p>
        <h1 className="mt-2 text-2xl font-bold text-pietra">{t('paywall.proTitle')}</h1>
        <p className="mt-3 text-sm leading-relaxed text-fumo">{t('paywall.proDescription')}</p>
        <ul className="mt-6 space-y-2 text-left text-sm text-fumo">
          {(['proFeature1', 'proFeature2', 'proFeature3'] as const).map(key => (
            <li key={key} className="flex items-start gap-2">
              <span className="mt-1 text-amber-500">✓</span>
              {t(`paywall.${key}`)}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => navigate('/dashboard/billing')}
          className="mt-8 inline-block w-full saas-btn-primary py-3.5 text-sm"
        >
          {t('paywall.proCta')}
        </button>
      </div>
    </div>
  )
}
