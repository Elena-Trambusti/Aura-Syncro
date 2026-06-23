import { Link } from 'react-router-dom'

export default function PrivacyPage() {
  return (
    <div className="aura-auth-shell min-h-screen px-4 py-10">
      <div className="premium-card mx-auto max-w-3xl space-y-4 p-6 sm:p-8">
        <p className="aura-brand-eyebrow">Aura Syncro</p>
        <h1 className="aura-page-title">Privacy Policy</h1>
        <p className="text-fumo">Aura Syncro tratta i dati dei clienti e del ristorante esclusivamente per erogare il servizio SaaS.</p>
        <p className="text-fumo">I dati sono conservati su infrastruttura cloud sicura e accessibili solo a personale autorizzato.</p>
        <p className="text-fumo">
          Per richieste su dati personali:{' '}
          <a className="text-aura-gold underline hover:text-aura-gold-light" href="mailto:aurasyncro@gmail.com">
            aurasyncro@gmail.com
          </a>
          .
        </p>
        <Link to="/prezzi" className="aura-btn-ghost inline-block">Torna ai prezzi</Link>
      </div>
    </div>
  )
}
