import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export default function LandingRoute({ children, forceLang }: { children: React.ReactNode, forceLang?: string }) {
  const { i18n } = useTranslation()

  useEffect(() => {
    if (forceLang && i18n.language !== forceLang) {
      i18n.changeLanguage(forceLang)
    }
  }, [forceLang, i18n])

  return <>{children}</>
}
