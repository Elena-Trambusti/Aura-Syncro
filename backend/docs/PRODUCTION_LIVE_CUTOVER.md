# Aura Syncro - Cutover Produzione Live (Stripe + Webhook + Aruba)

Questa guida isola in modo definitivo test vs live e descrive il primo pagamento live in sicurezza.

## 1) Variabili ambiente da configurare

### Vercel (frontend production)

Impostare queste ENV nel progetto frontend su Vercel (Environment: Production):

```env
VITE_API_URL=https://aura-syncro-s98ae.ondigitalocean.app
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_SENTRY_DSN=https://...
```

### Backend production (DigitalOcean o host API)

Impostare queste ENV nel servizio backend production:

```env
NODE_ENV=production

# Stripe live
STRIPE_LIVE_SECRET_KEY=sk_live_...
STRIPE_LIVE_WEBHOOK_SECRET=whsec_live_...
STRIPE_PRICE_SETUP=price_live_...
STRIPE_PRICE_SUBSCRIPTION=price_live_...

# Aruba Fatturazione Elettronica live
ARUBA_FE_ENABLED=true
ARUBA_FE_MOCK_UPLOAD=false
ARUBA_FE_AUTH_URL=https://auth.fatturazioneelettronica.aruba.it
ARUBA_FE_API_URL=https://ws.fatturazioneelettronica.aruba.it
ARUBA_FE_USERNAME=...
ARUBA_FE_PASSWORD=...
ARUBA_FE_DOMAIN=...
ARUBA_FE_CREDENTIAL=...

# Dati fiscali emittente (Aura Syncro)
ARUBA_FE_ISSUER_VAT=02101860498
ARUBA_FE_ISSUER_LEGAL_NAME=Elena Trambusti
ARUBA_FE_ISSUER_FISCAL_CODE=...
ARUBA_FE_ISSUER_STREET=...
ARUBA_FE_ISSUER_CITY=...
ARUBA_FE_ISSUER_ZIP=...
ARUBA_FE_ISSUER_PROVINCE=LI
ARUBA_FE_ISSUER_COUNTRY=IT
ARUBA_FE_ISSUER_EMAIL=...
```

## 2) Sicurezza webhook live

- Gli eventi `invoice.paid` e `invoice.payment_succeeded` vengono elaborati **solo** se `event.livemode === true`.
- Se `event.livemode === false`, il server logga l'evento come test e non invia nulla ad Aruba.

## 3) Isolamento dati test

- Se il profilo fiscale cliente contiene indicatori placeholder/test (`test`, `example.com`, `placeholder`, `IT12345678901`), l'invio Aruba viene bloccato.
- Nessuna fattura elettronica live viene inviata con dati cliente fittizi.

## 4) Alert operativi errori SDI

In produzione, se Aruba risponde con errori di validazione SDI/PEC/P.IVA, il backend emette un log strutturato:

- prefisso: `[ALERT][ARUBA_SDI_VALIDATION]`
- include `invoiceId`, `restaurantId`, `customerId`, `sdiRecipientCode`, `vatNumber`, `errorCode`, `errorMessage`
- azione indicata: intervento manuale immediato

## 5) Primo pagamento live - test sicuro

1. Verificare ENV live su backend (`NODE_ENV=production`, `ARUBA_FE_MOCK_UPLOAD=false`, endpoint Aruba live).
2. Verificare webhook Stripe live punta a:
   - `POST https://aura-syncro-s98ae.ondigitalocean.app/api/webhooks/stripe`
3. Creare un cliente reale con metadati fiscali completi in Stripe:
   - `legal_name`, `vat_number`, `sdi_code` (o `pec`), indirizzo completo.
4. Eseguire 1 pagamento live di piccolo importo.
5. Verificare log backend:
   - `[stripe-webhook] invoice.payment_succeeded elaborato`
   - `[stripe-invoice] Invio fattura elettronica`
   - `[aruba-fe] Fattura inviata`
6. Verificare record DB in `saasElectronicInvoice` con `status=sent`.
7. Verificare upload Aruba/SDI nel pannello Aruba FE.

Se compare `[ALERT][ARUBA_SDI_VALIDATION]`, non ritentare automaticamente: correggere anagrafica fiscale cliente e rieseguire manualmente.
