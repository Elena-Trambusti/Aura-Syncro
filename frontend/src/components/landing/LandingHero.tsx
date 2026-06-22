import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, LogIn } from 'lucide-react'
import BrandLogo from '../brand/BrandLogo'
import { BRAND } from '../../lib/brand'

export default function LandingHero() {
  const { t } = useTranslation()

  return (
    <section className="relative overflow-hidden bg-slate-50 px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-16">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-orange-100/50 blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl text-center">
        <BrandLogo size="lg" className="mx-auto mb-6 shadow-md ring-1 ring-slate-200/80" />
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-amber-700">
          {t('landing.hero.badge')}
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl sm:leading-tight">
          {t('landing.hero.title')}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
          {t('landing.hero.subtitle', { brand: BRAND.name })}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/register"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-amber-500/25 transition-colors hover:bg-amber-600 sm:w-auto"
          >
            {t('landing.hero.ctaPrimary')}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/login"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 sm:w-auto"
          >
            <LogIn className="h-4 w-4" />
            {t('landing.hero.ctaSecondary')}
          </Link>
        </div>
      </div>
    </section>
  )
}
