import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Check, Sparkles } from 'lucide-react'
import { cn } from '../../lib/utils'

const PLANS = ['starter', 'pro'] as const

export default function LandingPricing() {
  const { t } = useTranslation()

  return (
    <section id="pricing" className="bg-navy px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">{t('landing.pricing.title')}</h2>
          <p className="mt-3 text-slate-600">{t('landing.pricing.subtitle')}</p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-2 lg:items-start">
          {PLANS.map(plan => {
            const isPro = plan === 'pro'
            const featureKeys = t(`landing.pricing.${plan}.features`, { returnObjects: true }) as string[]
            return (
              <div
                key={plan}
                className={cn(
                  'relative flex flex-col rounded-2xl border p-8',
                  isPro
                    ? 'scale-[1.02] border-amber-400 bg-slate-900 text-slate-100 shadow-2xl'
                    : 'border-slate-200 bg-white text-slate-900 shadow-sm',
                )}
              >
                {isPro && (
                  <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white">
                    <Sparkles className="h-3 w-3" />
                    {t('landing.pricing.pro.badge')}
                  </span>
                )}
                <h3 className={cn('text-lg font-bold', isPro ? 'text-white' : 'text-slate-900')}>
                  {t(`landing.pricing.${plan}.name`)}
                </h3>
                <p className={cn('mt-1 text-sm', isPro ? 'text-slate-300' : 'text-slate-500')}>
                  {t(`landing.pricing.${plan}.tagline`)}
                </p>
                <div className="mt-6">
                  <p className={cn('text-3xl font-extrabold', isPro ? 'text-white' : 'text-slate-900')}>
                    {t(`landing.pricing.${plan}.price`)}
                  </p>
                  {t(`landing.pricing.${plan}.setup`, { defaultValue: '' }) && (
                    <p className={cn('mt-1 text-sm', isPro ? 'text-slate-300' : 'text-slate-600')}>
                      {t(`landing.pricing.${plan}.setup`)}
                    </p>
                  )}
                </div>
                <ul className="mt-8 flex-1 space-y-3">
                  {Array.isArray(featureKeys) && featureKeys.map(line => (
                    <li key={line} className={cn('flex items-start gap-2 text-sm', isPro ? 'text-slate-200' : 'text-slate-700')}>
                      <Check className={cn('mt-0.5 h-4 w-4 shrink-0', isPro ? 'text-amber-300' : 'text-amber-600')} />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={cn(
                    'mt-8 block rounded-xl py-3 text-center text-sm font-semibold transition-colors',
                    isPro
                      ? 'bg-amber-500 text-white hover:bg-amber-400'
                      : 'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50',
                  )}
                >
                  {t('landing.pricing.cta')}
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
