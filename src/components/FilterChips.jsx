import { X } from 'lucide-react'

export default function FilterChips({ applied, onRemove, onClearAll }) {
  if (!applied?.length) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-gray-500">Aktive Filter:</span>
      {applied.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onRemove(key)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-protender-blue/10 text-protender-blue text-sm font-medium hover:bg-protender-blue/20 transition-colors focus:outline-none focus:ring-2 focus:ring-protender-blue/50"
        >
          {label}
          <X className="w-3.5 h-3.5" />
        </button>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="text-sm text-gray-500 hover:text-protender-blue font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-protender-blue/30 rounded"
      >
        Alle löschen
      </button>
    </div>
  )
}
