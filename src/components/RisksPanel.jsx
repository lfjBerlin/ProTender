import { AlertTriangle } from 'lucide-react'
import Badge from './Badge'

const LEVEL_VARIANTS = { low: 'success', medium: 'warning', high: 'error' }

export default function RisksPanel({ risks }) {
  if (!risks?.length) {
    return <p className="text-gray-500 py-4">Keine Risiken identifiziert.</p>
  }

  return (
    <div className="space-y-3">
      {risks.map((risk) => (
        <div
          key={risk.id}
          className="p-4 rounded-xl border border-gray-200 bg-white/60 min-w-0 overflow-hidden"
        >
          <div className="flex items-start gap-3 min-w-0">
            <AlertTriangle
              className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                risk.level === 'high'
                  ? 'text-red-500'
                  : risk.level === 'medium'
                  ? 'text-amber-500'
                  : 'text-gray-400'
              }`}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-medium text-gray-900 break-words">{risk.title}</span>
                <Badge variant={LEVEL_VARIANTS[risk.level] || 'default'}>
                  {risk.level === 'high' ? 'Hoch' : risk.level === 'medium' ? 'Mittel' : 'Niedrig'}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{risk.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
