import { type CSSProperties, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { api } from '../lib/api'
import { formatCurrency } from '../lib/utils'
import PublicLanguageSwitcher from '../components/public/PublicLanguageSwitcher'
import { AlertCircle, CalendarDays, CheckCircle2, Users, Phone, Mail, User } from 'lucide-react'

interface BookingInfo {
  restaurant: {
    name: string
    slug: string
    description?: string | null
    phone?: string | null
    logo?: string | null
    coverImage?: string | null
    colorTheme?: string | null
  }
  settings: {
    openTime: string
    closeTime: string
    maxCoversPerSlot: number
    reservationSlotMinutes: number
    depositRequired: boolean
    depositAmount: number
  }
}

function combineDateAndTime(date: string, time: string): string {
  return new Date(`${date}T${time}:00`).toISOString()
}

function getInitials(name: string): string {
  const parts = name.split(' ').map(p => p.trim()).filter(Boolean)
  return parts.slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('') || 'R'
}

export default function PublicReservationPage() {
  const { slug } = useParams<{ slug: string }>()
  const { t } = useTranslation()
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    guestName: '',
    guestPhone: '',
    guestEmail: '',
    covers: 2,
    date: '',
    time: '20:00',
    notes: '',
  })

  const { data, isLoading, error } = useQuery<BookingInfo>({
    queryKey: ['public-booking', slug],
    queryFn: () => api.get(`/public/booking/${slug}`).then(r => r.data),
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
  })

  const bookMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post<{
        reservationId: string
        status: string
        depositRequired: boolean
        checkoutUrl?: string
      }>(`/public/reservations`, {
        slug,
        guestName: form.guestName.trim(),
        guestPhone: form.guestPhone.trim(),
        guestEmail: form.guestEmail.trim() || undefined,
        covers: form.covers,
        date: combineDateAndTime(form.date, form.time),
        notes: form.notes.trim() || undefined,
      })
      return res.data
    },
    onSuccess: result => {
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl
        return
      }
      setSubmitted(true)
      toast.success(t('publicBooking.success'))
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      toast.error(msg ?? t('publicBooking.error'))
    },
  })

  if (isLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-navy">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-aura-gold" />
      </div>
    )
  }

  if (error || !data || !slug) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-navy p-6">
        <div className="max-w-sm rounded-2xl border border-white/[0.08] bg-navy-surface p-10 text-center shadow-2xl">
          <AlertCircle className="mx-auto mb-5 h-12 w-12 text-rose-400" />
          <h2 className="text-xl font-bold text-pietra">{t('publicBooking.notFound')}</h2>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="mx-auto flex min-h-[100dvh] items-center justify-center bg-navy p-6">
        <div className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-navy-surface p-10 text-center shadow-2xl">
          <CheckCircle2 className="mx-auto mb-6 h-16 w-16 text-aura-gold" />
          <h1 className="text-2xl font-bold text-pietra">{t('publicBooking.successTitle')}</h1>
          <p className="mt-3 text-sm text-fumo leading-relaxed">{t('publicBooking.successDesc')}</p>
          <Link
            to={`/menu/${slug}`}
            className="mt-8 inline-block rounded-xl border border-aura-gold/30 bg-aura-gold/10 px-6 py-3 text-sm font-bold tracking-wider text-aura-gold uppercase transition-colors hover:bg-aura-gold/20"
          >
            {t('publicBooking.viewMenu')}
          </Link>
        </div>
      </div>
    )
  }

  const minDate = new Date().toISOString().split('T')[0]!
  const brandColor = data.restaurant.colorTheme || '#c9a227'
  const heroImage = data.restaurant.coverImage
    || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80"
  const introStyle = {
    '--brand-color': brandColor,
  } as CSSProperties

  return (
    <div className="min-h-[100dvh] bg-navy text-pietra" style={introStyle}>
      <div className="mx-auto max-w-3xl">
        <div
          className="relative h-64 sm:h-80 overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(10, 15, 36, 0.2) 0%, #0a0f24 100%), url('${heroImage}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="flex items-start justify-end p-5">
            <PublicLanguageSwitcher />
          </div>
          <div className="absolute bottom-6 left-1/2 w-[calc(100%-3rem)] max-w-xl -translate-x-1/2 rounded-2xl border border-white/[0.08] bg-navy-elevated/80 p-5 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/[0.1] bg-navy-surface shadow-inner">
                {data.restaurant.logo ? (
                  <img src={data.restaurant.logo} alt={data.restaurant.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-lg font-bold text-pietra tracking-widest">{getInitials(data.restaurant.name)}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-aura-gold">
                  {t('publicBooking.badge')}
                </p>
                <h1 className="mt-1 truncate text-xl font-bold text-pietra">{data.restaurant.name}</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-5 pb-16 pt-8">
        <div className="mx-auto w-full max-w-xl rounded-2xl border border-white/[0.08] bg-navy-surface p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-aura-gold to-amber-400 opacity-80" />
          
          <p className="text-center text-sm leading-relaxed text-fumo">
            {t('publicBooking.welcome', { name: data.restaurant.name })}
          </p>
          <p className="mt-2 text-center text-[11px] font-medium tracking-widest uppercase text-fumo/70">
            {t('publicBooking.hours', {
              open: data.settings.openTime,
              close: data.settings.closeTime,
            })}
          </p>

          <form
            className="mt-8 space-y-5"
            onSubmit={e => {
              e.preventDefault()
              bookMutation.mutate()
            }}
          >
            <div>
              <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-fumo">
                <User className="h-3.5 w-3.5 text-aura-gold" /> {t('publicBooking.name')}
              </label>
              <input
                required
                minLength={2}
                value={form.guestName}
                onChange={e => setForm(f => ({ ...f, guestName: e.target.value }))}
                className="w-full rounded-xl border border-white/[0.1] bg-navy-mid px-4 py-3 text-sm text-pietra transition-colors focus:border-aura-gold focus:bg-navy-elevated focus:outline-none focus:ring-1 focus:ring-aura-gold"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-fumo">
                <Phone className="h-3.5 w-3.5 text-aura-gold" /> {t('publicBooking.phone')}
              </label>
              <input
                required
                minLength={6}
                type="tel"
                value={form.guestPhone}
                onChange={e => setForm(f => ({ ...f, guestPhone: e.target.value }))}
                className="w-full rounded-xl border border-white/[0.1] bg-navy-mid px-4 py-3 text-sm text-pietra transition-colors focus:border-aura-gold focus:bg-navy-elevated focus:outline-none focus:ring-1 focus:ring-aura-gold"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-fumo">
                <Mail className="h-3.5 w-3.5 text-aura-gold" /> {t('publicBooking.emailOptional')}
              </label>
              <input
                type="email"
                value={form.guestEmail}
                onChange={e => setForm(f => ({ ...f, guestEmail: e.target.value }))}
                className="w-full rounded-xl border border-white/[0.1] bg-navy-mid px-4 py-3 text-sm text-pietra transition-colors focus:border-aura-gold focus:bg-navy-elevated focus:outline-none focus:ring-1 focus:ring-aura-gold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-fumo">
                  <CalendarDays className="h-3.5 w-3.5 text-aura-gold" /> {t('publicBooking.date')}
                </label>
                <input
                  required
                  type="date"
                  min={minDate}
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full rounded-xl border border-white/[0.1] bg-navy-mid px-4 py-3 text-sm text-pietra transition-colors focus:border-aura-gold focus:bg-navy-elevated focus:outline-none focus:ring-1 focus:ring-aura-gold [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-fumo">{t('publicBooking.time')}</label>
                <input
                  required
                  type="time"
                  value={form.time}
                  onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                  className="w-full rounded-xl border border-white/[0.1] bg-navy-mid px-4 py-3 text-sm text-pietra transition-colors focus:border-aura-gold focus:bg-navy-elevated focus:outline-none focus:ring-1 focus:ring-aura-gold [color-scheme:dark]"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-fumo">
                <Users className="h-3.5 w-3.5 text-aura-gold" /> {t('publicBooking.covers')}
              </label>
              <input
                required
                type="number"
                min={1}
                max={data.settings.maxCoversPerSlot}
                value={form.covers}
                onChange={e => setForm(f => ({ ...f, covers: Number(e.target.value) }))}
                className="w-full rounded-xl border border-white/[0.1] bg-navy-mid px-4 py-3 text-sm text-pietra transition-colors focus:border-aura-gold focus:bg-navy-elevated focus:outline-none focus:ring-1 focus:ring-aura-gold"
              />
              <p className="mt-2 text-xs text-fumo/50">
                {t('publicBooking.maxCovers', { max: data.settings.maxCoversPerSlot })}
              </p>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-fumo">{t('publicBooking.notes')}</label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full rounded-xl border border-white/[0.1] bg-navy-mid px-4 py-3 text-sm text-pietra transition-colors focus:border-aura-gold focus:bg-navy-elevated focus:outline-none focus:ring-1 focus:ring-aura-gold resize-none"
                placeholder={t('publicBooking.notesPlaceholder')}
              />
            </div>

            {data.settings.depositRequired && (
              <div className="rounded-xl border border-aura-gold/20 bg-aura-gold/5 p-4 text-center">
                <p className="text-sm font-medium text-aura-gold">
                  {t('publicBooking.depositNotice', {
                    amount: formatCurrency(data.settings.depositAmount),
                  })}
                </p>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={bookMutation.isPending}
                className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-aura-gold to-amber-400 py-4 text-sm font-bold uppercase tracking-wider text-navy shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
              >
                {bookMutation.isPending ? t('common.loading') : t('publicBooking.submit')}
              </button>
            </div>

            <Link
              to={`/menu/${slug}`}
              className="mt-6 block text-center text-xs font-bold uppercase tracking-wider text-fumo hover:text-aura-gold transition-colors"
            >
              {t('publicBooking.viewMenu')}
            </Link>
          </form>
        </div>
      </div>
    </div>
  )
}
