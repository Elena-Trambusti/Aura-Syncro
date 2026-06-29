/**
 * Smoke test: login → ordine → pagamento → CRM → campagna marketing
 * Uso: npx tsx scripts/test-flow.ts [baseUrl]
 */
const BASE = (process.argv[2] || 'https://aura-syncro-s98ae.ondigitalocean.app').replace(/\/$/, '')
const EMAIL = 'aurasyncro@gmail.com'
const PASSWORD = 'AuraSyncro2026!'
const REQUEST_TIMEOUT_MS = 120_000

async function api(
  path: string,
  opts: { method?: string; token?: string; body?: unknown; idempotencyKey?: string } = {},
) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const res = await fetch(`${BASE}/api${path}`, {
      method: opts.method ?? (opts.body ? 'POST' : 'GET'),
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
        ...(opts.idempotencyKey ? { 'X-Idempotency-Key': opts.idempotencyKey } : {}),
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    })
    const text = await res.text()
    let data: unknown
    try {
      data = text ? JSON.parse(text) : null
    } catch {
      data = text
    }
    if (!res.ok) {
      throw new Error(`${opts.method ?? 'GET'} ${path} → ${res.status}: ${JSON.stringify(data)}`)
    }
    return data
  } finally {
    clearTimeout(timer)
  }
}

async function ensureCashSessionOpen(token: string): Promise<void> {
  const current = (await api('/cash/session/current', { token })) as { id: string } | null
  if (current?.id) return
  await api('/cash/session/open', {
    token,
    method: 'POST',
    body: { openingBalance: 100 },
  })
  console.log('✓ Cassa aperta per test pagamento contanti')
}

async function finalizeWithRetry(
  token: string,
  orderId: string,
  idempotencyKey: string,
) {
  const body = {
    orderId,
    paymentMethod: 'CASH',
    tipAmount: 0,
    applyLoyaltyDiscount: true,
  }
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await api('/payments/finalize', {
        token,
        method: 'POST',
        body,
        idempotencyKey: `${idempotencyKey}:${attempt}`,
      }) as { success: boolean; order: { status: string; discount?: number } }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      const retryable = /→ (502|503|504):/.test(message) || message.includes('abort')
      if (!retryable || attempt === 3) throw err
      console.warn(`⚠ finalize tentativo ${attempt} fallito, retry...`)
      await new Promise(r => setTimeout(r, 2000 * attempt))
    }
  }
  throw new Error('finalize retry exhausted')
}

async function main() {
  console.log(`\n🧪 Test flow su ${BASE}\n`)

  const login = (await api('/auth/login', {
    method: 'POST',
    body: { email: EMAIL, password: PASSWORD },
  })) as { token: string; restaurant: { id: string; planTier: string } }
  console.log('✓ Login OK — piano', login.restaurant.planTier)

  const token = login.token

  await api('/analytics/summary', { token })
  console.log('✓ Analytics summary OK')

  const categories = (await api('/menu/categories', { token })) as Array<{ id: string; name: string }>
  let categoryId = categories[0]?.id
  if (!categoryId) {
    const cat = (await api('/menu/categories', {
      token,
      method: 'POST',
      body: { name: 'Test' },
    })) as { id: string }
    categoryId = cat.id
    console.log('✓ Categoria menu creata')
  }

  const menu = (await api('/menu/items', { token })) as Array<{ id: string; name: string; available: boolean }>
  let menuItemId = menu.find(m => m.available)?.id
  if (!menuItemId) {
    const created = (await api('/menu/items', {
      token,
      method: 'POST',
      body: {
        categoryId,
        name: 'Test Piatto',
        price: 12.5,
        available: true,
      },
    })) as { id: string }
    menuItemId = created.id
    console.log('✓ Menu item creato')
  } else {
    console.log('✓ Menu item trovato')
  }

  const customerEmail = `test-${Date.now()}@example.com`
  const customer = (await api('/customers', {
    token,
    method: 'POST',
    body: {
      firstName: 'Mario',
      lastName: 'Test',
      email: customerEmail,
      phone: '+39333111222',
    },
  })) as { id: string }
  console.log('✓ Cliente CRM creato')

  const order = (await api('/orders', {
    token,
    method: 'POST',
    body: {
      type: 'TAKEAWAY',
      customerId: customer.id,
      items: [{ menuItemId, quantity: 1 }],
    },
    idempotencyKey: `test-flow-order-${Date.now()}`,
  })) as { id: string; total: number; status: string }
  console.log(`✓ Ordine creato — €${order.total.toFixed(2)} (${order.status})`)

  await api(`/orders/${order.id}/status`, {
    token,
    method: 'PATCH',
    body: { status: 'READY' },
  })

  await ensureCashSessionOpen(token)

  const paid = await finalizeWithRetry(token, order.id, `test-flow-pay-${order.id}`)
  console.log('✓ Pagamento finalizzato — status', paid.order.status)

  const orderWithDiscount = (await api('/orders', {
    token,
    method: 'POST',
    body: {
      type: 'TAKEAWAY',
      customerId: customer.id,
      items: [{ menuItemId, quantity: 2 }],
    },
    idempotencyKey: `test-flow-order-discount-${Date.now()}`,
  })) as { id: string; total: number; discount?: number }
  if ((orderWithDiscount.discount ?? 0) <= 0) {
    console.warn('⚠ Sconto fedeltà non applicato — verificare tier Gold sul cliente demo')
  } else {
    console.log(`✓ Sconto fedeltà applicato: €${orderWithDiscount.discount}`)
  }

  const customers = (await api('/customers', { token })) as Array<{
    id: string
    email: string | null
    totalVisits: number
    totalSpent: number
  }>
  const updated = customers.find(c => c.id === customer.id)
  if (!updated || updated.totalVisits < 1) {
    throw new Error('CRM non aggiornato dopo pagamento')
  }
  console.log(`✓ CRM aggiornato — visite ${updated.totalVisits}, speso €${updated.totalSpent}`)

  const campaign = (await api('/marketing', {
    token,
    method: 'POST',
    body: {
      name: `Test campagna ${new Date().toISOString()}`,
      type: 'EMAIL',
      subject: 'Test Aura Syncro',
      message: 'Ciao {{name}}, grazie per aver scelto Aura Syncro!',
    },
  })) as { id: string }

  const sent = (await api(`/marketing/${campaign.id}/send`, {
    token,
    method: 'POST',
    body: {},
  })) as { sent?: number; skipped?: number }
  console.log('✓ Campagna inviata —', sent)

  console.log('\n✅ Tutti i passaggi completati.\n')
}

main().catch(err => {
  console.error('\n❌', err instanceof Error ? err.message : err)
  process.exit(1)
})
