import { scorporoTaxFromGross, roundMoney } from './taxEngine'

export interface B2BInvoiceData {
  documentNumber: string
  issuedAt: Date
  
  // Ristorante (Cedente)
  issuerVat: string
  issuerLegalName: string
  issuerFiscalCode?: string
  issuerAddress: string
  issuerCity: string
  issuerZip: string
  issuerProvince: string
  issuerCountry: string
  
  // Cliente (Cessionario)
  clientVat?: string
  clientFiscalCode?: string
  clientLegalName: string
  clientAddress: string
  clientCity?: string
  clientZip?: string
  clientProvince?: string
  clientCountry: string
  clientSdiCode?: string
  clientPec?: string
  
  // Righe
  items: Array<{
    description: string
    quantity: number
    unitPrice: number
    taxRate: number
    totalPrice: number
    /** Lordo riga (menu IVA inclusa) — se assente, ricavato da totalPrice netto */
    grossTotal?: number
  }>
}

export function generateB2BXml(data: B2BInvoiceData): string {
  const d = data.issuedAt
  const xmlDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const sdiCode = data.clientSdiCode || '0000000'
  
  // Calcolo riepilogo per aliquota IVA
  const summaryByTaxRate: Record<string, { net: number, tax: number }> = {}
  let totalNet = 0
  let totalTax = 0
  
  for (const item of data.items) {
    const rateStr = item.taxRate.toFixed(2)
    if (!summaryByTaxRate[rateStr]) {
      summaryByTaxRate[rateStr] = { net: 0, tax: 0 }
    }
    const gross = item.grossTotal != null
      ? item.grossTotal
      : roundMoney(item.quantity * (item.unitPrice * (1 + item.taxRate / 100)))
    const part = scorporoTaxFromGross(gross, item.taxRate)
    summaryByTaxRate[rateStr].net = roundMoney(summaryByTaxRate[rateStr].net + part.subtotal)
    summaryByTaxRate[rateStr].tax = roundMoney(summaryByTaxRate[rateStr].tax + part.tax)

    totalNet = roundMoney(totalNet + part.subtotal)
    totalTax = roundMoney(totalTax + part.tax)
  }

  // Costruzione delle righe DettaglioLinee
  const detailLines = data.items.map((item, index) => `
      <DettaglioLinee>
        <NumeroLinea>${index + 1}</NumeroLinea>
        <Descrizione>${escapeXml(item.description)}</Descrizione>
        <Quantita>${item.quantity.toFixed(2)}</Quantita>
        <PrezzoUnitario>${item.unitPrice.toFixed(2)}</PrezzoUnitario>
        <PrezzoTotale>${item.totalPrice.toFixed(2)}</PrezzoTotale>
        <AliquotaIVA>${item.taxRate.toFixed(2)}</AliquotaIVA>
      </DettaglioLinee>`).join('')

  // Dati di Riepilogo
  const riepilogoLines = Object.entries(summaryByTaxRate).map(([rate, vals]) => `
      <DatiRiepilogo>
        <AliquotaIVA>${rate}</AliquotaIVA>
        <ImponibileImporto>${vals.net.toFixed(2)}</ImponibileImporto>
        <Imposta>${vals.tax.toFixed(2)}</Imposta>
        <EsigibilitaIVA>I</EsigibilitaIVA>
      </DatiRiepilogo>`).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<p:FatturaElettronica versione="FPR12" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:p="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <FatturaElettronicaHeader>
    <DatiTrasmissione>
      <IdTrasmittente>
        <IdPaese>IT</IdPaese>
        <IdCodice>${escapeXml(data.issuerVat)}</IdCodice>
      </IdTrasmittente>
      <ProgressivoInvio>${escapeXml(data.documentNumber)}</ProgressivoInvio>
      <FormatoTrasmissione>FPR12</FormatoTrasmissione>
      <CodiceDestinatario>${escapeXml(sdiCode)}</CodiceDestinatario>
      ${data.clientPec && sdiCode === '0000000' ? `<PECDestinatario>${escapeXml(data.clientPec)}</PECDestinatario>` : ''}
    </DatiTrasmissione>
    <CedentePrestatore>
      <DatiAnagrafici>
        <IdFiscaleIVA>
          <IdPaese>${escapeXml(data.issuerCountry)}</IdPaese>
          <IdCodice>${escapeXml(data.issuerVat)}</IdCodice>
        </IdFiscaleIVA>
        ${data.issuerFiscalCode ? `<CodiceFiscale>${escapeXml(data.issuerFiscalCode)}</CodiceFiscale>` : ''}
        <Anagrafica>
          <Denominazione>${escapeXml(data.issuerLegalName)}</Denominazione>
        </Anagrafica>
        <RegimeFiscale>RF01</RegimeFiscale>
      </DatiAnagrafici>
      <Sede>
        <Indirizzo>${escapeXml(data.issuerAddress)}</Indirizzo>
        <CAP>${escapeXml(data.issuerZip)}</CAP>
        <Comune>${escapeXml(data.issuerCity)}</Comune>
        <Provincia>${escapeXml(data.issuerProvince)}</Provincia>
        <Nazione>${escapeXml(data.issuerCountry)}</Nazione>
      </Sede>
    </CedentePrestatore>
    <CessionarioCommittente>
      <DatiAnagrafici>
        ${data.clientVat ? `
        <IdFiscaleIVA>
          <IdPaese>${escapeXml(data.clientCountry)}</IdPaese>
          <IdCodice>${escapeXml(data.clientVat)}</IdCodice>
        </IdFiscaleIVA>` : ''}
        ${data.clientFiscalCode ? `<CodiceFiscale>${escapeXml(data.clientFiscalCode)}</CodiceFiscale>` : ''}
        <Anagrafica>
          <Denominazione>${escapeXml(data.clientLegalName)}</Denominazione>
        </Anagrafica>
      </DatiAnagrafici>
      <Sede>
        <Indirizzo>${escapeXml(data.clientAddress)}</Indirizzo>
        ${data.clientZip ? `<CAP>${escapeXml(data.clientZip)}</CAP>` : ''}
        ${data.clientCity ? `<Comune>${escapeXml(data.clientCity)}</Comune>` : ''}
        ${data.clientProvince ? `<Provincia>${escapeXml(data.clientProvince)}</Provincia>` : ''}
        <Nazione>${escapeXml(data.clientCountry)}</Nazione>
      </Sede>
    </CessionarioCommittente>
  </FatturaElettronicaHeader>
  <FatturaElettronicaBody>
    <DatiGenerali>
      <DatiGeneraliDocumento>
        <TipoDocumento>TD24</TipoDocumento>
        <Divisa>EUR</Divisa>
        <Data>${xmlDate}</Data>
        <Numero>${escapeXml(data.documentNumber)}</Numero>
        <ImportoTotaleDocumento>${(totalNet + totalTax).toFixed(2)}</ImportoTotaleDocumento>
      </DatiGeneraliDocumento>
    </DatiGenerali>
    <DatiBeniServizi>
${detailLines}
${riepilogoLines}
    </DatiBeniServizi>
    <DatiPagamento>
      <CondizioniPagamento>TP02</CondizioniPagamento>
      <DettaglioPagamento>
        <ModalitaPagamento>MP01</ModalitaPagamento>
        <ImportoPagamento>${(totalNet + totalTax).toFixed(2)}</ImportoPagamento>
      </DettaglioPagamento>
    </DatiPagamento>
  </FatturaElettronicaBody>
</p:FatturaElettronica>
`
  return xml
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;'
      case '>': return '&gt;'
      case '&': return '&amp;'
      case "'": return '&apos;'
      case '"': return '&quot;'
      default: return c
    }
  })
}
