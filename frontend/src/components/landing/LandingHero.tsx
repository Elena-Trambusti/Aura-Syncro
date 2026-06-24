import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, PlayCircle, Sparkles, Zap, BarChart3 } from 'lucide-react'
import { BRAND } from '../../lib/brand'

export default function LandingHero() {
  const { t } = useTranslation()

  return (
    <section className="relative overflow-hidden bg-navy px-4 pb-20 pt-12 sm:px-6 sm:pb-28 sm:pt-20">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-orange-100/50 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-700">
            <Sparkles className="h-3.5 w-3.5" />
            {t('landing.hero.badge')}
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl lg:leading-[1.05]">
            {t('landing.hero.title')}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
            {t('landing.hero.subtitle', { brand: BRAND.name })}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/30 transition hover:brightness-105"
            >
              {t('landing.hero.ctaPrimary')}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-100"
            >
              <PlayCircle className="h-4 w-4" />
              {t('landing.hero.ctaSecondary')}
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-tr from-amber-100/70 via-transparent to-orange-100/70 blur-2xl" />
          <div className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-2xl backdrop-blur-md">
            <div className="rounded-2xl border border-slate-200 bg-slate-900 p-4 text-slate-100 shadow-inner">
              <div className="flex items-center justify-between rounded-xl bg-slate-800 px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Zap className="h-4 w-4 text-amber-400" />
                  {BRAND.name}
                </div>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-300">
                  Live
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-800 p-3">
                  <p className="text-xs text-slate-400">{t('landing.hero.previewKpi1')}</p>
                  <p className="mt-1 text-xl font-bold text-white">+18%</p>
                </div>
                <div className="rounded-xl bg-slate-800 p-3">
                  <p className="text-xs text-slate-400">{t('landing.hero.previewKpi2')}</p>
                  <p className="mt-1 text-xl font-bold text-white">124</p>
                </div>
              </div>
              <div className="mt-4 rounded-xl bg-slate-800 p-4">
                <div className="mb-3 flex items-center gap-2 text-xs text-slate-400">
                  <BarChart3 className="h-3.5 w-3.5" />
                  {t('landing.hero.previewChart')}
                </div>
                <div className="flex h-24 items-end gap-2">
                  {[35, 55, 40, 68, 72, 58, 80].map((height, idx) => (
                    <div
                      key={idx}
                      className="flex-1 rounded-md bg-gradient-to-t from-amber-500 to-orange-400"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
