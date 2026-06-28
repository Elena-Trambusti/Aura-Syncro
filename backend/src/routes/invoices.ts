import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authenticate } from '../middleware/auth'
import { z } from 'zod'
import { generateB2BXml } from '../lib/b2bFatturaPaXml'
import { ArubaInvoiceService } from '../lib/arubaInvoiceService'
import { buildFiscalConfig, scorporoTaxFromGross, roundMoney } from '../lib/taxEngine'
import { allocateInvoiceNumber } from '../lib/fiscalInvoice'
import { getFiscalStrategyFromConfig } from '../lib/fiscal/strategies'

const router = Router()

const invoiceSchema = z.object({
  orderId: z.string().optional(),
  clientePiva: z.string().optional(),
  clienteCodiceFiscale: z.string().optional(),
  clienteRagioneSociale: z.string(),
  clienteIndirizzo: z.string(),
  clienteCity: z.string().optional(),
  clienteZip: z.string().optional(),
  clienteProvince: z.string().optional(),
  clienteCountry: z.string().default('IT'),
  clienteSdiCode: z.string().optional(),
  clientePec: z.string().optional(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number(),
    unitPrice: z.number(),
    taxRate: z.number(),
  })),
})

router.post('/', (req: any, res: any, next: any) => authenticate(req, res, next), async (req: any, res: any) => {
  const { restaurantId } = req

  try {
    const data = invoiceSchema.parse(req.body)

    const settings = await prisma.restaurantSettings.findUnique({
      where: { restaurantId },
    })

    if (!settings || !settings.legalName || !settings.taxId || !settings.legalAddress) {
      return res.status(400).json({ error: 'Dati fiscali ristorante incompleti' })
    }

    const fiscal = buildFiscalConfig(settings)
    if (fiscal.countryCode !== 'IT') {
      return res.status(400).json({ error: 'Fatturazione elettronica B2B disponibile solo per tenant Italia' })
    }

    const strategy = getFiscalStrategyFromConfig(fiscal)
    const b2bPrefix = strategy.resolveInvoicePrefix(settings.invoicePrefix)
    const issuedAt = new Date()

    let totalGross = 0
    const mappedItems = data.items.map(item => {
      const gross = roundMoney(item.quantity * item.unitPrice)
      const part = scorporoTaxFromGross(gross, item.taxRate)
      totalGross = roundMoney(totalGross + gross)
      const netUnit = item.quantity > 0 ? roundMoney(part.subtotal / item.quantity) : 0
      return {
        description: item.description,
        quantity: item.quantity,
        unitPrice: netUnit,
        taxRate: item.taxRate,
        totalPrice: part.subtotal,
        grossTotal: gross,
      }
    })

    const invoice = await prisma.$transaction(async tx => {
      const allocated = await allocateInvoiceNumber(tx, restaurantId, issuedAt, b2bPrefix)

      const xml = generateB2BXml({
        documentNumber: allocated.documentNumber,
        issuedAt,
        issuerVat: settings.taxId!,
        issuerLegalName: settings.legalName!,
        issuerFiscalCode: settings.fiscalCode || undefined,
        issuerAddress: settings.legalAddress!,
        issuerCity: 'N/D',
        issuerZip: '00000',
        issuerProvince: 'ND',
        issuerCountry: settings.countryCode,
        clientVat: data.clientePiva,
        clientFiscalCode: data.clienteCodiceFiscale,
        clientLegalName: data.clienteRagioneSociale,
        clientAddress: data.clienteIndirizzo,
        clientCity: data.clienteCity,
        clientZip: data.clienteZip,
        clientProvince: data.clienteProvince,
        clientCountry: data.clienteCountry,
        clientSdiCode: data.clienteSdiCode,
        clientPec: data.clientePec,
        items: mappedItems,
      })

      const arubaRes = await ArubaInvoiceService.submit(xml)
      const statoSdi = arubaRes.success ? 'sent' : 'failed'

      const created = await tx.invoice.create({
        data: {
          restaurantId,
          orderId: data.orderId,
          documentNumber: allocated.documentNumber,
          prefix: allocated.prefix,
          fiscalYear: allocated.fiscalYear,
          sequence: allocated.sequence,
          clientePiva: data.clientePiva,
          clienteCodiceFiscale: data.clienteCodiceFiscale,
          clienteSdiCode: data.clienteSdiCode,
          clientePec: data.clientePec,
          clienteRagioneSociale: data.clienteRagioneSociale,
          clienteIndirizzo: data.clienteIndirizzo,
          importoTotale: totalGross,
          statoSdi,
          xmlBlob: xml,
          arubaUploadId: arubaRes.uploadFileName,
        },
      })

      return { invoice: created, arubaResponse: arubaRes }
    })

    res.json(invoice)
  } catch (error: any) {
    console.error('Invoice error:', error)
    res.status(400).json({ error: error.message || 'Errore generazione fattura' })
  }
})

router.get('/', (req: any, res: any, next: any) => authenticate(req, res, next), async (req: any, res: any) => {
  const { restaurantId } = req
  const invoices = await prisma.invoice.findMany({
    where: {
      restaurantId,
      clienteRagioneSociale: { not: null },
    },
    orderBy: { issuedAt: 'desc' },
  })
  res.json(invoices)
})

export default router
