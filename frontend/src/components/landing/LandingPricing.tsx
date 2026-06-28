import RegisterLink from './RegisterLink'
import { useTranslation } from 'react-i18next'
import { Check, X, Sparkles, ArrowRight } from 'lucide-react'
import { cn } from '../../lib/utils'

export default function LandingPricing() {
  const { t } = useTranslation()

  const PLANS = [
    {
      id: 'starter',
      name: t('landing.pricing.starter.name', { defaultValue: 'Starter' }),
      tagline: t('landing.pricing.starter.tagline', { defaultValue: 'Per piccoli locali o food truck.' }),
      price: t('landing.pricing.starter.price', { defaultValue: '€99/mese + IVA' }),
      setup: t('landing.pricing.starter.setup', { defaultValue: '+ €250 setup (Una tantum) + IVA' }),
      features: t('landing.pricing.starter.features', { returnObjects: true, defaultValue: [
        'Gestione fino a 12 tavoli',
        '1 singola area (Sala)',
        'Menu QR digitale',
        'Pagamenti Stripe integrati',
      ]}) as string[],
      missingFeatures: t('landing.pricing.starter.missingFeatures', { returnObjects: true, defaultValue: [
        'AI Predittiva e Analytics',
        'Gestione Turni e Scorte',
      ]}) as string[],
    },
    {
      id: 'pro',
      name: t('landing.pricing.pro.name', { defaultValue: 'Premium' }),
      badge: t('landing.pricing.pro.badge', { defaultValue: 'Consigliato' }),
      tagline: t('landing.pricing.pro.tagline', { defaultValue: 'Per ristoranti che esigono il massimo.' }),
      price: t('landing.pricing.pro.price', { defaultValue: '€199/mese + IVA' }),
      setup: t('landing.pricing.pro.setup', { defaultValue: '+ €500 setup (Una tantum) + IVA' }),
      features: t('landing.pricing.pro.features', { returnObjects: true, defaultValue: [
        'Aree e tavoli illimitati',
        'AI Predittiva e Analytics',
        'Onboarding chiavi in mano',
        'Gestione Turni e Scorte',
        'Marketing Automation'
      ]}) as string[],
      missingFeatures: t('landing.pricing.pro.missingFeatures', { returnObjects: true, defaultValue: []}) as string[],
    }
  ]

  return (
    <section id="pricing" className="relative bg-transparent px-4 py-24 sm:px-6 sm:py-32 overflow-hidden z-0">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-[700px] w-[700px] rounded-full bg-amber-500/5 blur-[150px]" />
      </div>
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="lux-heading text-3xl font-bold tracking-tighter sm:text-4xl">{t('landing.pricing.title', { defaultValue: 'Prezzi Semplici, Nessuna Sorpresa' })}</h2>
          <p className="mt-3 lux-text-soft">{t('landing.pricing.subtitle', { defaultValue: 'Scegli il piano giusto per la tua attività.' })}</p>
        </div>

        <div className="mt-14 mx-auto grid max-w-md grid-cols-1 gap-8 md:max-w-4xl md:grid-cols-2">
          {PLANS.map(plan => {
            const isPro = plan.id === 'pro'
            return (
              <div
                key={plan.id}
                className={cn(
                  'relative flex flex-col rounded-2xl border p-8',
                  isPro
                    ? 'scale-[1.01] border-[#D4AF37]/15 bg-[#1a1408]/40 backdrop-blur-xl lux-text-soft shadow-[0_8_32px_0_rgba(0,0,0,0.37)] transition-all duration-500 md:hover:scale-[1.03] hover:border-amber-500/40 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]'
                    : 'border-[#D4AF37]/10 bg-[#0f0c08]/60 backdrop-blur-sm lux-text-muted shadow-sm transition-all md:hover:scale-[1.01]',
                )}
              >
                {isPro && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#d4af37] to-[#aa8c2c] px-4 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-black shadow-[0_0_20px_rgba(212,175,55,0.4)] ring-1 ring-white/20 z-10">
                    <Sparkles className="h-3 w-3" />
                    Consigliato
                  </span>
                )}
                <h3 className={cn('text-lg font-bold', isPro ? 'lux-text-bright' : 'lux-text')}>
                  {plan.name}
                </h3>
                <p className={cn('mt-1 text-sm', isPro ? 'lux-text-soft' : 'lux-text-muted')}>
                  {plan.tagline}
                </p>
                <div className="mt-6">
                  <p className={cn('text-3xl font-extrabold', isPro ? 'lux-text-bright' : 'lux-text')}>
                    {plan.price}
                  </p>
                  <p className={cn('mt-1 text-sm', isPro ? 'lux-text-soft' : 'lux-text-muted')}>
                    {plan.setup}
                  </p>
                </div>
                <ul className="mt-8 flex-1 space-y-3">
                  {plan.features.map(line => (
                    <li key={line} className={cn('flex items-start gap-2 text-sm', isPro ? 'lux-text-soft' : 'lux-text-muted')}>
                      <Check className={cn('mt-0.5 h-4 w-4 shrink-0', isPro ? 'text-amber-300' : 'text-emerald-500')} />
                      <span>{line}</span>
                    </li>
                  ))}
                  {plan.missingFeatures.map(line => (
                    <li key={line} className="flex items-start gap-2 text-sm lux-text-faint line-through">
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-[#8C7A52]/50" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
                <RegisterLink
                  className={cn(
                    'mt-8 relative overflow-hidden flex items-center justify-center rounded-full py-3.5 px-6 text-[10px] uppercase tracking-[0.2em] font-bold transition-all duration-500 group',
                    isPro
                      ? 'bg-gradient-to-r from-[#d4af37] to-[#aa8c2c] text-black shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:-translate-y-1 hover:shadow-[0_0_50px_rgba(212,175,55,0.5)] ring-1 ring-white/40'
                      : 'border border-[#D4AF37]/20 bg-black/40 backdrop-blur-xl lux-text-bright hover:-translate-y-1 hover:bg-[#D4AF37]/5 hover:border-aura-gold/50 hover:shadow-[0_0_20px_rgba(212,175,55,0.15)]'
                  )}
                >
                  {isPro && (
                    <div className="absolute inset-0 w-[50%] bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer-sweep_3s_ease-in-out_infinite]" />
                  )}
                  <span className="relative">{t('landing.pricing.cta', { defaultValue: 'Inizia Ora' })}</span>
                  {isPro && <ArrowRight className="relative h-4 w-4 ml-2" />}
                </RegisterLink>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
