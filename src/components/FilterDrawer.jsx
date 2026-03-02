import { X } from 'lucide-react'
import Toggle from './Toggle'

export default function FilterDrawer({
  open,
  onClose,
  locations,
  trades,
  volumePreset,
  deadlinePreset,
  sustainabilityOnly,
  onLocationsChange,
  onTradesChange,
  onVolumePresetChange,
  onDeadlinePresetChange,
  onSustainabilityChange,
  onMinScoreChange,
  minScoreEnabled,
  regionOptions,
  tradeOptions,
  volumeOptions,
  deadlineOptions,
}) {
  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-40 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 overflow-y-auto"
        role="dialog"
        aria-label="Filter"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-protender-blue">Filter</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-protender-blue/50"
            aria-label="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Region</h3>
            <div className="flex flex-wrap gap-2">
              {regionOptions.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    const next = locations.includes(r)
                      ? locations.filter((x) => x !== r)
                      : [...locations, r]
                    onLocationsChange(next)
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    locations.includes(r)
                      ? 'bg-protender-blue text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Gewerk</h3>
            <div className="flex flex-wrap gap-2">
              {tradeOptions.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    const next = trades.includes(t)
                      ? trades.filter((x) => x !== t)
                      : [...trades, t]
                    onTradesChange(next)
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    trades.includes(t)
                      ? 'bg-protender-blue text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Volumen</h3>
            <div className="flex flex-wrap gap-2">
              {volumeOptions.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => onVolumePresetChange(volumePreset?.label === preset.label ? null : preset)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    volumePreset?.label === preset.label
                      ? 'bg-protender-blue text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Frist</h3>
            <div className="flex flex-wrap gap-2">
              {deadlineOptions.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => onDeadlinePresetChange(deadlinePreset?.label === preset.label ? null : preset)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    deadlinePreset?.label === preset.label
                      ? 'bg-protender-blue text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Toggle
              checked={sustainabilityOnly}
              onChange={onSustainabilityChange}
              label="Nachhaltigkeit gefordert"
            />
          </div>
          <div>
            <Toggle
              checked={minScoreEnabled}
              onChange={onMinScoreChange}
              label="KI-Matches >80"
            />
          </div>
        </div>
      </aside>
    </>
  )
}
