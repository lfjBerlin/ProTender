export default function WeightBar({ priceWeight = 0, qualityWeight = 0, sustainabilityWeight = 0 }) {
  const total = priceWeight + qualityWeight + sustainabilityWeight || 1
  const p = Math.round((priceWeight / total) * 100)
  const q = Math.round((qualityWeight / total) * 100)
  const s = 100 - p - q

  return (
    <div className="space-y-2">
      <div className="flex h-3 rounded-full overflow-hidden bg-gray-200">
        {p > 0 && (
          <div
            className="bg-protender-blue transition-all"
            style={{ width: `${p}%` }}
            title={`Preis ${p}%`}
          />
        )}
        {q > 0 && (
          <div
            className="bg-protender-yellow transition-all"
            style={{ width: `${q}%` }}
            title={`Qualität ${q}%`}
          />
        )}
        {s > 0 && (
          <div
            className="bg-green-500 transition-all"
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
  )
}
