import { useTranslation } from 'react-i18next'
import { UtensilsCrossed, QrCode, CreditCard, Scale } from 'lucide-react'

const FEATURES = [
  { key: 'tables', icon: UtensilsCrossed },
  { key: 'qrMenu', icon: QrCode },
  { key: 'stripe', icon: CreditCard },
  { key: 'fiscal', icon: Scale },
] as const

export default function LandingFeatures() {
  const { t } = useTranslation()

  return (
    <section id="features" className="border-y border-slate-200 bg-white px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">{t('landing.features.title')}</h2>
          <p className="mt-3 text-slate-600">{t('landing.features.subtitle')}</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ key, icon: Icon }) => (
            <div
              key={key}
              className="rounded-xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 inline-flex rounded-xl bg-amber-100 p-3 text-amber-700">
                <Icon className="h-6 w-6" strokeWidth={1.75} />
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                {t(`landing.features.${key}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {t(`landing.features.${key}.desc`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
