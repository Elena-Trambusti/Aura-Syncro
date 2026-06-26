import { Link } from 'react-router-dom'

export default function PrivacyPage() {
  return (
    <div className="aura-auth-shell min-h-screen px-4 py-16">
      <div className="premium-card mx-auto max-w-4xl space-y-8 p-8 sm:p-12">
        
        <div className="border-b border-white/10 pb-6">
          <p className="aura-brand-eyebrow mb-2">Aura Syncro</p>
          <h1 className="text-3xl font-display font-medium text-white mb-4">Informativa sulla Privacy (Privacy Policy)</h1>
          <p className="text-sm text-fumo">Ultimo aggiornamento: Giugno 2026</p>
        </div>

        <div className="space-y-8 text-sm text-slate-300 leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-aura-gold">1. Titolare del Trattamento</h2>
            <p>Ai sensi del Regolamento (UE) 2016/679 (GDPR), il Titolare del Trattamento dei dati dei Ristoratori (Clienti diretti) è ELENA TRAMBUSTI, P.IVA 02101860498. Per qualsiasi comunicazione o richiesta di esercizio dei diritti, è possibile contattare l'indirizzo email: <a href="mailto:elenatrambusti2024@gmail.com" className="text-aura-gold hover:underline">elenatrambusti2024@gmail.com</a>.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-aura-gold">2. Dati Trattati e Finalità</h2>
            <p><strong>Dati del Ristorante (B2B):</strong> Raccogliamo dati identificativi, di fatturazione e di contatto (email, partita IVA, ragione sociale) necessari per l'attivazione del Servizio SaaS, la fatturazione degli abbonamenti e l'assistenza tecnica.</p>
            <p><strong>Dati dei Clienti Finali (Diners):</strong> Aura Syncro agisce esclusivamente come <strong>Responsabile del Trattamento</strong> (Data Processor) per i dati inseriti dal Ristoratore nel gestionale (es. nomi per le prenotazioni, preferenze ordini). Il Titolare di tali dati rimane il Ristorante stesso.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-aura-gold">3. Basi Giuridiche</h2>
            <p>I dati dei ristoratori vengono trattati principalmente per l'esecuzione di misure precontrattuali e per l'esecuzione del contratto di fornitura del software (Art. 6, lett. b, GDPR), nonché per adempiere a obblighi legali e fiscali (Art. 6, lett. c, GDPR).</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-aura-gold">4. Conservazione dei Dati</h2>
            <p>I dati amministrativi e contabili sono conservati per 10 anni in ottemperanza alla legge italiana. I dati operativi del ristorante (comande, prenotazioni) verranno mantenuti attivi per tutta la durata dell'abbonamento e cancellati o anonimizzati entro 30 giorni dalla cessazione del servizio.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-aura-gold">5. Condivisione con Terze Parti</h2>
            <p>Aura Syncro si avvale di partner tecnologici rigorosamente selezionati per erogare il servizio in sicurezza:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li><strong>Infrastruttura Cloud:</strong> Vercel / Render / AWS (hosting dei server in Europa).</li>
              <li><strong>Pagamenti:</strong> Stripe (gestione transazioni sicure, Aura Syncro non memorizza numeri di carta di credito).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-aura-gold">6. Diritti dell'Interessato</h2>
            <p>In ogni momento, l'interessato ha il diritto di chiedere ad Aura Syncro l'accesso ai propri dati personali, la rettifica, la cancellazione degli stessi (Diritto all'oblio), la limitazione del trattamento o di opporsi al loro trattamento, oltre al diritto alla portabilità dei dati. Tali diritti possono essere esercitati inviando una mail al Titolare del Trattamento.</p>
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
