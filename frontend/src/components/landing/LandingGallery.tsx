import { useTranslation } from 'react-i18next'
import { Receipt, Calculator, Banknote, ShieldAlert, FileWarning, Ship } from 'lucide-react'

export default function LandingGallery() {
  const { i18n } = useTranslation()
  const lang = i18n.language || 'it'

  // Definizione dei problemi specifici per nazione
  const marketData: Record<string, any> = {
    'it': {
      title: 'Risolviamo i veri problemi della Ristorazione Italiana',
      subtitle: 'Dimentica le sanzioni e la burocrazia infinita. Aura Syncro automatizza tutto, a norma di legge.',
      problems: [
        {
          icon: Receipt,
          title: 'Scontrini Telematici (RT) e Lotteria',
          desc: 'Integrazione diretta con i registratori telematici italiani (Custom, Epson) e Lotteria degli Scontrini automatica senza digitare nulla. Evita sanzioni per mancato invio.'
        },
        {
          icon: Calculator,
          title: 'Fatturazione Elettronica (SDI)',
          desc: 'Esportazione diretta in formato XML e interfacciamento automatico (Aruba/SDI) sia per B2B che B2C. Non dovrai più impazzire a fine mese col commercialista.'
        },
        {
          icon: Banknote,
          title: 'Mance Elettroniche Detassate',
          desc: 'Gestione automatica delle mance via POS fisico (nuova legge di bilancio) con separazione istantanea degli importi esenti IVA per il fisco.'
        }
      ]
    },
    'es': {
      title: 'Resolvemos los problemas reales de la Hostelería en España',
      subtitle: 'Olvídate de las sanciones de Hacienda. Aura Syncro automatiza tu cumplimiento fiscal y operativo.',
      problems: [
        {
          icon: ShieldAlert,
          title: 'Cumplimiento Veri*Factu',
          desc: 'Sistema certificado que envía automáticamente cada ticket a la Agencia Tributaria en tiempo real, garantizando la inmutabilidad de los datos y evitando multas masivas.'
        },
        {
          icon: FileWarning,
          title: 'Factura Simplificada y TicketBAI',
          desc: 'Generación legal de Facturas Simplificadas y adaptación a normativas regionales estrictas como TicketBAI en el País Vasco, todo sin esfuerzo.'
        },
        {
          icon: Banknote,
          title: 'Control Estricto de Arqueo',
          desc: 'Control exhaustivo de los cierres de caja (Arqueos) y gestión de propinas para cumplir con las inspecciones de la legislación laboral española.'
        }
      ]
    },
    'es-cn': {
      title: 'Soluciones diseñadas exclusivamente para Canarias',
      subtitle: 'No somos un software de la península adaptado a medias. Aura Syncro nació entendiendo el IGIC y el REF.',
      problems: [
        {
          icon: Calculator,
          title: 'Gestión Nativa del IGIC (7%)',
          desc: 'Motor fiscal adaptado 100% para Canarias. Todos los cálculos, tickets y reportes usan el IGIC de forma nativa, sin configuraciones raras ni IVA camuflado.'
        },
        {
          icon: FileWarning,
          title: 'Cumplimiento del REF Canario',
          desc: 'Totalmente adaptado al Régimen Económico y Fiscal de Canarias, simplificando la contabilidad para presentar los reportes a la Agencia Tributaria Canaria.'
        },
        {
          icon: Ship,
          title: 'Control de Stock Aduanero',
          desc: 'Gestión inteligente del inventario que tiene en cuenta los tiempos de importación desde la península (DUA) y los extracostes aduaneros (AIEM).'
        }
      ]
    }
  }

  const data = marketData[lang] || marketData['it']

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden bg-black/40 border-y border-white/5">
      {/* Sfondi e sfumature */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-aura-gold/20 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.03),transparent)] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center mb-16 relative z-10">
        <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight mb-4">
          {data.title}
        </h2>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          {data.subtitle}
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {data.problems.map((problem: any, index: number) => {
            const Icon = problem.icon
            return (
              <div 
                key={index} 
                className="group relative flex flex-col rounded-2xl bg-[#0B0E14] border border-white/5 overflow-hidden transition-all duration-300 hover:border-aura-gold/30 hover:shadow-[0_0_30px_rgba(212,175,55,0.1)]"
              >
                {/* Area Visiva Icona */}
                <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-black to-[#0B0E14] border-b border-white/5 flex items-center justify-center">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.1),transparent)] pointer-events-none transition-opacity duration-500 group-hover:opacity-100 opacity-50" />
                  
                  {/* Icona Grande Fluttuante */}
                  <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl bg-black/80 backdrop-blur-md border border-aura-gold/20 text-aura-gold shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-transform duration-500 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]">
                    <Icon className="w-10 h-10" strokeWidth={1.5} />
                  </div>
                </div>

                {/* Contenuto Testuale */}
                <div className="flex flex-col flex-1 p-6 sm:p-8">
                  <h3 className="text-xl font-display font-bold text-white mb-3 group-hover:text-aura-gold transition-colors">
                    {problem.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {problem.desc}
                  </p>
                </div>
                
                {/* Linea dorata in basso (rivelata in hover) */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-aura-gold to-transparent opacity-0 transform translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0" />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
