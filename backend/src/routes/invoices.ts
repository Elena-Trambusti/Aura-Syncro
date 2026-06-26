import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authenticate } from '../middleware/auth'
import { z } from 'zod'
import { generateB2BXml } from '../lib/b2bFatturaPaXml'
import { ArubaInvoiceService } from '../lib/arubaInvoiceService'

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
    taxRate: z.number()
  }))
})

router.post('/', (req: any, res: any, next: any) => authenticate(req, res, next), async (req: any, res: any) => {
  const { restaurantId } = req

  try {
    const data = invoiceSchema.parse(req.body)

    // Recupera settings
    const settings = await prisma.restaurantSettings.findUnique({
      where: { restaurantId }
    })

    if (!settings || !settings.legalName || !settings.taxId || !settings.legalAddress) {
      return res.status(400).json({ error: 'Dati fiscali ristorante incompleti' })
    }

    // Calcola sequence (thread-unsafe semplice per ora, si usa transazione in prod)
    const fiscalYear = new Date().getFullYear()
    const seqRecord = await prisma.fiscalSequence.upsert({
      where: { restaurantId_fiscalYear: { restaurantId, fiscalYear } },
      create: { restaurantId, fiscalYear, lastSequence: 1 },
      update: { lastSequence: { increment: 1 } }
    })

    const seq = seqRecord.lastSequence
    const docNumber = `${settings.invoicePrefix}-${fiscalYear}-${seq}`

    let total = 0
    const mappedItems = data.items.map(item => {
      const tp = item.quantity * item.unitPrice
      total += tp + (tp * item.taxRate / 100)
      return { ...item, totalPrice: tp }
    })

    const xml = generateB2BXml({
      documentNumber: docNumber,
      issuedAt: new Date(),
      issuerVat: settings.taxId,
      issuerLegalName: settings.legalName,
      issuerFiscalCode: settings.fiscalCode || undefined,
      issuerAddress: settings.legalAddress,
      issuerCity: 'Città', // Idealmente da settings
      issuerZip: '00000',
      issuerProvince: 'PR',
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

      items: mappedItems
    })

    // Invio ad Aruba
    const arubaRes = await ArubaInvoiceService.submit(xml)
    const statoSdi = arubaRes.success ? 'sent' : 'failed'

    // Salva su DB
    const invoice = await prisma.invoice.create({
      data: {
        restaurantId,
        orderId: data.orderId,
        documentNumber: docNumber,
        prefix: settings.invoicePrefix,
        fiscalYear,
        sequence: seq,
        clientePiva: data.clientePiva,
        clienteCodiceFiscale: data.clienteCodiceFiscale,
        clienteSdiCode: data.clienteSdiCode,
        clientePec: data.clientePec,
        clienteRagioneSociale: data.clienteRagioneSociale,
        clienteIndirizzo: data.clienteIndirizzo,
        importoTotale: total,
        statoSdi,
        xmlBlob: xml,
        arubaUploadId: arubaRes.uploadFileName
      }
    })

    res.json({ invoice, arubaResponse: arubaRes })
  } catch (error: any) {
    console.error('Invoice error:', error)
    res.status(400).json({ error: error.message || 'Errore generazione fattura' })
  }
})

router.get('/', (req: any, res: any, next: any) => authenticate(req, res, next), async (req: any, res: any) => {
  const { restaurantId } = req
  const invoices = await prisma.invoice.findMany({
    where: { restaurantId },
    orderBy: { issuedAt: 'desc' }
  })
  res.json(invoices)
})

export default router
