import { Link } from 'react-router-dom'

export default function DPAPage() {
  return (
    <div className="aura-auth-shell min-h-screen px-4 py-16">
      <div className="premium-card mx-auto max-w-4xl space-y-8 p-8 sm:p-12">
        
        <div className="border-b border-white/10 pb-6">
          <p className="aura-brand-eyebrow mb-2">Aura Syncro</p>
          <h1 className="text-3xl font-display font-medium text-white mb-4">Data Processing Agreement (DPA)</h1>
          <p className="text-sm text-fumo">Accordo per il Trattamento dei Dati Personali - Allegato ai Termini di Servizio</p>
        </div>

        <div className="space-y-8 text-sm text-slate-300 leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-aura-gold">1. Ruoli delle Parti</h2>
            <p>Il presente accordo regola il trattamento dei dati personali dei clienti finali (es. commensali) inseriti nel software Aura Syncro.</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li><strong>Titolare del Trattamento (Data Controller):</strong> Il Ristorante (Cliente B2B di Aura Syncro).</li>
              <li><strong>Responsabile del Trattamento (Data Processor):</strong> ELENA TRAMBUSTI (Aura Syncro).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-aura-gold">2. Oggetto e Natura del Trattamento</h2>
            <p>Aura Syncro tratta i dati personali <strong>esclusivamente per conto del Titolare</strong> e limitatamente allo scopo di fornire il Servizio Gestionale (gestione prenotazioni, ordini al tavolo, CRM clienti). I dati trattati includono: Nome, Cognome, recapiti telefonici/email, preferenze alimentari e storico ordini dei commensali.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-aura-gold">3. Obblighi del Responsabile (Aura Syncro)</h2>
            <p>Aura Syncro si impegna a:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>Trattare i dati solo secondo le istruzioni documentate del Ristorante.</li>
              <li>Garantire che le persone autorizzate al trattamento si siano impegnate alla riservatezza.</li>
              <li>Adottare tutte le misure tecniche e organizzative di sicurezza adeguate (crittografia in transito, backup sicuri, accessi loggati) ai sensi dell'Art. 32 del GDPR.</li>
              <li>Non utilizzare i dati dei commensali per finalità proprie, né per analisi incrociate, né per marketing diretto.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-aura-gold">4. Sub-Responsabili (Sub-Processors)</h2>
            <p>Il Titolare autorizza Aura Syncro ad avvalersi dei seguenti Sub-Responsabili tecnologici (es. servizi cloud). Aura Syncro assicura che tali sub-responsabili rispettino gli stessi obblighi in materia di protezione dei dati:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li><strong>Vercel / Render / Supabase:</strong> Hosting in cloud e database management (Regione EU).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-aura-gold">5. Cancellazione e Restituzione</h2>
            <p>Alla cessazione del contratto di fornitura del Servizio SaaS, Aura Syncro eliminerà o renderà anonimi tutti i dati personali elaborati per conto del Ristorante entro 30 giorni, fatto salvo l'obbligo di conservazione previsto per legge (es. registri di fatturazione diretti).</p>
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
