export default function WeightBar({ priceWeight = 0, qualityWeight = 0, sustainabilityWeight = 0 }) {
  const total = priceWeight + qualityWeight + sustainabilityWeight || 1
  const p = Math.round((priceWeight / total) * 100)
  const q = Math.round((qualityWeight / total) * 100)
  const s = Math.max(0, 100 - p - q)

  return (
    <div className="w-full max-w-full space-y-3">
      {/* Desktop: horizontal stacked bar */}
      <div className="hidden md:block space-y-2">
        <div className="flex h-3 rounded-full overflow-hidden bg-gray-200 min-w-0">
          {p > 0 && (
            <div
              className="bg-protender-blue transition-all flex-shrink-0"
              style={{ width: `${p}%` }}
              title={`Preis ${p}%`}
            />
          )}
          {q > 0 && (
            <div
              className="bg-protender-yellow transition-all flex-shrink-0"
              style={{ width: `${q}%` }}
              title={`Qualität ${q}%`}
            />
          )}
          {s > 0 && (
            <div
              className="bg-green-500 transition-all flex-shrink-0"
              style={{ width: `${s}%` }}
              title={`Nachhaltigkeit ${s}%`}
            />
          )}
        </div>
        <div className="flex flex-wrap gap-3 text-xs">
          <span className="text-gray-600">
            <span className="inline-block w-2 h-2 rounded-full bg-protender-blue mr-1" />
            Preis {p}%
          </span>
          <span className="text-gray-600">
            <span className="inline-block w-2 h-2 rounded-full bg-protender-yellow mr-1" />
            Qualität {q}%
          </span>
          <span className="text-gray-600">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1" />
            Nachhaltigkeit {s}%
          </span>
        </div>
      </div>

      {/* Mobile: vertical stacked list with progress bars */}
      <div className="md:hidden space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700 font-medium">Preis</span>
            <span className="text-gray-600">{p}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full bg-protender-blue rounded-full transition-all"
              style={{ width: `${p}%` }}
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700 font-medium">Qualität</span>
            <span className="text-gray-600">{q}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full bg-protender-yellow rounded-full transition-all"
              style={{ width: `${q}%` }}
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700 font-medium">Nachhaltigkeit</span>
            <span className="text-gray-600">{s}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${s}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
