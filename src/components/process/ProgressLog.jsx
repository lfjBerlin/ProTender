export default function ProgressLog({ lines = [] }) {
  return (
    <div className="font-mono text-xs space-y-1 max-h-32 overflow-y-auto bg-gray-50 rounded-lg p-3">
      {lines.length === 0 ? (
        <p className="text-gray-400">Warte auf Fortschritt …</p>
      ) : (
        lines.map((line, i) => (
          <div key={i} className="text-gray-600 flex items-center gap-2">
            <span className="text-protender-blue">›</span>
            <span>{line}</span>
          </div>
        ))
      )}
    </div>
  )
}
