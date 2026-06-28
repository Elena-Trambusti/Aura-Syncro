import { useEffect, useLayoutEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { isDemoUserEmail } from '../../lib/demoAccounts'

export default function LandingRoute({ children, forceLang }: { children: React.ReactNode, forceLang?: string }) {
  const { i18n } = useTranslation()
  const { user, logout } = useAuth()

  useEffect(() => {
    if (forceLang && i18n.language !== forceLang) {
      i18n.changeLanguage(forceLang)
    }
  }, [forceLang, i18n])

  // Solo al rientro sulla landing (es. da dashboard), non dopo login demo sulla stessa pagina.
  useLayoutEffect(() => {
    if (user && isDemoUserEmail(user.email)) {
      logout()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <>{children}</>
}
