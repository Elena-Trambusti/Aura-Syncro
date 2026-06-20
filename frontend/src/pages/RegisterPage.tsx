import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Sparkles } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { BRAND } from '../lib/brand'
import { ui } from '../lib/ui'
import LanguageSwitcher from '../components/layout/LanguageSwitcher'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { t } = useTranslation()
  const { register } = useAuth()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    restaurantName: '',
    name: '',
    email: '',
    password: '',
    phone: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(form)
      toast.success(t('auth.welcome'))
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } }
      toast.error(error.response?.data?.error || t('auth.registerError'))
    } finally {
      setLoading(false)
    }
  }

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 relative">
      <div className="absolute top-4 right-4 z-10 sm:top-6 sm:right-6">
        <LanguageSwitcher prominent />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-amber-200"
            style={{ background: `linear-gradient(135deg, ${BRAND.gold}, ${BRAND.amber})` }}
          >
            <Sparkles className="w-9 h-9 text-slate-900" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">{BRAND.name}</h1>
          <p className="text-slate-500 mt-2 text-sm">{t('auth.registerSubtitle')}</p>
        </div>

        <div className="saas-card p-8 shadow-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={ui.label}>{t('auth.restaurantName')}</label>
              <input type="text" value={form.restaurantName} onChange={e => update('restaurantName', e.target.value)} className={ui.input} placeholder={t('auth.restaurantNamePlaceholder')} required />
            </div>
            <div>
              <label className={ui.label}>{t('auth.yourName')}</label>
              <input type="text" value={form.name} onChange={e => update('name', e.target.value)} className={ui.input} placeholder={t('auth.yourNamePlaceholder')} required />
            </div>
            <div>
              <label className={ui.label}>{t('common.email')}</label>
              <input type="email" value={form.email} onChange={e => update('email', e.target.value)} className={ui.input} placeholder={t('auth.emailPlaceholderRegister')} required />
            </div>
            <div>
              <label className={ui.label}>{t('common.phone')}</label>
              <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} className={ui.input} placeholder={t('auth.phonePlaceholder')} />
            </div>
            <div>
              <label className={ui.label}>{t('common.password')}</label>
              <input type="password" value={form.password} onChange={e => update('password', e.target.value)} className={ui.input} placeholder={t('auth.passwordMinLength')} minLength={6} required />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 mt-2 ${ui.btnPrimary} disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {loading ? t('auth.registering') : t('auth.createRestaurant')}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-4">
            {t('auth.hasAccount')}{' '}
            <Link to="/login" className="font-medium text-amber-600 hover:text-amber-700 hover:underline">
              {t('auth.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
