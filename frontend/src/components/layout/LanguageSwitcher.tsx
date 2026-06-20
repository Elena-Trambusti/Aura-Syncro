import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe, ChevronDown, Check } from 'lucide-react'
import { cn } from '../../lib/utils'

const LANGUAGES = [
  { code: 'it', name: 'Italiano' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
] as const

const STORAGE_KEY = 'aura-lang'

interface LanguageSwitcherProps {
  prominent?: boolean
}

export default function LanguageSwitcher({ prominent = false }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const current =
    LANGUAGES.find(lang => lang.code === i18n.language?.split('-')[0]) ?? LANGUAGES[0]

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code)
    localStorage.setItem(STORAGE_KEY, code)
    setOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className={cn(
          'flex items-center gap-1.5 font-medium border rounded-lg transition-colors max-w-[9.5rem]',
          prominent
            ? 'px-3 py-2 text-sm text-stone-200 border-stone-600/70 bg-stone-900/80 hover:bg-stone-800/90 hover:border-amber-700/50 shadow-lg backdrop-blur-sm'
            : 'px-2.5 py-1.5 text-xs text-stone-300 border-stone-700/60 hover:bg-stone-800/50 hover:text-stone-100',
        )}
        aria-label={t('common.selectLanguage')}
        aria-expanded={open}
        aria-haspopup="listbox"
        title={t('common.selectLanguage')}
      >
        <Globe className={cn('shrink-0', prominent ? 'w-4 h-4' : 'w-3.5 h-3.5')} />
        <span className="truncate">{current.name}</span>
        <ChevronDown className={cn('shrink-0 opacity-60 transition-transform', prominent ? 'w-3.5 h-3.5' : 'w-3 h-3', open && 'rotate-180')} />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t('common.selectLanguage')}
          className="absolute right-0 top-full mt-1 z-[100] min-w-[10.5rem] py-1 rounded-xl border border-stone-700/80 bg-stone-900 shadow-xl"
        >
          {LANGUAGES.map(lang => {
            const selected = lang.code === current.code
            return (
              <li key={lang.code} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => changeLanguage(lang.code)}
                  className={cn(
                    'w-full flex items-center justify-between gap-3 px-3 py-2.5 text-sm font-medium text-left transition-colors',
                    selected
                      ? 'text-amber-400 bg-stone-800/80'
                      : 'text-stone-300 hover:bg-stone-800/60 hover:text-stone-100',
                  )}
                >
                  <span>{lang.name}</span>
                  {selected && <Check className="w-4 h-4 shrink-0" />}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
