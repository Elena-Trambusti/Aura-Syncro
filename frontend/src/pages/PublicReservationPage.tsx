import { useState } from 'react'
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

  return (
    <div className="mx-auto min-h-[100dvh] max-w-lg bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              {t('publicBooking.badge')}
            </p>
            <h1 className="text-lg font-bold text-slate-900">{data.restaurant.name}</h1>
          </div>
          <PublicLanguageSwitcher />
        </div>
        <p className="mt-2 text-sm text-slate-600">{t('publicBooking.subtitle')}</p>
        <p className="mt-1 text-xs text-slate-500">
          {t('publicBooking.hours', {
            open: data.settings.openTime,
            close: data.settings.closeTime,
          })}
        </p>
      </header>

      <form
        className="space-y-4 p-4 pb-8"
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
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
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
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
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
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
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
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('publicBooking.time')}</label>
            <input
              required
              type="time"
              value={form.time}
              onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
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
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
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
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
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
          className="w-full rounded-xl bg-amber-500 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-amber-600 disabled:opacity-60"
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
  )
}
