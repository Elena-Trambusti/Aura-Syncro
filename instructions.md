1. Identità del progetto
Campo	Valore
Nome
Aura Syncro (aura-syncro)
Tipo
Monorepo SaaS full-stack per gestione ristoranti
Target
Ristoranti medio-alta fascia (50+ coperti), multi-tenant
Posizionamento
Premium: €500 setup + €199/mese
Proprietario
Elena Trambusti — software proprietario (vedi LICENSE, COPYRIGHT)
Repo GitHub
Elena-Trambusti/aura-syncro
Produzione
Frontend: aurasyncro.com (Vercel) · Backend: DigitalOcean App Platform (fra region)
2. Linguaggi e formati file
Linguaggio / formato	Dove	Note
TypeScript
Frontend + Backend (100% logica applicativa)
Lingua principale
TSX/JSX
frontend/src/**/*.tsx
Componenti React
SQL
backend/prisma/migrations/**/*.sql
Migrazioni Prisma (non modificare a mano se non necessario)
Prisma Schema
backend/prisma/schema.prisma
Modello dati + enum
JSON
i18n (frontend/src/i18n/locales/*.json), manifest PWA
Traduzioni UI
CSS
frontend/src/index.css
Tailwind v4 con @theme custom
PowerShell
avvia-app.ps1
Avvio dev su Windows
JavaScript (ESM)
frontend/scripts/*.mjs
Script build (icone PWA, migrazioni tema)
YAML
.do/app.yaml
Spec deploy DigitalOcean
Markdown
README.md, backend/docs/
Documentazione
Non usare: Python, Java, PHP, Angular, Next.js, Redux, CSS-in-JS (styled-components), glassmorphism.

3. Struttura monorepo
progetto per App Ristorante/
├── package.json              # Root: script orchestrazione monorepo
├── avvia-app.ps1             # Dev locale Windows (backend :3001 + frontend :5173)
├── vercel.json               # Deploy frontend Vercel
├── .do/app.yaml              # Deploy backend DigitalOcean
├── .cursorrules              # Regole sviluppo OBBLIGATORIE
├── README.md
├── backend/
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/       # 15+ migrazioni SQL
│   ├── scripts/              # Utility CLI (seed, stripe, test-flow)
│   └── src/
│       ├── index.ts          # Entry Express + Socket.IO
│       ├── routes/           # 22 router API
│       ├── middleware/       # auth, RBAC, rate limit, plan tier
│       ├── lib/              # Business logic (tax, fiscal, stripe, AI…)
│       ├── socket/handlers.ts
│       ├── config/fiscal.ts
│       └── seed.ts / seed-tenant.ts
└── frontend/
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json / tsconfig.app.json
    ├── eslint.config.js
    ├── scripts/              # generate-pwa-icons.mjs
    └── src/
        ├── main.tsx          # Entry React
        ├── App.tsx           # Router
        ├── instrument.ts     # Sentry (importato per primo)
        ├── sw.ts             # Service Worker PWA (injectManifest)
        ├── i18n/             # it, en, es, fr, de
        ├── contexts/         # AuthContext
        ├── pages/            # 35 pagine
        ├── components/       # 55+ componenti
        ├── hooks/            # 10 custom hooks
        ├── lib/              # API client, fiscal, socket, offline sync
        └── pwa/              # Manifest PWA
4. Runtime e versioni richieste
Componente	Versione
Node.js
>= 20 (README indica 24 in produzione)
TypeScript frontend
~6.0.2
TypeScript backend
^5.8.3
React
^19.2.4
Vite
^8.0.4
Prisma
^6.6.0
PostgreSQL
Via Supabase (con DATABASE_URL + DIRECT_URL)
Porte dev:

Frontend: 5173 (proxy /api e /socket.io → localhost:3001)
Backend: 3001
Credenziali demo locali (da avvia-app.ps1): admin@demo.it / admin123

5. Stack architetturale
┌─────────────────────────────────────────────────────────┐
│  Vercel — React 19 + Vite + Tailwind 4 + PWA           │
│  axios → API REST  |  socket.io-client → real-time      │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS / WSS
┌────────────────────────▼────────────────────────────────┐
│  DigitalOcean — Express 4 + Socket.IO 4                 │
│  JWT auth | Zod validation | Prisma ORM                 │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│  Supabase PostgreSQL (pgBouncer + direct URL)           │
└─────────────────────────────────────────────────────────┘
Integrazioni esterne: Stripe, Nodemailer (SMTP), Web Push (VAPID),
Aruba Fiduciary + FatturaPA (opzionale), Sentry
6. Librerie FRONTEND — dipendenze complete
Produzione (dependencies)
Libreria	Versione	Scopo
react / react-dom
^19.2.4
UI framework
react-router-dom
^7.14.0
Routing SPA
@tanstack/react-query
^5.99.0
Cache server state, invalidazione real-time
axios
^1.15.0
HTTP client verso API (lib/api.ts)
i18next + react-i18next
^26 / ^17
Internazionalizzazione (5 lingue UI)
tailwindcss (via @tailwindcss/vite)
^4.2.2
Styling utility-first
clsx + tailwind-merge
—
Classi CSS condizionali (lib/utils.ts, lib/ui.ts)
lucide-react
^1.8.0
Icone (logo = Zap/fulmine)
@radix-ui/react-*
varie
Dialog, Dropdown, Select, Tabs, Tooltip (accessibilità)
recharts
^3.8.1
Grafici analytics
date-fns
^4.1.0
Date/formatting
jspdf + jspdf-autotable
^4 / ^5
Export PDF report fiscali
qrcode.react
^4.2.0
QR menu pubblico
react-hot-toast
^2.6.0
Notifiche toast
socket.io-client
^4.8.3
Real-time (tavoli, ordini, cucina)
@sentry/react
^10.60.0
Error tracking (tunnel via backend in prod)
vite-plugin-pwa + workbox-*
^1.3 / ^7.4
PWA offline, service worker injectManifest
Sviluppo (devDependencies)
Libreria	Scopo
vite + @vitejs/plugin-react
Bundler e HMR
typescript + typescript-eslint
Type checking e lint
eslint + eslint-plugin-react-hooks + eslint-plugin-react-refresh
Linting flat config
sharp
Generazione icone PWA (scripts/generate-pwa-icons.mjs)
@types/*
Tipi TypeScript
7. Librerie BACKEND — dipendenze complete
Produzione (dependencies)
Libreria	Versione	Scopo
express
^4.21.2
Server HTTP REST
@prisma/client
^6.6.0
ORM database
socket.io
^4.8.1
WebSocket real-time
jsonwebtoken + bcryptjs
—
Auth JWT + hash password
zod
^3.24.2
Validazione input API
cors
^2.8.5
CORS multi-origin
express-rate-limit
^8.5.2
Rate limiting globale
dotenv
^16.4.7
Env vars in dev
stripe
^22.0.1
Pagamenti, abbonamenti, webhook
nodemailer
^9.0.1
Email marketing/notifiche
multer
^1.4.5
Upload file
qrcode
^1.5.4
QR server-side
web-push
^3.6.7
Push notifications browser
Sviluppo (devDependencies)
Libreria	Scopo
prisma
CLI migrazioni e generate
tsx
Esecuzione TypeScript in dev e script
typescript
Compilazione → dist/ (CommonJS, target ES2022)
@types/*
Tipi per tutte le dipendenze
8. Database — modelli Prisma (28 modelli)
Provider: PostgreSQL (DATABASE_URL + DIRECT_URL)

Enum principali:

CountryCode: IT | ES
TaxRegion: IT_MAIN | ES_CANARIAS | ES_PENINSULA
FiscalRegion: ITALIA | SPAGNA_PENINSULA | ISOLE_CANARIE
PlanTier: BASE | PRO
PosIntegrationMode: PENDING_SETUP | SIMULATION | STRIPE_TERMINAL | EXTERNAL
Role: OWNER | MANAGER | WAITER | CHEF | BARTENDER | HOST
Altri: OrderStatus, PaymentMethod, CampaignType, SaasElectronicInvoiceStatus…
Modelli: Restaurant, RestaurantSettings, User, Table, MenuCategory, MenuItem, Order, OrderItem, Reservation, Customer, Shift, LoyaltyTier, LoyaltyTransaction, Campaign, MarketingAutomation, WaitlistEntry, InventoryItem, InventoryItemLink, Invoice, FiscalSequence, FiscalChainState, StripeWebhookEvent, SaasElectronicInvoice, PushSubscription, ApiIdempotencyRecord

Comandi DB (dalla root):

npm run db:push      # prisma db push
npm run db:migrate   # prisma migrate deploy
npm run db:generate  # prisma generate
npm run db:seed      # seed demo
npm run db:studio    # Prisma Studio
9. API Backend — route map
Prefisso	File	Auth	Note
/api/auth
auth.ts
Pubblico
Login, register, reset password
/api/public
public.ts
Pubblico
Menu QR, ordini guest, prenotazioni
/api/admin
admin.ts
Admin key
Onboarding concierge
/api/webhooks/stripe
webhooks/stripe.ts
Stripe signature
Body raw, prima di express.json()
/api/sentry-tunnel
sentryTunnel.ts
Pubblico
Tunnel Sentry frontend
/api/restaurant
restaurant.ts
JWT + dashboard
Settings tenant
/api/tables
tables.ts
JWT + dashboard
POS tavoli
/api/menu
menu.ts
JWT + dashboard
Menu e ricette
/api/orders
orders.ts
JWT + dashboard
Ordini
/api/reservations
reservations.ts
JWT + dashboard
Prenotazioni
/api/customers
customers.ts
JWT + Pro
CRM
/api/staff
staff.ts
JWT + dashboard
Personale e turni
/api/inventory
inventory.ts
JWT + dashboard
Magazzino
/api/analytics
analytics.ts
JWT + Pro
Analytics
/api/loyalty
loyalty.ts
JWT + Pro
Fedeltà
/api/marketing
marketing.ts
JWT + Pro
Campagne + automazioni
/api/reports
reports.ts
JWT + dashboard
Report (fiscale richiede Pro)
/api/waitlist
waitlist.ts
JWT + dashboard
Waitlist
/api/payments
payments.ts
Misto
Checkout pubblico + overview protetta
/api/checkout
checkout.ts
JWT
Stripe Checkout Premium
/api/ai
ai.ts
JWT + Pro
AI predittiva magazzino
/api/push
push.ts
JWT + dashboard
Web Push subscriptions
/api/health
inline
Pubblico
Health check DO
Middleware chain tipica: authenticate → requireDashboardAccess → requireProPlan (opzionale) → requirePermission('…')

Header custom: Authorization: Bearer <JWT>, X-Restaurant-Id, X-Admin-Key

10. Frontend — routing principale
Path	Pagina	Accesso
/
Landing
Pubblico
/login, /register
Auth
Pubblico (redirect se loggato)
/menu/:slug
Menu pubblico QR
Pubblico
/prenota/:slug
Prenotazione pubblica
Pubblico
/cucina
Kitchen Display (KDS)
JWT + orders.read
/dashboard
Dashboard
JWT + dashboard access
/dashboard/tavoli
POS tavoli
tables.read
/dashboard/ordini
Ordini
orders.read
/dashboard/menu
Menu
menu.read
/dashboard/crm
CRM
Pro plan
/dashboard/analytics
Analytics
Pro plan
/dashboard/report/fiscal
Report fiscale
Pro + ADMIN role
/dashboard/ai-predictive
AI magazzino
Pro plan
/dashboard/billing
Abbonamento Stripe
JWT
/dashboard/onboarding
Onboarding concierge
JWT
/platform-admin
Admin piattaforma
Chiave admin
Pattern UI: ProtectedRoute → DashboardAccessGate → RequirePermission / RequireProPlan / RequireRole

11. Pattern e convenzioni architetturali
Multi-tenant
Ogni richiesta autenticata porta X-Restaurant-Id (da localStorage)
Backend risolve tenant via backend/src/lib/tenant.ts
React Query keys tenant-scoped in frontend/src/lib/queryKeys.ts
Real-time
Socket.IO su backend (socket/handlers.ts)
Frontend: lib/socket.ts + hook useRealtimeInvalidation.ts
Eventi invalidano cache TanStack Query
Auth
JWT in localStorage (token)
AuthContext.tsx — unico context React
RBAC: lib/rbac.ts (frontend) + lib/permissions.ts (backend)
i18n — REGOLA CRITICA
5 lingue UI: it, en, es, fr, de — file in frontend/src/i18n/locales/
MAI testi hard-coded nelle UI: usare useTranslation() e chiavi JSON
Separazione lingua UI vs regime fiscale:
UI generica → lingua utente (LanguageSwitcher)
Terminologia fiscale (IVA/IGIC, PDF) → taxRegion del ristorante da AuthContext
Funzione: getFiscalIntlLocale() in i18n/index.ts
Fiscale multi-nazione — REGOLA CRITICA
Regime	Paese	Aliquota	Termine
IT_MAIN
Italia
IVA
P.IVA
ES_PENINSULA
Spagna penisola
IVA
NIF/CIF
ES_CANARIAS
Canarie
IGIC
NIF/CIF
Calcoli tax: SOLO via backend/src/lib/taxEngine.ts — mai * 0.1 inline
Strategie fiscali: backend/src/lib/fiscal/strategies/ (Italia, Spagna, Canarie)
PDF frontend: frontend/src/lib/fiscalPdf.ts, fiscalLabels.ts, fiscalRegime.ts
Report API: backend/src/routes/reports.ts
Piani SaaS
PlanTier.BASE / PlanTier.PRO
Middleware requireProPlan blocca CRM, AI, marketing, analytics, report fiscal
Dev unlock: PREMIUM_DEV_UNLOCK / PRO_PLAN_DEV_UNLOCK in .env backend
Design System (da .cursorrules)
Sidebar: bg-slate-900, testi text-slate-300
Area lavoro: bg-slate-50
Card/Modali: bg-white, border-slate-200, rounded-xl, shadow-sm
Accento brand: amber-500 / amber-600, logo Zap (fulmine)
NO glassmorphism, NO trasparenze che compromettono leggibilità
Mobile POS: layout a Tabs (Menu OR Carrello, mai affiancati)
12. Moduli chiave per area (mappa file)
Area	Backend	Frontend
Tax engine
lib/taxEngine.ts
lib/fiscalRegime.ts, lib/guestOrderTax.ts
Fatturazione
lib/fiscalInvoice.ts, lib/saasFatturaPaXml.ts
pages/ReportFiscal.tsx
Stripe
lib/stripe.ts, routes/webhooks/stripe.ts
pages/BillingPage.tsx, lib/stripeDashboard.ts
POS/Tavoli
routes/tables.ts, lib/transferTable.ts
pages/TablesPage.tsx, components/tables/
Ordini
routes/orders.ts, lib/orderTax.ts
pages/OrdersPage.tsx, components/orders/
AI predittiva
lib/predictiveEngine.ts, routes/ai.ts
hooks/usePredictiveAI.ts
Marketing
lib/marketingSend.ts, routes/marketing.ts
pages/MarketingPage.tsx
Offline sync (WIP)
—
lib/offlineQueue.ts, lib/offlineSync.ts, hooks/useOfflineSync.ts, components/OfflineSyncBanner.tsx
PWA
—
sw.ts, pwa/manifest, components/PwaRegistrar.tsx
Push
lib/webPush.ts, routes/push.ts
hooks/usePushNotifications.ts
13. Variabili ambiente essenziali
Frontend (frontend/.env)
VITE_API_URL=http://localhost:3001
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_SENTRY_DSN=https://...
Backend (backend/.env) — vedi backend/.env.example per lista completa
DATABASE_URL=postgresql://...?pgbouncer=true
DIRECT_URL=postgresql://...
JWT_SECRET=...
PORT=3001
FRONTEND_URL=http://localhost:5173,https://aurasyncro.com
STRIPE_SECRET_KEY / STRIPE_LIVE_SECRET_KEY
STRIPE_WEBHOOK_SECRET / STRIPE_LIVE_WEBHOOK_SECRET
STRIPE_PRICE_SETUP / STRIPE_PRICE_SUBSCRIPTION
VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY
ADMIN_API_KEY
SMTP_HOST / SMTP_USER / SMTP_PASS
ARUBA_FE_* (fatturazione elettronica, opzionale)
POS_USE_SIMULATION=true
PREMIUM_DEV_UNLOCK=false
PRO_PLAN_DEV_UNLOCK=false
14. Script npm disponibili
Root (package.json)
Script	Azione
npm run dev
Avvia tutto via PowerShell
npm run dev:backend
Solo backend
npm run dev:frontend
Solo frontend
npm run build
Build backend (include prisma generate + migrate deploy)
npm run start
Start backend produzione
npm run db:*
Comandi Prisma delegati al backend
Backend
Script	Azione
npm run dev
tsx watch src/index.ts
npm run build
prisma generate && prisma migrate deploy && tsc
npm test
Test nativi Node su moduli fiscali/AI/POS
npm run stripe:verify
Verifica config Stripe
npm run test:flow
Test end-to-end flow
Frontend
Script	Azione
npm run dev
Vite dev server :5173
npm run build
Genera icone PWA + tsc -b + vite build
npm run lint
ESLint flat config
15. Testing
Backend: test nativi Node (tsx --test) su:

taxEngine.test.ts
tipFiscal.test.ts
predictiveEngine.test.ts
fiscalInvoice.test.ts
menuStock.test.ts
posIntegration.test.ts
orderDiscount.test.ts
fiscal/strategies/fiscalStrategies.test.ts
fiscal/fiscalIntegrityChain.test.ts
Frontend: nessuna suite test configurata attualmente.

16. Deploy
Servizio	Piattaforma	Config
Frontend
Vercel
vercel.json — build frontend/, output frontend/dist, SPA rewrites
Backend
DigitalOcean App Platform
.do/app.yaml — region fra, porta 8080, health /api/health
Database
Supabase PostgreSQL
Connection pooling via DATABASE_URL
Build produzione backend: npm ci && npm run build (include migrazioni Prisma automatiche)

17. Errori comuni da EVITARE (checklist Antigravity)
❌ Non fare
Hard-codare testi UI — sempre i18n (t('chiave'))
Hard-codare aliquote IVA/IGIC (0.10, 0.21) nei componenti — usare taxEngine
Confondere lingua UI con regime fiscale — un ristorante spagnolo può avere UI in italiano
Modificare schema.prisma senza migrazione — usare prisma migrate dev
Aggiungere Redux/Zustand — stato server = React Query, auth = Context
Usare Next.js patterns — è una SPA Vite, non SSR
Glassmorphism / trasparenze nel design system
Layout mobile POS affiancato — usare tabs Menu/Carrello
Committare .env con segreti
Modificare webhook Stripe senza body raw — route speciale prima di express.json()
Ignorare RBAC — ogni nuova pagina deve avere RequirePermission appropriato
Aggiungere route backend senza middleware — verificare catena auth esistente
Usare CSS framework diversi — solo Tailwind v4
Modificare file non correlati al task — scope minimo dei diff
✅ Fare sempre
Leggere .cursorrules prima di ogni modifica
Verificare impatto IT vs ES vs Canarie per feature fiscali
Riutilizzare componenti UI esistenti (components/ui/, PremiumCard, KpiStatCard)
Usare api da lib/api.ts (non fetch grezzo)
Invalidare query con chiavi tenant-scoped dopo mutazioni
Aggiungere chiavi i18n in tutte e 5 le lingue (almeno it + en)
Rispettare TypeScript strict (frontend: noUnusedLocals, verbatimModuleSyntax)
Testare su mobile per pagine POS/tavoli
18. Work in progress (stato git attuale)
File non ancora committati relativi a offline sync:

frontend/src/lib/offlineQueue.ts
frontend/src/lib/offlineSync.ts
frontend/src/hooks/useOfflineSync.ts
frontend/src/components/OfflineSyncBanner.tsx
Modifiche a DashboardLayout.tsx, OrderModal.tsx, en.json, it.json
Pattern: coda locale + sync al ripristino connessione per ordini POS.

19. Riepilogo one-liner per Antigravity
Aura Syncro è un monorepo TypeScript con React 19 + Vite + Tailwind 4 (frontend su Vercel) e Express + Prisma + PostgreSQL + Socket.IO (backend su DigitalOcean). Multi-tenant SaaS ristoranti con fiscalità IT/ES/Canarie, i18n 5 lingue, pagamenti Stripe, RBAC granulare, piano Pro a €199/mese. Regole: no testi hard-coded, tax via taxEngine, design slate/amber senza glass, mobile POS con tabs, scope diff minimo.