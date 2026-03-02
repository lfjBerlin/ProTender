import { useState, useCallback } from 'react'

const COLS = ['Pos', 'Kurztext', 'Menge', 'Einheit', 'EP', 'GP', 'Kommentar']

function formatEur(n) {
  const num = typeof n === 'string' ? parseFloat(n) : n
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(num || 0)
}

export function computeRowGP(row) {
  const menge = Number(row.menge) || 0
  const ep = Number(row.ep) || 0
  return menge * ep
}

export function computeTotals(rows) {
  let material = 0
  let labor = 0
  let equipment = 0
  let overhead = 0
  rows.forEach((r, i) => {
    const gp = computeRowGP(r)
    if (i < rows.length * 0.4) material += gp
    else if (i < rows.length * 0.7) labor += gp
    else if (i < rows.length * 0.9) equipment += gp
    else overhead += gp
  })
  const offerPrice = material + labor + equipment + overhead
  const contributionMarginPct = offerPrice > 0 ? Math.round(12 + (rows.length % 8)) : 0
  return {
    material,
    labor,
    equipment,
    overhead,
    offerPrice,
    contributionMarginPct,
  }
}

export default function LVTable({
  rows = [],
  visibleCount = 0,
  totalRows = 0,
  editable = false,
  onRowsChange,
  totals: externalTotals,
}) {
  const [savedAt, setSavedAt] = useState(null)
  const visible = visibleCount > 0 && visibleCount < (rows?.length || 0)
    ? rows.slice(0, visibleCount)
    : rows
  const isStreaming = totalRows > 0 && visibleCount > 0 && visibleCount < (rows?.length || totalRows)

  const totals = externalTotals ?? (rows?.length ? computeTotals(rows) : null)

  const handleEPChange = useCallback((index, value) => {
    const num = parseFloat(String(value).replace(',', '.')) || 0
    const next = rows.map((r, i) =>
      i === index ? { ...r, ep: num } : r
    )
    onRowsChange?.(next)
    setSavedAt(new Date())
  }, [rows, onRowsChange])

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {COLS.map((c) => (
                <th key={c} className="px-3 py-2 text-left font-semibold text-gray-700">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((r, i) => {
              const gp = computeRowGP(r)
              return (
                <tr key={r.id || i} className="border-b border-gray-100 hover:bg-gray-50/50">
                  <td className="px-3 py-2 text-gray-600">{r.pos}</td>
                  <td className="px-3 py-2 text-gray-900">{r.kurztext}</td>
                  <td className="px-3 py-2 text-right">{r.menge}</td>
                  <td className="px-3 py-2 text-gray-600">{r.einheit}</td>
                  <td className="px-3 py-2 text-right">
                    {editable ? (
                      <input
                        type="text"
                        value={r.ep}
                        onChange={(e) => handleEPChange(i, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-24 px-2 py-1 text-right border border-gray-200 rounded focus:ring-2 focus:ring-protender-blue/50"
                      />
                    ) : (
                      <span className="font-medium">{formatEur(r.ep)}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right font-medium">{formatEur(gp)}</td>
                  <td className="px-3 py-2 text-gray-500 max-w-[140px] truncate">{r.kommentar || '–'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {isStreaming && (
          <div className="px-3 py-2 bg-blue-50/50 text-sm text-protender-blue">
            {visible.length} von {totalRows} Positionen geladen …
          </div>
        )}
      </div>
      {totals && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
            <p className="text-xs text-gray-500">Material</p>
            <p className="font-semibold">{formatEur(totals.material)}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
            <p className="text-xs text-gray-500">Lohn</p>
            <p className="font-semibold">{formatEur(totals.labor)}</p>
          </div>
          <div className="rounded-xl border border-protender-blue/20 bg-protender-blue/5 p-3">
            <p className="text-xs text-gray-500">Angebotspreis</p>
            <p className="font-bold text-protender-blue">{formatEur(totals.offerPrice)}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
            <p className="text-xs text-gray-500">Deckungsbeitrag</p>
            <p className="font-semibold">{totals.contributionMarginPct}%</p>
          </div>
        </div>
      )}
      {editable && savedAt && (
        <p className="text-xs text-green-600">Änderungen gespeichert</p>
      )}
    </div>
  )
}
