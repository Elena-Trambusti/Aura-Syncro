import { Link } from 'react-router-dom'

export default function TermsPage() {
  return (
    <div className="aura-auth-shell min-h-screen px-4 py-10">
      <div className="premium-card mx-auto max-w-3xl space-y-4 p-6 sm:p-8">
        <p className="aura-brand-eyebrow">Aura Syncro</p>
        <h1 className="aura-page-title">Termini di Servizio</h1>
        <p className="text-fumo">Aura Syncro è un software gestionale in abbonamento per ristoranti.</p>
        <p className="text-fumo">L&apos;attivazione prevede setup iniziale e canone mensile. Il servizio include supporto e onboarding concierge.</p>
        <p className="text-fumo">L&apos;utente è responsabile dei contenuti inseriti e del rispetto delle normative fiscali e privacy locali.</p>
        <Link to="/prezzi" className="aura-btn-ghost inline-block">Torna ai prezzi</Link>
      </div>
    </div>
  )
}
