import { useTranslation } from 'react-i18next'
import { UtensilsCrossed, QrCode, CreditCard, Scale, BrainCircuit, Users } from 'lucide-react'

const FEATURES = [
  { key: 'tables', icon: UtensilsCrossed, className: 'lg:col-span-2 lg:row-span-2', iconBg: 'bg-amber-100 text-amber-700' },
  { key: 'qrMenu', icon: QrCode, className: '', iconBg: 'bg-blue-100 text-blue-700' },
  { key: 'stripe', icon: CreditCard, className: '', iconBg: 'bg-emerald-100 text-emerald-700' },
  { key: 'fiscal', icon: Scale, className: 'lg:col-span-2', iconBg: 'bg-violet-100 text-violet-700' },
  { key: 'crm', icon: Users, className: '', iconBg: 'bg-rose-100 text-rose-700' },
  { key: 'ai', icon: BrainCircuit, className: '', iconBg: 'bg-cyan-100 text-cyan-700' },
] as const

export default function LandingFeatures() {
  const { t } = useTranslation()

  return (
    <section id="features" className="bg-slate-100/60 px-4 py-24 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">{t('landing.features.title')}</h2>
          <p className="mt-3 text-slate-600">{t('landing.features.subtitle')}</p>
        </div>
        <div className="mt-12 grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ key, icon: Icon, className, iconBg }) => (
            <div
              key={key}
              className={`rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${className}`}
            >
              <div className={`mb-4 inline-flex rounded-xl p-3 ${iconBg}`}>
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
