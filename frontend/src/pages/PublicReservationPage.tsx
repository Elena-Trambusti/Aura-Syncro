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
      <div className="flex min-h-[100dvh] items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500/30 border-t-amber-500" />
      </div>
    )
  }

  if (error || !data || !slug) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-slate-50 p-6">
        <div className="max-w-sm rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-4 h-10 w-10 text-rose-500" />
          <h2 className="text-lg font-bold text-slate-900">{t('publicBooking.notFound')}</h2>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="mx-auto flex min-h-[100dvh] max-w-lg items-center justify-center bg-slate-50 p-6">
        <div className="w-full rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-emerald-500" />
          <h1 className="text-xl font-bold text-slate-900">{t('publicBooking.successTitle')}</h1>
          <p className="mt-2 text-sm text-slate-600">{t('publicBooking.successDesc')}</p>
          <Link
            to={`/menu/${slug}`}
            className="mt-6 inline-block text-sm font-semibold text-amber-700 hover:underline"
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
    <div className="min-h-[100dvh] bg-gray-50" style={introStyle}>
      <div className="mx-auto max-w-3xl">
        <div
          className="relative h-52 overflow-hidden sm:h-64"
          style={{
            backgroundImage: `linear-gradient(120deg, rgba(15,23,42,0.78), rgba(30,41,59,0.48)), url('${heroImage}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="flex items-start justify-end p-4">
            <PublicLanguageSwitcher />
          </div>
          <div className="absolute -bottom-12 left-1/2 w-[calc(100%-2rem)] -translate-x-1/2 rounded-2xl border border-white/60 bg-white/95 p-4 shadow-lg backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                {data.restaurant.logo ? (
                  <img src={data.restaurant.logo} alt={data.restaurant.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-slate-700">{getInitials(data.restaurant.name)}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t('publicBooking.badge')}
                </p>
                <h1 className="truncate text-lg font-bold text-slate-900">{data.restaurant.name}</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 pb-10 pt-16 sm:pt-20">
        <div className="mx-auto w-full max-w-xl rounded-xl border border-slate-200 bg-white p-5 shadow-lg sm:p-6">
          <p className="text-sm leading-relaxed text-slate-600">
            {t('publicBooking.welcome', { name: data.restaurant.name })}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {t('publicBooking.hours', {
              open: data.settings.openTime,
              close: data.settings.closeTime,
            })}
          </p>

          <form
            className="mt-5 space-y-4"
            onSubmit={e => {
              e.preventDefault()
              bookMutation.mutate()
            }}
          >
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <User className="h-4 w-4" /> {t('publicBooking.name')}
              </label>
              <input
                required
                minLength={2}
                value={form.guestName}
                onChange={e => setForm(f => ({ ...f, guestName: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[var(--brand-color)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-color)]/20"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <Phone className="h-4 w-4" /> {t('publicBooking.phone')}
              </label>
              <input
                required
                minLength={6}
                type="tel"
                value={form.guestPhone}
                onChange={e => setForm(f => ({ ...f, guestPhone: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[var(--brand-color)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-color)]/20"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <Mail className="h-4 w-4" /> {t('publicBooking.emailOptional')}
              </label>
              <input
                type="email"
                value={form.guestEmail}
                onChange={e => setForm(f => ({ ...f, guestEmail: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[var(--brand-color)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-color)]/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
                  <CalendarDays className="h-4 w-4" /> {t('publicBooking.date')}
                </label>
                <input
                  required
                  type="date"
                  min={minDate}
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[var(--brand-color)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-color)]/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('publicBooking.time')}</label>
                <input
                  required
                  type="time"
                  value={form.time}
                  onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[var(--brand-color)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-color)]/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <Users className="h-4 w-4" /> {t('publicBooking.covers')}
              </label>
              <input
                required
                type="number"
                min={1}
                max={data.settings.maxCoversPerSlot}
                value={form.covers}
                onChange={e => setForm(f => ({ ...f, covers: Number(e.target.value) }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[var(--brand-color)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-color)]/20"
              />
              <p className="mt-1 text-xs text-slate-500">
                {t('publicBooking.maxCovers', { max: data.settings.maxCoversPerSlot })}
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('publicBooking.notes')}</label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[var(--brand-color)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-color)]/20"
                placeholder={t('publicBooking.notesPlaceholder')}
              />
            </div>

            {data.settings.depositRequired && (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {t('publicBooking.depositNotice', {
                  amount: formatCurrency(data.settings.depositAmount),
                })}
              </p>
            )}

            <button
              type="submit"
              disabled={bookMutation.isPending}
              style={{ backgroundColor: brandColor }}
              className="w-full rounded-xl py-3.5 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-95 disabled:opacity-60"
            >
              {bookMutation.isPending ? t('common.loading') : t('publicBooking.submit')}
            </button>

            <Link
              to={`/menu/${slug}`}
              className="block text-center text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              {t('publicBooking.viewMenu')}
            </Link>
          </form>
        </div>
      </div>
    </div>
  )
}
