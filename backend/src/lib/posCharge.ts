import { stripe, STRIPE_ENABLED } from './stripe'

export interface PosChargeBreakdown {
  /** Importo soggetto a IVA/IGIC (solo piatti) — base per il terminale fiscale */
  taxableAmount: number
  /** Mancia esente — non inclusa nel calcolo imposta del POS */
  tipAmount: number
  /** Totale addebitato al cliente (taxable + tip) */
  totalCustomerAmount: number
  taxRegion?: string
}

export interface PosChargeResult {
  success: boolean
  transactionId: string
  terminalId: string
  provider: 'stripe' | 'simulated'
  stripePaymentIntentId?: string
  breakdown?: PosChargeBreakdown
}

async function simulatePosTerminal(
  breakdown: PosChargeBreakdown,
): Promise<PosChargeResult> {
  const delayMs = Number(process.env.POS_SIMULATE_DELAY_MS) || 800
  await new Promise(resolve => setTimeout(resolve, delayMs))
  return {
    success: true,
    transactionId: `pos_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    terminalId: process.env.POS_TERMINAL_ID || 'SIM-TPV-001',
    provider: 'simulated',
    breakdown,
  }
}

function normalizeBreakdown(
  input: number | PosChargeBreakdown,
): PosChargeBreakdown {
  if (typeof input === 'number') {
    return {
      taxableAmount: input,
      tipAmount: 0,
      totalCustomerAmount: input,
    }
  }
  return {
    ...input,
    totalCustomerAmount: input.totalCustomerAmount
      ?? Math.round((input.taxableAmount + input.tipAmount) * 100) / 100,
  }
}

/** Verifica PaymentIntent Stripe già incassato (POS con Payment Element / Terminal). */
export async function verifyStripePaymentIntent(
  paymentIntentId: string,
  expectedAmountEur: number,
): Promise<boolean> {
  if (!STRIPE_ENABLED) return false
  try {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId)
    const expectedCents = Math.round(expectedAmountEur * 100)
    return intent.status === 'succeeded' && intent.amount >= expectedCents
  } catch {
    return false
  }
}

/**
 * Addebito carta al POS con separazione fiscale mance.
 * Il terminale riceve `taxableAmount` per l'imposta e `tipAmount` come voce esente.
 */
export async function chargePosCard(
  input: number | PosChargeBreakdown,
  metadata: Record<string, string>,
  stripePaymentIntentId?: string,
): Promise<PosChargeResult> {
  const breakdown = normalizeBreakdown(input)

  if (breakdown.totalCustomerAmount <= 0) {
    return simulatePosTerminal(breakdown)
  }

  const enrichedMeta: Record<string, string> = {
    ...metadata,
    taxable_amount: String(breakdown.taxableAmount),
    tip_amount: String(breakdown.tipAmount),
    tip_tax_exempt: 'true',
    ...(breakdown.taxRegion ? { tax_region: breakdown.taxRegion } : {}),
  }

  if (stripePaymentIntentId && STRIPE_ENABLED) {
    const ok = await verifyStripePaymentIntent(
      stripePaymentIntentId,
      breakdown.totalCustomerAmount,
    )
    if (ok) {
      return {
        success: true,
        transactionId: stripePaymentIntentId,
        terminalId: 'STRIPE-POS',
        provider: 'stripe',
        stripePaymentIntentId,
        breakdown,
      }
    }
    throw new Error('STRIPE_PAYMENT_FAILED')
  }

  if (process.env.POS_USE_SIMULATION === 'false') {
    throw new Error('STRIPE_PAYMENT_INTENT_REQUIRED')
  }

  void enrichedMeta
  return simulatePosTerminal(breakdown)
}
