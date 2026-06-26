import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, FileText, CheckCircle2, XCircle, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../lib/api'
import { formatCurrency } from '../lib/utils'
import ExecutivePageShell from '../components/layout/ExecutivePageShell'
import ExecutivePageHeader from '../components/layout/ExecutivePageHeader'

interface Invoice {
  id: string
  documentNumber: string
  clienteRagioneSociale: string
  clientePiva?: string
  importoTotale: number
  statoSdi: 'pending' | 'sent' | 'delivered' | 'rejected'
  issuedAt: string
}

export default function InvoicesPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)

  const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ['invoices'],
    queryFn: () => api.get('/invoices').then(r => r.data)
  })

  return (
    <ExecutivePageShell className="space-y-6">
      <ExecutivePageHeader
        title="Fatturazione Elettronica"
        subtitle="Gestione fatture B2B e invio allo SDI (Aruba)"
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl bg-aura-gold px-4 py-2 text-sm font-semibold text-navy hover:bg-aura-gold-light"
          >
            <Plus className="h-4 w-4" />
            Emetti Fattura
          </button>
        }
      />

      <div className="saas-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-black/20 text-fumo">
                <th className="px-4 py-3">Numero</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">P.IVA / CF</th>
                <th className="px-4 py-3">Importo</th>
                <th className="px-4 py-3">Stato SDI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr><td colSpan={6} className="p-8 text-center text-fumo">Caricamento...</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-fumo">Nessuna fattura emessa</td></tr>
              ) : invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-semibold text-pietra">{inv.documentNumber}</td>
                  <td className="px-4 py-3 text-fumo">{new Date(inv.issuedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-pietra">{inv.clienteRagioneSociale}</td>
                  <td className="px-4 py-3 text-fumo">{inv.clientePiva || '-'}</td>
                  <td className="px-4 py-3 font-bold text-aura-gold">{formatCurrency(inv.importoTotale)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={inv.statoSdi} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <InvoiceModal onClose={() => setShowModal(false)} onSaved={() => queryClient.invalidateQueries({ queryKey: ['invoices'] })} />}
    </ExecutivePageShell>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'delivered') return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400"><CheckCircle2 className="h-3 w-3" /> Consegnata</span>
  if (status === 'sent') return <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-400"><Clock className="h-3 w-3" /> Inviata a SDI</span>
  if (status === 'rejected') return <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-1 text-xs font-medium text-red-400"><XCircle className="h-3 w-3" /> Scartata</span>
  return <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-xs font-medium text-fumo"><FileText className="h-3 w-3" /> In attesa</span>
}

function InvoiceModal({ onClose, onSaved }: { onClose: () => void, onSaved: () => void }) {
  const [form, setForm] = useState({
    ragioneSociale: '', piva: '', sdi: '', pec: '', indirizzo: '', citta: '', cap: '', pr: ''
  })
  const [items, setItems] = useState([{ desc: '', qty: 1, price: 0, tax: 22 }])

  const create = useMutation({
    mutationFn: (data: any) => api.post('/invoices', data),
    onSuccess: () => {
      toast.success('Fattura inviata allo SDI!')
      onSaved()
      onClose()
    },
    onError: (e: any) => toast.error(e.response?.data?.error || 'Errore invio')
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    create.mutate({
      clienteRagioneSociale: form.ragioneSociale,
      clientePiva: form.piva,
      clienteSdiCode: form.sdi,
      clientePec: form.pec,
      clienteIndirizzo: form.indirizzo,
      clienteCity: form.citta,
      clienteZip: form.cap,
      clienteProvince: form.pr,
      items: items.map(i => ({ description: i.desc, quantity: i.qty, unitPrice: i.price, taxRate: i.tax }))
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="saas-card max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6">
        <h2 className="mb-4 text-xl font-bold text-pietra">Emetti Fattura Elettronica</h2>
        <form onSubmit={submit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-fumo">Ragione Sociale *</label>
              <input required className="glass-input w-full p-2" value={form.ragioneSociale} onChange={e => setForm({...form, ragioneSociale: e.target.value})} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-fumo">Partita IVA *</label>
              <input required className="glass-input w-full p-2" value={form.piva} onChange={e => setForm({...form, piva: e.target.value})} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-fumo">Codice SDI (7 char)</label>
              <input maxLength={7} className="glass-input w-full p-2" value={form.sdi} onChange={e => setForm({...form, sdi: e.target.value})} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-fumo">Indirizzo completo *</label>
              <input required className="glass-input w-full p-2" value={form.indirizzo} onChange={e => setForm({...form, indirizzo: e.target.value})} />
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-semibold text-pietra">Righe</h3>
            {items.map((it, idx) => (
              <div key={idx} className="mb-2 flex gap-2">
                <input required placeholder="Descrizione" className="glass-input flex-1 p-2" value={it.desc} onChange={e => { const n = [...items]; n[idx].desc = e.target.value; setItems(n) }} />
                <input type="number" required placeholder="Qta" className="glass-input w-20 p-2" value={it.qty} onChange={e => { const n = [...items]; n[idx].qty = Number(e.target.value); setItems(n) }} />
                <input type="number" required step="0.01" placeholder="Prezzo" className="glass-input w-24 p-2" value={it.price} onChange={e => { const n = [...items]; n[idx].price = Number(e.target.value); setItems(n) }} />
                <select className="glass-input w-24 p-2" value={it.tax} onChange={e => { const n = [...items]; n[idx].tax = Number(e.target.value); setItems(n) }}>
                  <option value={22}>22%</option>
                  <option value={10}>10%</option>
                  <option value={4}>4%</option>
                  <option value={0}>0%</option>
                </select>
              </div>
            ))}
            <button type="button" onClick={() => setItems([...items, { desc: '', qty: 1, price: 0, tax: 22 }])} className="text-sm text-aura-gold hover:underline">+ Aggiungi Riga</button>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 font-semibold text-fumo hover:bg-white/5 hover:text-pietra">Annulla</button>
            <button type="submit" disabled={create.isPending} className="rounded-xl bg-aura-gold px-6 py-2 font-bold text-navy hover:bg-aura-gold-light disabled:opacity-50">
              {create.isPending ? 'Invio in corso...' : 'Invia ad Aruba SDI'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
