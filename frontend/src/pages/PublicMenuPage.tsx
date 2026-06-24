import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { api } from '../lib/api'
import { formatCurrency, cn } from '../lib/utils'
import PublicLanguageSwitcher from '../components/public/PublicLanguageSwitcher'
import GuestCartBar from '../components/public/GuestCartBar'
import GuestCartDrawer from '../components/public/GuestCartDrawer'
import { useGuestCart } from '../hooks/useGuestCart'
import {
  AlertCircle, Search, X, Star, Wheat, Milk, Egg, Fish, Shell,
  Nut, Bean, Clock, Flame, UtensilsCrossed, CalendarDays, Plus,
} from 'lucide-react'

interface MenuItem {
  id: string; name: string; description?: string | null
  price: number
  available: boolean; soldOut?: boolean; orderable?: boolean
  allergens?: string | null
  calories?: number | null
  preparationTime?: number | null
  featured?: boolean
  image?: string | null
}

interface Category {
  id: string
  name: string
  description?: string | null
  items: MenuItem[]
}

const ALLERGEN_ICONS: Record<string, typeof Wheat> = {
  glutine: Wheat, gluten: Wheat, latte: Milk, milk: Milk, latticini: Milk,
  uova: Egg, egg: Egg, eggs: Egg, pesce: Fish, fish: Fish,
  crostacei: Shell, shellfish: Shell, crustaceans: Shell,
  arachidi: Nut, peanut: Nut, peanuts: Nut, frutta: Nut, nuts: Nut,
  soia: Bean, soy: Bean,
}

function AllergenBadge({ allergen }: { allergen: string }) {
  const key = allergen.toLowerCase().trim()
  const Icon = ALLERGEN_ICONS[key] ?? AlertCircle
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-aura-gold/20 bg-aura-gold/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-aura-gold">
      <Icon className="h-3 w-3 shrink-0" aria-hidden />
      {allergen}
    </span>
  )
}

function MenuItemCard({
  item,
  orderable,
  onAdd,
}: {
  item: MenuItem
  orderable: boolean
  onAdd?: () => void
}) {
  const { t } = useTranslation()
  const allergenList = item.allergens?.split(',').map(a => a.trim()).filter(Boolean) ?? []
  const canOrder = orderable && item.orderable !== false && !item.soldOut

  return (
    <article className="rounded-xl border border-white/[0.08] bg-navy-surface p-4 shadow-lg transition-transform hover:-translate-y-0.5 hover:border-aura-gold/30">
      <div className="flex gap-4">
        {item.image && (
          <div className="shrink-0 overflow-hidden rounded-xl border border-white/[0.08]">
            <img
              src={item.image}
              alt=""
              className="h-24 w-24 object-cover transition-transform duration-500 hover:scale-105"
              loading="lazy"
            />
          </div>
        )}
        <div className="min-w-0 flex-1 flex flex-col justify-between">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-pietra">{item.name}</h3>
                {item.featured && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-aura-gold/25 bg-aura-gold/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-aura-gold">
                    <Star className="h-3 w-3 fill-aura-gold text-aura-gold" aria-hidden />
                    {t('publicMenu.featured')}
                  </span>
                )}
                {item.soldOut && (
                  <span className="inline-flex items-center rounded-full border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-400">
                    {t('publicMenu.soldOut')}
                  </span>
                )}
              </div>
              {item.description && (
                <p className="mt-1.5 text-sm leading-relaxed text-fumo">{item.description}</p>
              )}
            </div>
          </div>

          <div className="mt-3 flex items-end justify-between">
            <p className="shrink-0 text-lg font-bold tabular-nums text-aura-gold">
              {formatCurrency(item.price)}
            </p>
            {canOrder && onAdd && (
              <button
                type="button"
                onClick={onAdd}
                className="group flex shrink-0 items-center gap-1.5 rounded-lg bg-aura-gold px-3 py-1.5 text-xs font-bold text-navy transition-all hover:bg-aura-gold-light hover:shadow-[0_0_15px_rgba(212,175,55,0.4)]"
              >
                <Plus className="h-3.5 w-3.5 transition-transform group-hover:scale-110" aria-hidden />
                {t('publicMenu.addToCart')}
              </button>
            )}
          </div>

          {(allergenList.length > 0 || (item.calories != null && item.calories > 0) || (item.preparationTime != null && item.preparationTime > 0)) && (
            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/[0.04] pt-3">
              {allergenList.map(a => <AllergenBadge key={a} allergen={a} />)}
              
              {item.calories != null && item.calories > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-fumo uppercase tracking-wider">
                  <Flame className="h-3.5 w-3.5 text-aura-gold" aria-hidden />
                  {item.calories} kcal
                </span>
              )}
              {item.preparationTime != null && item.preparationTime > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-fumo uppercase tracking-wider">
                  <Clock className="h-3.5 w-3.5 text-aura-gold" aria-hidden />
                  {t('publicMenu.prepTime', { min: item.preparationTime })}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

function parseTableFromSearch(params: URLSearchParams): number | null {
  const raw = params.get('tavolo') ?? params.get('table')
  if (!raw) return null
  const n = Number.parseInt(raw, 10)
  return Number.isFinite(n) && n > 0 ? n : null
}

export default function PublicMenuPage() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const { t } = useTranslation()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const cart = useGuestCart(slug)

  const tableNumber = useMemo(() => parseTableFromSearch(searchParams), [searchParams])

  useEffect(() => {
    if (searchParams.get('payment') === 'cancelled') {
      toast.error(t('publicMenu.paymentCancelled'))
      setSearchParams(prev => {
        const next = new URLSearchParams(prev)
        next.delete('payment')
        return next
      }, { replace: true })
    }
  }, [searchParams, setSearchParams, t])

  const { data, isLoading, error } = useQuery<{
    restaurant: {
      name: string
      logo?: string | null
      description?: string | null
      colorTheme?: string
      slug: string
      fiscal?: { taxRate: number; taxName: string }
    }
    categories: Category[]
    guestOrderingEnabled?: boolean
    stripeEnabled?: boolean
  }>({
    queryKey: ['public-menu', slug],
    queryFn: () => api.get(`/public/menu/${slug}`).then(r => r.data),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  const categories = useMemo(() => {
    if (!data?.categories) return []
    return data.categories.filter(cat => cat.items.length > 0)
  }, [data?.categories])

  const allItems = useMemo(() => categories.flatMap(c => c.items), [categories])

  const filteredItems = useMemo(() => {
    if (!search.trim()) return null
    const q = search.toLowerCase()
    return allItems.filter(
      i => i.name.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q),
    )
  }, [search, allItems])

  const activeCategory = selectedCategory
    ? categories.find(c => c.id === selectedCategory)
    : categories[0]

  const displayItems = filteredItems ?? activeCategory?.items ?? []
  const displayTitle = search.trim()
    ? t('publicMenu.searchResults', { query: search })
    : activeCategory?.name ?? t('publicMenu.title')

  const guestOrderingEnabled = data?.guestOrderingEnabled !== false
  const hasCartItems = cart.itemCount > 0

  if (isLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-navy">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-aura-gold" />
          <p className="text-sm font-semibold tracking-widest text-fumo uppercase">{t('publicMenu.loading')}</p>
        </div>
      </div>
    )
  }

  if (error || !data || !slug) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-navy p-6">
        <div className="max-w-sm rounded-2xl border border-white/[0.08] bg-navy-surface p-10 text-center shadow-2xl">
          <AlertCircle className="mx-auto mb-5 h-12 w-12 text-rose-400" />
          <h2 className="text-xl font-bold text-pietra">{t('publicMenu.notFound')}</h2>
          <p className="mt-3 text-sm text-fumo leading-relaxed">{t('publicMenu.notFoundHint')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto min-h-[100dvh] max-w-2xl bg-navy text-pietra relative">
      <header className="sticky top-0 z-20 border-b border-white/[0.08] bg-navy-elevated/90 backdrop-blur-md shadow-xl">
        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold tracking-tight text-pietra">{data.restaurant.name}</h1>
            {data.restaurant.description && (
              <p className="mt-0.5 truncate text-sm text-fumo">{data.restaurant.description}</p>
            )}
            {tableNumber != null && (
              <p className="mt-2 inline-flex items-center rounded-full border border-aura-gold/30 bg-aura-gold/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-aura-gold">
                {t('publicMenu.tableBadge', { number: tableNumber })}
              </p>
            )}
          </div>
          <PublicLanguageSwitcher />
        </div>

        <div className="border-t border-white/[0.04] bg-navy-surface/50 px-5 py-3">
          <div className="flex items-start gap-3">
            <UtensilsCrossed className="mt-0.5 h-4 w-4 shrink-0 text-aura-gold" aria-hidden />
            <p className="text-sm font-medium leading-relaxed text-pietra">
              {guestOrderingEnabled
                ? (tableNumber != null
                  ? t('publicMenu.orderHint')
                  : t('publicMenu.browseBeforeVisitHint'))
                : (tableNumber != null
                  ? t('publicMenu.atTableOrderHint', { number: tableNumber })
                  : t('publicMenu.browseBeforeVisitHint'))}
            </p>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-white/[0.04]">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-fumo group-focus-within:text-aura-gold transition-colors" aria-hidden />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('publicMenu.searchPlaceholder')}
              className="w-full rounded-2xl border border-white/[0.1] bg-navy-mid py-3 pl-11 pr-11 text-sm text-pietra placeholder:text-fumo/50 focus:border-aura-gold focus:bg-navy-elevated focus:outline-none focus:ring-1 focus:ring-aura-gold transition-all shadow-inner"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-fumo hover:text-white transition-colors rounded-full hover:bg-white/10"
                aria-label={t('common.close')}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {!search.trim() && categories.length > 1 && (
        <nav
          className="sticky top-[13.5rem] z-10 border-b border-white/[0.08] bg-navy/95 backdrop-blur-md shadow-lg"
          aria-label={t('publicMenu.categories')}
        >
          <div className="flex gap-2 overflow-x-auto px-5 py-3 scrollbar-none">
            {categories.map(cat => {
              const isActive = (selectedCategory ?? categories[0]?.id) === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`shrink-0 rounded-full border px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                    isActive
                      ? 'border-aura-gold bg-aura-gold text-navy shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                      : 'border-white/[0.1] bg-navy-surface text-fumo hover:border-aura-gold/50 hover:bg-white/[0.05] hover:text-white'
                  }`}
                >
                  {cat.name}
                </button>
              )
            })}
          </div>
        </nav>
      )}

      <main className={cn('px-5 py-8 min-h-[50vh]', hasCartItems ? 'pb-32' : 'pb-12')}>
        <h2 className="mb-6 text-sm font-bold uppercase tracking-[0.2em] text-aura-gold flex items-center gap-4">
          <span>{displayTitle}</span>
          <div className="h-px flex-1 bg-gradient-to-r from-aura-gold/30 to-transparent" />
        </h2>

        {displayItems.length > 0 ? (
          <div className="space-y-4">
            {displayItems.map(item => (
              <MenuItemCard
                key={item.id}
                item={item}
                orderable={guestOrderingEnabled}
                onAdd={() => {
                  cart.addItem({ menuItemId: item.id, name: item.name, price: item.price })
                  toast.success(t('publicMenu.addedToCart', { name: item.name }))
                }}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/[0.08] bg-navy-surface py-16 text-center shadow-lg">
            <Search className="mx-auto mb-4 h-10 w-10 text-fumo/50" />
            <p className="font-bold text-pietra text-lg">{t('publicMenu.noResults')}</p>
            <p className="mt-2 text-sm text-fumo max-w-[200px] mx-auto">{t('publicMenu.noResultsHint')}</p>
          </div>
        )}

        <div className="mt-12 space-y-4">
          {!guestOrderingEnabled && tableNumber != null ? (
            <p className="text-center text-sm font-medium text-fumo bg-navy-surface rounded-xl p-4 border border-white/[0.04]">{t('publicMenu.browseOnlyHint')}</p>
          ) : !guestOrderingEnabled ? (
            <div className="bg-navy-elevated rounded-2xl border border-aura-gold/20 p-6 text-center shadow-xl">
              <CalendarDays className="h-8 w-8 text-aura-gold mx-auto mb-3" />
              <p className="text-sm font-medium text-pietra mb-4">{t('publicMenu.bookingFooterHint')}</p>
              <Link
                to={`/prenota/${slug}`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-aura-gold to-amber-400 px-5 py-3.5 text-sm font-bold uppercase tracking-wider text-navy shadow-lg transition-transform hover:scale-[1.02] hover:shadow-aura-gold/30"
              >
                {t('publicMenu.bookTable')}
              </Link>
            </div>
          ) : null}
        </div>
      </main>

      {guestOrderingEnabled && (
        <>
          <GuestCartBar
            itemCount={cart.itemCount}
            total={cart.subtotal}
            onOpen={() => setCartOpen(true)}
          />
          <GuestCartDrawer
            open={cartOpen}
            onClose={() => setCartOpen(false)}
            slug={slug!}
            restaurantName={data.restaurant.name}
            stripeEnabled={data.stripeEnabled ?? false}
            fiscal={data.restaurant.fiscal ?? { taxRate: 10, taxName: 'IVA' }}
            tableNumber={tableNumber}
            items={cart.items}
            subtotal={cart.subtotal}
            onSetQuantity={cart.setQuantity}
            onRemoveItem={cart.removeItem}
            onClearCart={cart.clearCart}
          />
        </>
      )}
    </div>
  )
}
