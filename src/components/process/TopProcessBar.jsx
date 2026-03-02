import { Play, Pause, RotateCcw, ChevronRight } from 'lucide-react'

export default function TopProcessBar({
  stepIndex,
  totalSteps,
  autoRun,
  onAutoRunChange,
  paused,
  onPauseToggle,
  weiterEnabled,
  onWeiter,
  onReset,
  showWeiter,
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm text-gray-500">Schritt {stepIndex + 1}/{totalSteps}</span>

      <label className="inline-flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={!!autoRun}
          onChange={(e) => onAutoRunChange?.(e.target.checked)}
          className="rounded border-gray-300 text-protender-blue focus:ring-protender-blue"
        />
        <span className="text-sm font-medium text-gray-700">Auto-Lauf</span>
      </label>

      <button
        type="button"
        onClick={onPauseToggle}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors text-sm"
      >
        {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
        {paused ? 'Fortsetzen' : 'Pause'}
      </button>

      {showWeiter && (
        <button
          type="button"
          onClick={onWeiter}
          disabled={!weiterEnabled}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-colors ${
            weiterEnabled
              ? 'bg-protender-yellow hover:bg-protender-yellow-hover text-protender-blue'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          Weiter
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-red-50 text-gray-600 hover:text-red-700 transition-colors text-sm"
      >
        <RotateCcw className="w-4 h-4" />
        Alles zurücksetzen
      </button>
    </div>
  )
}
