import { Router, Request, Response } from 'express'
import { stripe } from '../../lib/stripe'
import { handleCheckoutSessionCompleted } from '../../lib/stripeCheckoutWebhook'
import { syncRestaurantSubscriptionStatus } from '../../lib/stripeSubscriptionWebhook'
import { asyncHandler } from '../../lib/asyncHandler'

export const stripeWebhookRouter = Router()

/**
 * POST /api/webhooks/stripe
 * Notifiche Stripe: abbonamento SaaS, Pro, ordini guest e caparre.
 * Richiede body raw — vedi index.ts.
 */
stripeWebhookRouter.post('/', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!sig || typeof sig !== 'string') {
    res.status(400).json({ error: 'Header stripe-signature mancante' })
    return
  }

  if (!webhookSecret || webhookSecret.includes('inserisci')) {
    res.status(400).json({ error: 'STRIPE_WEBHOOK_SECRET non configurato' })
    return
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      sig,
      webhookSecret,
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Firma non valida'
    console.error('[stripe-webhook] Verifica firma fallita:', message)
    res.status(400).json({ error: 'Firma webhook non valida' })
    return
  }

  try {
    if (event.type === 'checkout.session.completed') {
      await handleCheckoutSessionCompleted(event.data.object)
    }

    if (
      event.type === 'customer.subscription.updated'
      || event.type === 'customer.subscription.deleted'
    ) {
      const subscription = event.data.object as { id: string; status: string; metadata?: Record<string, string> }
      const result = await syncRestaurantSubscriptionStatus(subscription)

      if (result) {
        console.info(
          '[stripe-webhook] Abbonamento sincronizzato',
          result.restaurantId,
          result.status,
          result.hasActiveSubscription ? 'attivo' : 'disattivato',
        )
      }
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object as { subscription?: string | { id: string } | null }
      const subId = typeof invoice.subscription === 'string'
        ? invoice.subscription
        : invoice.subscription?.id
      if (subId) {
        const subscription = await stripe.subscriptions.retrieve(subId)
        const result = await syncRestaurantSubscriptionStatus({
          id: subscription.id,
          status: subscription.status,
          metadata: subscription.metadata as Record<string, string>,
        })
        if (result) {
          console.warn(
            '[stripe-webhook] Pagamento abbonamento fallito',
            result.restaurantId,
            subscription.status,
          )
        }
      }
    }

    res.status(200).json({ received: true })
  } catch (err) {
    console.error('[stripe-webhook] Errore elaborazione evento:', err)
    res.status(500).json({ error: 'Errore interno webhook' })
  }
}))
