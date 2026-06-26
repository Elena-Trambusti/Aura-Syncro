import { Link } from 'react-router-dom'

export default function TermsPage() {
  return (
    <div className="aura-auth-shell min-h-screen px-4 py-16">
      <div className="premium-card mx-auto max-w-4xl space-y-8 p-8 sm:p-12">
        
        <div className="border-b border-white/10 pb-6">
          <p className="aura-brand-eyebrow mb-2">Aura Syncro</p>
          <h1 className="text-3xl font-display font-medium text-white mb-4">Termini e Condizioni di Servizio (B2B)</h1>
          <p className="text-sm text-fumo">Ultimo aggiornamento: Giugno 2026</p>
        </div>

        <div className="space-y-8 text-sm text-slate-300 leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-aura-gold">1. Oggetto del Servizio</h2>
            <p>Le presenti Condizioni Generali di Contratto disciplinano la fornitura del software in cloud "Aura Syncro" (di seguito, il "Servizio" o "Software") erogato in modalità SaaS (Software as a Service) da ELENA TRAMBUSTI, P.IVA 02101860498 (di seguito, "Aura Syncro" o "Fornitore").</p>
            <p>Aura Syncro è un gestionale premium per la ristorazione che include, a titolo esemplificativo, funzionalità di POS, menu QR digitale, gestione tavoli e comande.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-aura-gold">2. Natura B2B del Servizio</h2>
            <p>Il Servizio è destinato esclusivamente ad un'utenza professionale e aziendale (B2B). Iscrivendosi e utilizzando il Servizio, il Cliente dichiara di agire per scopi inerenti alla propria attività imprenditoriale, commerciale o professionale. Pertanto, <strong>non trovano applicazione le tutele previste per i consumatori</strong> (ad es. il diritto di recesso entro 14 giorni ex Codice del Consumo).</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-aura-gold">3. Attivazione, Abbonamento e Setup</h2>
            <p>L'accesso al Servizio è subordinato al pagamento di un costo di <strong>Setup Iniziale</strong> (una tantum) e di un <strong>Canone Mensile</strong> in abbonamento, i cui importi sono dettagliati nella pagina Prezzi.</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li><strong>Setup Iniziale:</strong> Copre l'onboarding concierge, la configurazione iniziale della mappa tavoli, l'inserimento del menu e la formazione. Tale importo non è in alcun caso rimborsabile.</li>
              <li><strong>Canone Mensile:</strong> Fatturato anticipatamente tramite carta di credito o addebito SEPA. In caso di mancato pagamento, il Fornitore si riserva il diritto di sospendere l'accesso all'account dopo 7 giorni di preavviso.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-aura-gold">4. Esclusione di Responsabilità (SLA e Dati Fiscali)</h2>
            <p>Aura Syncro si impegna a mantenere l'infrastruttura cloud operativa garantendo un'elevata disponibilità (Best Effort SLA). Tuttavia, il Fornitore non sarà ritenuto responsabile per interruzioni del servizio dovute a cause di forza maggiore, disservizi dei provider cloud (es. AWS, Vercel) o malfunzionamenti hardware locali del Cliente.</p>
            <p><strong>Dati Fiscali e Corrispettivi:</strong> Aura Syncro fornisce strumenti di calcolo e resoconto, ma <strong>NON sostituisce un registratore telematico di cassa</strong> laddove richiesto dalla legge italiana. Il Cliente rimane l'unico e insindacabile responsabile della corretta emissione degli scontrini, dell'invio dei corrispettivi telematici all'Agenzia delle Entrate e della corretta configurazione delle aliquote IVA sui prodotti.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-aura-gold">5. Licenza d'Uso e Proprietà Intellettuale</h2>
            <p>Il Software, il codice sorgente, le interfacce, i marchi e tutti i diritti di proprietà intellettuale sono e rimangono di esclusiva proprietà di Aura Syncro. Viene concessa al Cliente una licenza d'uso limitata, non esclusiva, non trasferibile e revocabile per la durata dell'abbonamento. È severamente vietato effettuare reverse engineering, copiare, rivendere o sub-licenziare il Software.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-aura-gold">6. Risoluzione e Cancellazione</h2>
            <p>Il Cliente può disdire l'abbonamento in qualsiasi momento direttamente dal pannello di controllo. La cancellazione fermerà i rinnovi futuri, ma non darà diritto a rimborsi per la frazione di mese già pagata. Alla scadenza dell'abbonamento, i dati del ristorante verranno conservati per 30 giorni, dopodiché potranno essere eliminati definitivamente.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-aura-gold">7. Foro Competente</h2>
            <p>Per qualsiasi controversia relativa all'interpretazione o all'esecuzione dei presenti Termini, la giurisdizione sarà esclusivamente italiana e il Foro competente sarà quello del luogo di sede legale del Fornitore, salvo differenti disposizioni inderogabili di legge.</p>
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
