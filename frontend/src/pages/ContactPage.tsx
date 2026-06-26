import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone, Send } from 'lucide-react'

export default function ContactPage() {
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulazione invio
    setIsSent(true)
  }

  return (
    <div className="aura-auth-shell min-h-screen px-4 py-16">
      <div className="mx-auto max-w-5xl">
        
        <div className="text-center mb-12">
          <p className="aura-brand-eyebrow mb-2">Aura Syncro</p>
          <h1 className="text-4xl font-display font-medium text-white mb-4">Contattaci</h1>
          <p className="text-fumo max-w-xl mx-auto">
            Il nostro team di esperti è a tua disposizione per fornirti supporto tecnico, organizzare una demo su misura o assisterti nel setup del tuo ristorante.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Info Contatto */}
          <div className="lg:col-span-1 space-y-6">
            <div className="premium-card p-6 border-aura-gold/10">
              <div className="flex flex-col gap-6">
                
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-aura-gold/10 border border-aura-gold/20 flex items-center justify-center text-aura-gold">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Email Diretta</p>
                    <a href="mailto:elenatrambusti2024@gmail.com" className="text-sm text-slate-400 hover:text-aura-gold transition-colors mt-1 inline-block">
                      elenatrambusti2024@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-aura-gold/10 border border-aura-gold/20 flex items-center justify-center text-aura-gold">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Assistenza Concierge</p>
                    <p className="text-sm text-slate-400 mt-1">Disponibile per i clienti Premium H24</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-aura-gold/10 border border-aura-gold/20 flex items-center justify-center text-aura-gold">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Sede Operativa</p>
                    <p className="text-sm text-slate-400 mt-1">Italia, P.IVA 02101860498</p>
                  </div>
                </div>

              </div>
            </div>
            
            <div className="text-center pt-4">
              <Link to="/" className="text-sm text-fumo hover:text-white transition-colors underline">
                &larr; Torna alla Home
              </Link>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="premium-card p-8 sm:p-10">
              {isSent ? (
                <div className="text-center py-16 animate-reveal-blur">
                  <div className="mx-auto h-16 w-16 mb-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                    <Send className="h-6 w-6 ml-1" />
                  </div>
                  <h3 className="text-2xl font-display font-semibold text-white mb-2">Messaggio Ricevuto</h3>
                  <p className="text-slate-400 max-w-sm mx-auto">
                    Ti ringraziamo per averci contattato. Un nostro esperto ti risponderà entro 24 ore lavorative.
                  </p>
                  <button 
                    onClick={() => setIsSent(false)}
                    className="mt-8 text-sm text-aura-gold hover:underline"
                  >
                    Invia un altro messaggio
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-fumo mb-2">Nome e Cognome *</label>
                      <input type="text" required className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-aura-gold/50 focus:ring-1 focus:ring-aura-gold outline-none transition-all" placeholder="Es. Mario Rossi" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-fumo mb-2">Nome Ristorante</label>
                      <input type="text" className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-aura-gold/50 focus:ring-1 focus:ring-aura-gold outline-none transition-all" placeholder="Es. Osteria La Stella" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-fumo mb-2">Email *</label>
                    <input type="email" required className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-aura-gold/50 focus:ring-1 focus:ring-aura-gold outline-none transition-all" placeholder="tua@email.com" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-fumo mb-2">Messaggio *</label>
                    <textarea required rows={5} className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-aura-gold/50 focus:ring-1 focus:ring-aura-gold outline-none transition-all resize-none" placeholder="Come possiamo aiutarti?"></textarea>
                  </div>

                  <button type="submit" className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa8c2c] px-6 py-4 text-xs font-bold uppercase tracking-[0.15em] text-black shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(212,175,55,0.5)]">
                    Invia Richiesta <Send className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
