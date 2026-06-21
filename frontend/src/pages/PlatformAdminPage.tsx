import { useEffect, useState } from 'react'
import { Loader2, Shield, Users, RefreshCw, LogOut } from 'lucide-react'
import {
  clearStoredAdminKey,
  fetchRegistrations,
  getStoredAdminKey,
  setStoredAdminKey,
  type PlatformRegistration,
} from '../lib/platformAdmin'
import { BRAND } from '../lib/brand'

type FilterMode = 'today' | 'all'

export default function PlatformAdminPage() {
  const [adminKey, setAdminKey] = useState(getStoredAdminKey() ?? '')
  const [inputKey, setInputKey] = useState('')
  const [authenticated, setAuthenticated] = useState(!!getStoredAdminKey())
  const [filter, setFilter] = useState<FilterMode>('today')
  const [registrations, setRegistrations] = useState<PlatformRegistration[]>([])
  const [meta, setMeta] = useState<{ count: number; date?: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async (key: string, mode: FilterMode) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchRegistrations(key, {
        today: mode === 'today',
        limit: mode === 'today' ? 100 : 50,
      })
      setRegistrations(data.registrations)
      setMeta({ count: data.count, date: data.filter.date })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? 'Impossibile caricare le iscrizioni. Verifica la chiave admin.'
      setError(msg)
      if ((err as { response?: { status?: number } })?.response?.status === 401) {
        clearStoredAdminKey()
        setAuthenticated(false)
        setAdminKey('')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authenticated && adminKey) {
      void load(adminKey, filter)
    }
  }, [authenticated, adminKey, filter])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = inputKey.trim()
    if (!trimmed) return
    setStoredAdminKey(trimmed)
    setAdminKey(trimmed)
    setAuthenticated(true)
  }

  const handleLogout = () => {
    clearStoredAdminKey()
    setAuthenticated(false)
    setAdminKey('')
    setInputKey('')
    setRegistrations([])
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-stone-800 bg-stone-900 p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-amber-400" />
            <div>
              <h1 className="text-xl font-bold text-white">{BRAND.name} — Admin</h1>
              <p className="text-sm text-stone-400">Accesso piattaforma (solo team Aura Syncro)</p>
            </div>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-1.5">Chiave admin</label>
              <input
                type="password"
                value={inputKey}
                onChange={e => setInputKey(e.target.value)}
                className="w-full rounded-xl border border-stone-700 bg-stone-800 px-4 py-2.5 text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                placeholder="ADMIN_API_KEY"
                autoComplete="off"
              />
              <p className="text-xs text-stone-500 mt-2">
                La trovi in <code className="text-stone-400">backend/.env</code> → <code className="text-stone-400">ADMIN_API_KEY</code>
              </p>
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold text-sm"
            >
              Accedi
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-950 text-white">
      <header className="border-b border-stone-800 bg-stone-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-amber-400" />
            <div>
              <h1 className="font-bold">Iscrizioni piattaforma</h1>
              <p className="text-xs text-stone-400">Fuso orario: Europe/Rome</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void load(adminKey, filter)}
              disabled={loading}
              className="p-2 rounded-lg border border-stone-700 hover:bg-stone-800 disabled:opacity-50"
              title="Aggiorna"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-lg border border-stone-700 hover:bg-stone-800"
              title="Esci"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            type="button"
            onClick={() => setFilter('today')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === 'today'
                ? 'bg-amber-500 text-stone-950'
                : 'border border-stone-700 text-stone-300 hover:bg-stone-800'
            }`}
          >
            Oggi
          </button>
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-amber-500 text-stone-950'
                : 'border border-stone-700 text-stone-300 hover:bg-stone-800'
            }`}
          >
            Ultime 50
          </button>
        </div>

        {loading && registrations.length === 0 ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          </div>
        ) : error ? (
          <p className="text-red-400 text-sm">{error}</p>
        ) : (
          <>
            <p className="text-stone-400 text-sm mb-4">
              {filter === 'today'
                ? `${meta?.count ?? 0} iscrizioni oggi${meta?.date ? ` (${meta.date})` : ''}`
                : `${meta?.count ?? 0} iscrizioni recenti`}
            </p>

            {registrations.length === 0 ? (
              <div className="rounded-xl border border-stone-800 bg-stone-900 p-8 text-center text-stone-400">
                {filter === 'today' ? 'Nessuna iscrizione oggi.' : 'Nessuna iscrizione trovata.'}
              </div>
            ) : (
              <div className="space-y-3">
                {registrations.map(r => (
                  <article
                    key={r.userId}
                    className="rounded-xl border border-stone-800 bg-stone-900 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-semibold text-white">{r.ownerName}</p>
                        <p className="text-sm text-amber-400/90">{r.email}</p>
                      </div>
                      <time className="text-xs text-stone-500">{r.registeredAtRome}</time>
                    </div>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <div>
                        <dt className="text-stone-500 inline">Ristorante: </dt>
                        <dd className="inline text-stone-200">{r.restaurantName}</dd>
                      </div>
                      {r.phone && (
                        <div>
                          <dt className="text-stone-500 inline">Tel: </dt>
                          <dd className="inline text-stone-200">{r.phone}</dd>
                        </div>
                      )}
                      <div>
                        <dt className="text-stone-500 inline">Piano: </dt>
                        <dd className="inline text-stone-200">
                          {r.planTier}
                          {r.hasActiveSubscription ? ' · abbonato' : ' · free'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-stone-500 inline">Setup: </dt>
                        <dd className="inline text-stone-200">
                          {r.isSetupComplete ? 'completo' : 'in attesa'}
                        </dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
