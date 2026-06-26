import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Save, Edit2, Map } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import toast from 'react-hot-toast'
import { useTenantQueryKey } from '../../contexts/AuthContext'
import { tq } from '../../lib/queryKeys'
import { ui } from '../../lib/ui'

interface AreaManagerModalProps {
  areas: string[]
  onClose: () => void
}

export default function AreaManagerModal({ areas, onClose }: AreaManagerModalProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const tk = useTenantQueryKey()
  const [editingArea, setEditingArea] = useState<string | null>(null)
  const [newName, setNewName] = useState('')

  const renameArea = useMutation({
    mutationFn: ({ oldName, newName }: { oldName: string | null; newName: string }) =>
      api.patch('/tables/area', { oldName, newName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tq(tk, 'tables') })
      toast.success(t('common.saved', { defaultValue: 'Salvato con successo' }))
      setEditingArea(null)
    },
    onError: () => {
      toast.error(t('common.error', { defaultValue: 'Errore imprevisto' }))
    }
  })

  const handleSave = (oldName: string | null) => {
    if (!newName.trim()) return
    renameArea.mutate({ oldName, newName: newName.trim() })
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm">
      <div className={ui.modal}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={ui.modalTitle}>
            <Map className="w-5 h-5 text-aura-gold inline-block mr-2" />
            Gestione Zone
          </h3>
          <button onClick={onClose} className="p-2 rounded-full text-fumo hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-fumo mb-6 leading-relaxed">
          Le zone vengono generate automaticamente in base ai tavoli presenti. Rinomina una zona per spostare tutti i tavoli associati.
        </p>

        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
          {areas.map(area => (
            <div key={area || 'default'} className="p-3 rounded-xl bg-black/20 border border-white/5 flex items-center justify-between group">
              {editingArea === area ? (
                <div className="flex items-center gap-2 w-full">
                  <input
                    autoFocus
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className={ui.input}
                    placeholder="Nuovo nome..."
                    onKeyDown={e => e.key === 'Enter' && handleSave(area)}
                  />
                  <button
                    onClick={() => handleSave(area)}
                    disabled={renameArea.isPending}
                    className="p-2 rounded-lg bg-aura-gold text-navy hover:bg-aura-gold/90 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingArea(null)}
                    className="p-2 rounded-lg text-fumo hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-base font-semibold text-pietra">
                    {area || 'Sala Principale'}
                  </span>
                  <button
                    onClick={() => {
                      setEditingArea(area)
                      setNewName(area || 'Sala Principale')
                    }}
                    className="p-2 rounded-lg text-fumo opacity-0 group-hover:opacity-100 hover:text-aura-gold hover:bg-white/5 transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          ))}

          {areas.length === 0 && (
            <div className="text-center p-6 bg-white/5 rounded-xl border border-white/5 border-dashed">
              <p className="text-sm text-fumo">Nessuna zona creata. Crea un tavolo per iniziare.</p>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-end">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-pietra hover:bg-white/10 transition-colors">
            Chiudi
          </button>
        </div>
      </div>
    </div>
  )
}
