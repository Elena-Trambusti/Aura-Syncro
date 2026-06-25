import { useAuth } from '../../contexts/AuthContext'
import AuthLoadingScreen from '../auth/AuthLoadingScreen'

export default function LandingRoute({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth()
  if (isLoading) return <AuthLoadingScreen />
  return <>{children}</>
}
