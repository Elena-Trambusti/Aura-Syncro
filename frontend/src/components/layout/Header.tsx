import { LogOut, MonitorCheck, ExternalLink, Menu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { getInitials } from '../../lib/utils'
import BrandLogo from '../brand/BrandLogo'
import NotificationBell from './NotificationBell'
import LanguageSwitcher from './LanguageSwitcher'
import { useDashboardLayout } from './DashboardLayout'

export default function Header() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const { toggleSidebar } = useDashboardLayout()

  const roleLabel = user
    ? t(`status.role.${user.role}`, { defaultValue: user.role })
    : ''

  return (
    <header className="pwa-header flex h-14 shrink-0 items-center gap-2 px-3 sm:h-16 sm:gap-3 sm:px-6">
      <button
        type="button"
        onClick={toggleSidebar}
        className="premium-topbar-btn -ml-1 shrink-0 lg:hidden"
        aria-label={t('common.openMenu')}
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex min-w-0 flex-1 items-center justify-center lg:justify-start">
        <div className="lg:hidden">
          <BrandLogo size="sm" />
        </div>
        <div className="hidden w-full max-w-sm rounded-xl border border-white/[0.06] bg-navy-surface/50 px-4 py-2 text-sm text-fumo/50 lg:block">
          {t('common.search', { defaultValue: 'Cerca…' })}
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-end gap-1 sm:gap-2">
        <a
          href="/cucina"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-1.5 rounded-lg border border-white/[0.08] bg-navy-surface/50 px-2.5 py-1.5 text-xs font-medium text-fumo transition-colors hover:border-aura-gold/25 hover:text-aura-gold sm:flex sm:px-3"
          title={t('nav.openKitchenDisplay')}
        >
          <MonitorCheck className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t('nav.kitchenDisplay')}</span>
          <ExternalLink className="hidden h-3 w-3 opacity-50 sm:block" />
        </a>

        <LanguageSwitcher />
        <NotificationBell />

        <div className="flex items-center gap-1.5 border-l border-white/[0.08] pl-2 sm:gap-2 sm:pl-3">
          <div className="premium-avatar">
            {user ? getInitials(user.name) : 'U'}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium leading-none text-pietra">{user?.name}</p>
            <p className="mt-0.5 text-xs text-fumo">{roleLabel}</p>
          </div>
          <button
            onClick={logout}
            className="premium-topbar-btn hover:!bg-red-500/100/10 hover:!text-red-400"
            title={t('common.logout')}
            aria-label={t('common.logout')}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
