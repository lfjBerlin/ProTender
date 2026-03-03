import { useState, useCallback, useEffect } from 'react'
import { FileCheck } from 'lucide-react'
import UploadItem from '../UploadItem'
import { getUploads, setUploads } from '../../lib/store'

const UPLOAD_CONFIG = [
  { id: 'handelsregister', label: 'Handelsregisterauszug / Gewerbeanmeldung', hint: 'Amtlicher Nachweis der Eintragung', required: false },
  { id: 'unbedenklichkeit', label: 'Unbedenklichkeitsbescheinigung(en)', hint: 'Finanzamt / Sozialkassen', required: false },
  { id: 'versicherung', label: 'Versicherungsnachweis(e) (Betriebshaftpflicht)', hint: 'Aktueller Nachweis', required: false },
  { id: 'referenzliste', label: 'Referenzliste / Projektliste', hint: 'Relevante abgeschlossene Projekte', required: false },
  { id: 'eigenerklaerungen', label: 'Eigenerklärungen / Formblätter', hint: 'SEL-Formulare etc.', required: false },
]

function fileToMeta(f) {
  if (!f) return null
  return { name: f.name, size: f.size, type: f.type, lastModified: f.lastModified }
}

export default function DocumentUploads() {
  const [files, setFilesState] = useState({})
  const [fileObjects, setFileObjects] = useState({})

  const load = useCallback(() => {
    setFilesState(getUploads())
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleFileChange = (id, file) => {
    if (!file) return
    setFileObjects((prev) => ({ ...prev, [id]: file }))
    const next = { ...getUploads(), [id]: fileToMeta(file) }
    setUploads(next)
    setFilesState(next)
  }

  const handleFileRemove = (id) => {
    setFileObjects((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    const current = getUploads()
    const next = { ...current }
    delete next[id]
    setUploads(next)
    setFilesState(next)
  }

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm p-5 shadow-sm">
      <h2 className="font-bold text-protender-blue mb-2 flex items-center gap-2">
        <FileCheck className="w-5 h-5" />
        Dokumente
      </h2>
      <p className="text-xs text-gray-500 mb-4">
        Optional im Dummy – im Live-System für Submission erforderlich. Später hochladen möglich.
      </p>
      <div className="space-y-6">
        {UPLOAD_CONFIG.map((item) => (
          <UploadItem
            key={item.id}
            label={item.label}
            hint={item.hint}
            required={item.required}
            file={fileObjects[item.id] || (files[item.id] ? { name: files[item.id].name, size: files[item.id].size } : null)}
            onFileChange={(f) => handleFileChange(item.id, f)}
            onRemove={() => handleFileRemove(item.id)}
          />
        ))}
      </div>
    </div>
  )
}
