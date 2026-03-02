import { useState, useEffect, useCallback, useRef } from 'react'
import { Pin, Download, Save } from 'lucide-react'
import { getTenderNotes, setTenderNotes, getTenderNotesSavedAt, getTenderPinned, setTenderPinned } from '../lib/tenderStore'

function formatSavedAt(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}

export default function NotesPanel({ tenderId }) {
  const [text, setText] = useState('')
  const [savedAt, setSavedAt] = useState(null)
  const [pinned, setPinned] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    setText(getTenderNotes(tenderId))
    setSavedAt(getTenderNotesSavedAt(tenderId))
    setPinned(getTenderPinned(tenderId))
  }, [tenderId])

  const save = useCallback(() => {
    setTenderNotes(tenderId, text)
    setSavedAt(getTenderNotesSavedAt(tenderId))
  }, [tenderId, text])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(save, 500)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [text, save])

  const handlePinned = () => {
    const next = !pinned
    setPinned(next)
    setTenderPinned(tenderId, next)
  }

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm flex flex-col shadow-sm">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="font-bold text-protender-blue">Notizen</h3>
        <div className="flex items-center gap-2">
          {savedAt && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Save className="w-3.5 h-3.5" />
              Zuletzt gespeichert: {formatSavedAt(savedAt)}
            </span>
          )}
          <button
            type="button"
            onClick={handlePinned}
            className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-protender-blue/50 ${
              pinned ? 'bg-protender-yellow text-protender-blue' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
            aria-label={pinned ? 'Wichtig markiert' : 'Als wichtig markieren'}
            title={pinned ? 'Wichtig' : 'Pin'}
          >
            <Pin className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-protender-blue/50"
            aria-label="Export"
            title="Export (Platzhalter)"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Notizen zu dieser Ausschreibung…"
        className="flex-1 min-h-[120px] p-4 border-0 resize-none focus:ring-0 focus:outline-none text-sm text-gray-700 placeholder:text-gray-400"
      />
    </div>
  )
}
