import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { BRAND } from '../lib/brand'
import { ui } from '../lib/ui'
import BrandLogo from '../components/brand/BrandLogo'
import LanguageSwitcher from '../components/layout/LanguageSwitcher'
import { formatApiError } from '../lib/errors'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { t } = useTranslation()
  const { login } = useAuth()
  const [email, setEmail] = useState('admin@demo.it')
  const [password, setPassword] = useState('admin123')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.success(t('auth.welcomeBack'))
    } catch (err: unknown) {
      toast.error(formatApiError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4 sm:p-6 bg-slate-50 relative">
      <div className="absolute top-4 right-4 z-10 sm:top-6 sm:right-6">
        <LanguageSwitcher prominent />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <BrandLogo size="lg" className="mx-auto mb-4 shadow-sm border border-amber-200" />
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{BRAND.name}</h1>
          <p className="text-slate-500 mt-2 text-sm">{t('brand.tagline')}</p>
        </div>

        <div className="saas-card p-8 shadow-md">
          <h2 className="text-xl font-bold text-slate-900 mb-6">{t('auth.loginTitle')}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={ui.label}>{t('common.email')}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={ui.input}
                placeholder={t('auth.emailPlaceholder')}
                required
              />
            </div>
            <div>
              <label className={ui.label}>{t('common.password')}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={`${ui.input} pr-12`}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 mt-2 ${ui.btnPrimary} disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {loading ? t('auth.loggingIn') : t('auth.login')}
            </button>
          </form>

          <div className="mt-6 p-4 rounded-xl border border-amber-200 bg-amber-50">
            <p className="text-xs font-medium mb-1 text-amber-700">{t('auth.demoCredentials')}</p>
            <p className="text-xs text-slate-500">{t('auth.demoHint')}</p>
          </div>

          <p className="text-center text-sm text-slate-500 mt-4">
            {t('auth.newRestaurant')}{' '}
            <Link to="/register" className="font-medium text-amber-600 hover:text-amber-700 hover:underline">
              {t('auth.register')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
