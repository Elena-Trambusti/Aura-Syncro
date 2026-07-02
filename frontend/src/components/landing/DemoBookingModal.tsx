import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { AuraDialog } from '@/components/ui/AuraDialog'

export default function DemoBookingModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [isLoaded, setIsLoaded] = useState(false)

  if (!isOpen) return null

  // Aggiunti i parametri per il Dark Mode (background_color=0A0A0A, text_color=F0E6D2)
  const CALENDLY_URL = "https://calendly.com/aurasyncro/30min?hide_landing_page_details=1&hide_gdpr_banner=1&background_color=0A0A0A&text_color=F0E6D2&primary_color=C5A059"

  return (
    <AuraDialog onClose={onClose} hideClose className="max-w-4xl w-full p-0 overflow-hidden bg-neutral-950 border border-[#C5A059]/30 h-[80vh] max-h-[700px] flex flex-col">
      <div className="relative flex-1 flex flex-col">
        {/* Pulsante di chiusura */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 text-neutral-400 hover:text-[#C5A059] transition-colors bg-black/60 rounded-full backdrop-blur-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Intestazione */}
        <div className="pt-6 pb-2 px-8 text-center bg-neutral-950 shrink-0">
          <h2 className="lux-heading font-display text-2xl font-medium tracking-tight text-[#C5A059]">
            Riserva una Demo Privata
          </h2>
          <p className="text-sm font-light text-[#F0E6D2] mt-1">
            Scegli il giorno e l'ora. Un nostro specialista ti contatterà per analizzare il tuo ristorante.
          </p>
        </div>

        {/* Contenitore Iframe con Loader */}
        <div className="relative flex-1 w-full bg-[#0A0A0A]">
          {!isLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0A0A0A]">
              <Loader2 className="w-8 h-8 animate-spin text-[#C5A059] mb-4" />
              <p className="text-[#F0E6D2] text-sm tracking-widest uppercase font-medium">Caricamento Calendario...</p>
            </div>
          )}
          <iframe
            src={CALENDLY_URL}
            width="100%"
            height="100%"
            frameBorder="0"
            className={`w-full h-full transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            title="Prenota una Demo"
            onLoad={() => setIsLoaded(true)}
          />
        </div>
      </div>
    </AuraDialog>
  )
}
