import { Link } from 'react-router-dom'

export default function CookiePage() {
  return (
    <div className="aura-auth-shell min-h-screen px-4 py-16">
      <div className="premium-card mx-auto max-w-4xl space-y-8 p-8 sm:p-12">
        
        <div className="border-b border-white/10 pb-6">
          <p className="aura-brand-eyebrow mb-2">Aura Syncro</p>
          <h1 className="text-3xl font-display font-medium text-white mb-4">Cookie Policy</h1>
          <p className="text-sm text-fumo">Ultimo aggiornamento: Giugno 2026</p>
        </div>

        <div className="space-y-8 text-sm text-slate-300 leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-aura-gold">1. Cosa sono i Cookie</h2>
            <p>I cookie sono piccoli file di testo che i siti visitati inviano al terminale dell'utente, dove vengono memorizzati, per poi essere ritrasmessi agli stessi siti alla visita successiva. Aura Syncro utilizza i cookie per garantire il corretto funzionamento della piattaforma SaaS.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-aura-gold">2. Cookie Tecnici e Strettamente Necessari</h2>
            <p>La nostra piattaforma utilizza cookie di prima parte strettamente necessari per il funzionamento del servizio. Questi non richiedono il consenso preventivo dell'utente:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li><strong>Sessione e Autenticazione:</strong> Cookie essenziali per mantenere l'utente loggato nel pannello gestionale (Token JWT e Session ID).</li>
              <li><strong>Sicurezza:</strong> Cookie utilizzati per prevenire attacchi CSRF e garantire l'integrità delle richieste.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-aura-gold">3. Cookie di Terze Parti</h2>
            <p>Per fornire il servizio ci avvaliamo di alcuni partner tecnologici che potrebbero installare propri cookie:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li><strong>Stripe:</strong> Cookie necessari per la prevenzione delle frodi e l'elaborazione sicura dei pagamenti (obbligatori per la fatturazione).</li>
            </ul>
            <p>Attualmente, per garantire la massima privacy, Aura Syncro <strong>NON utilizza cookie di profilazione o tracciamento pubblicitario</strong> (es. Facebook Pixel o Google Ads) sul gestionale B2B.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-aura-gold">4. Gestione dei Cookie</h2>
            <p>Puoi gestire le preferenze sui cookie direttamente dalle impostazioni del tuo browser. Tuttavia, disabilitare i cookie tecnici impedirà l'accesso e l'utilizzo del gestionale Aura Syncro.</p>
          </section>

        </div>

        <div className="pt-8 border-t border-white/10 text-center">
          <Link to="/" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-black/40 backdrop-blur-xl px-6 py-3 text-xs uppercase tracking-[0.15em] font-bold text-white transition-all duration-300 hover:bg-white/10 hover:border-aura-gold/50">
            Torna alla Home
          </Link>
        </div>

      </div>
    </div>
  )
}
