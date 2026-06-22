import type { Prisma } from '@prisma/client'

/** Formato: FATT-2026-001 */
export function formatInvoiceDocumentNumber(
  prefix: string,
  fiscalYear: number,
  sequence: number,
): string {
  const safePrefix = prefix.trim().toUpperCase() || 'FATT'
  return `${safePrefix}-${fiscalYear}-${String(sequence).padStart(3, '0')}`
}

export type AllocatedInvoiceNumber = {
  prefix: string
  fiscalYear: number
  sequence: number
  documentNumber: string
}

/**
 * Alloca il prossimo numero progressivo per ristorante/anno (atomico in transazione).
 */
export async function allocateInvoiceNumber(
  tx: Prisma.TransactionClient,
  restaurantId: string,
  issuedAt: Date,
): Promise<AllocatedInvoiceNumber> {
  const settings = await tx.restaurantSettings.findUnique({ where: { restaurantId } })
  const prefix = (settings?.invoicePrefix ?? 'FATT').trim().toUpperCase() || 'FATT'
  const fiscalYear = issuedAt.getFullYear()

  const row = await tx.fiscalSequence.upsert({
    where: { restaurantId_fiscalYear: { restaurantId, fiscalYear } },
    create: { restaurantId, fiscalYear, lastSequence: 1 },
    update: { lastSequence: { increment: 1 } },
  })

  const sequence = row.lastSequence
  return {
    prefix,
    fiscalYear,
    sequence,
    documentNumber: formatInvoiceDocumentNumber(prefix, fiscalYear, sequence),
  }
}

/** Crea fattura collegata all'ordine pagato (idempotente se già esiste). */
export async function issueInvoiceForOrder(
  tx: Prisma.TransactionClient,
  orderId: string,
  restaurantId: string,
  issuedAt: Date,
) {
  const existing = await tx.invoice.findUnique({ where: { orderId } })
  if (existing) return existing

  const allocated = await allocateInvoiceNumber(tx, restaurantId, issuedAt)
  return tx.invoice.create({
    data: {
      restaurantId,
      orderId,
      documentNumber: allocated.documentNumber,
      prefix: allocated.prefix,
      fiscalYear: allocated.fiscalYear,
      sequence: allocated.sequence,
      issuedAt,
    },
  })
}

/** Copia dati fiscali dal cliente CRM allo snapshot ordine (se presente). */
export async function snapshotOrderBillingFromCustomer(
  tx: Prisma.TransactionClient,
  orderId: string,
  customerId: string | null | undefined,
) {
  if (!customerId) return

  const customer = await tx.customer.findUnique({ where: { id: customerId } })
  if (!customer) return

  const hasBilling =
    customer.taxId ||
    customer.fiscalCode ||
    customer.sdiRecipientCode ||
    customer.pec ||
    customer.name

  if (!hasBilling) return

  await tx.order.update({
    where: { id: orderId },
    data: {
      billingLegalName: customer.name,
      billingTaxId: customer.taxId,
      billingFiscalCode: customer.fiscalCode,
      billingSdiCode: customer.sdiRecipientCode,
      billingPec: customer.pec,
    },
  })
}
