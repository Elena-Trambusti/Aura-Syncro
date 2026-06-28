import { useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { isDemoUserEmail } from '../lib/demoAccounts'
import { isDemoWritableAppRoute } from '../lib/demoRestrictions'

export function useDemoMode() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const isDemo = isDemoUserEmail(user?.email)
  const canWrite = !isDemo || isDemoWritableAppRoute(pathname)

  return {
    isDemo,
    canWrite,
    readOnly: isDemo && !canWrite,
  }
}
