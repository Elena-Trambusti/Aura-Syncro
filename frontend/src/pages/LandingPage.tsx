import { useTranslation } from 'react-i18next'
import { usePageMeta } from '../lib/usePageMeta'
import LandingNav from '../components/landing/LandingNav'
import LandingHero from '../components/landing/LandingHero'
import LandingFeatures from '../components/landing/LandingFeatures'
import LandingPricing from '../components/landing/LandingPricing'
import LandingFooter from '../components/landing/LandingFooter'

export default function LandingPage() {
  const { t, i18n } = useTranslation()

  usePageMeta(t('landing.meta.title'), t('landing.meta.description'))

  return (
    <div lang={i18n.language} className="min-h-[100dvh] flex flex-col bg-slate-50">
      <LandingNav />
      <main className="flex-1">
        <LandingHero />
        <LandingFeatures />
        <LandingPricing />
      </main>
      <LandingFooter />
    </div>
  )
}
