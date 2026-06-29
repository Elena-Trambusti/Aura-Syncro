/**
 * Diagnostica POST /payments/finalize su deploy DO
 */
const BASE = (process.argv[2] || 'https://aura-syncro-s98ae.ondigitalocean.app').replace(/\/$/, '')
const EMAIL = 'aurasyncro@gmail.com'
const PASSWORD = 'AuraSyncro2026!'

async function api(path: string, opts: { method?: string; token?: string; body?: unknown } = {}) {
  const res = await fetch(`${BASE}/api${path}`, {
    method: opts.method ?? (opts.body ? 'POST' : 'GET'),
    headers: {
      'Content-Type': 'application/json',
      ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })
  const text = await res.text()
  let data: unknown
  try { data = text ? JSON.parse(text) : null } catch { data = text?.slice(0, 200) }
  return { ok: res.ok, status: res.status, data }
}

async function main() {
  console.log('Base:', BASE)
  const health = await api('/health')
  console.log('Health:', health.status, health.data)

  const login = await api('/auth/login', { method: 'POST', body: { email: EMAIL, password: PASSWORD } })
  if (!login.ok) throw new Error(`Login failed: ${login.status}`)
  const token = (login.data as { token: string }).token
  console.log('Login OK')

  const menu = await api('/menu/items', { token }) as { ok: boolean; data: Array<{ id: string; available: boolean }> }
  const menuItemId = menu.data.find(m => m.available)?.id
  if (!menuItemId) throw new Error('No menu item')

  const orderRes = await api('/orders', {
    token,
    method: 'POST',
    body: { type: 'TAKEAWAY', items: [{ menuItemId, quantity: 1 }] },
  })
  console.log('Create order:', orderRes.status, orderRes.data)
  if (!orderRes.ok) return
  const orderId = (orderRes.data as { id: string }).id

  await api(`/orders/${orderId}/status`, { token, method: 'PATCH', body: { status: 'READY' } })

  // Test A: CARD senza loyalty
  console.log('\n--- Test A: CARD, no loyalty ---')
  const a = await api('/payments/finalize', {
    token,
    method: 'POST',
    body: { orderId, paymentMethod: 'CARD', tipAmount: 0, applyLoyaltyDiscount: false },
  })
  console.log('Finalize A:', a.status, typeof a.data === 'string' ? a.data : JSON.stringify(a.data))

  const healthAfter = await api('/health')
  console.log('Health after A:', healthAfter.status)

  // Test B: nuovo ordine CASH con cassa
  const orderB = await api('/orders', {
    token,
    method: 'POST',
    body: { type: 'TAKEAWAY', items: [{ menuItemId, quantity: 1 }] },
  })
  const orderIdB = (orderB.data as { id: string }).id
  await api(`/orders/${orderIdB}/status`, { token, method: 'PATCH', body: { status: 'READY' } })

  const cash = await api('/cash/session/current', { token })
  if (!(cash.data as { id?: string } | null)?.id) {
    await api('/cash/session/open', { token, method: 'POST', body: { openingBalance: 50 } })
    console.log('Cash session opened')
  }

  console.log('\n--- Test B: CASH, no loyalty ---')
  const b = await api('/payments/finalize', {
    token,
    method: 'POST',
    body: { orderId: orderIdB, paymentMethod: 'CASH', tipAmount: 0, applyLoyaltyDiscount: false },
  })
  console.log('Finalize B:', b.status, typeof b.data === 'string' ? String(b.data).slice(0, 120) : JSON.stringify(b.data))

  const healthAfterB = await api('/health')
  console.log('Health after B:', healthAfterB.status)
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
