import { Calendar } from 'lucide-react'
import { demoNow, daysUntil } from '../config/time'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function TenderTimeline({ publishedISO, deadlineISO, projectStartISO }) {
  const now = demoNow()
  const published = new Date(publishedISO)
  const deadline = new Date(deadlineISO)
  const projectStart = new Date(projectStartISO)

  const totalSpan = deadline - published
  const elapsed = now - published
  const progress = Math.min(100, Math.max(0, (elapsed / totalSpan) * 100))
  const days = daysUntil(deadlineISO)
  const isOverdue = days < 0

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm p-5 shadow-sm">
      <h3 className="font-bold text-protender-blue mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5" />
        Zeitstrahl
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Veröffentlicht</span>
          <span className="font-medium text-gray-900">{formatDate(publishedISO)}</span>
        </div>
        <div className="relative h-2 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-protender-blue/30 rounded-full"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-protender-blue border-2 border-white shadow"
            style={{ left: `${Math.min(progress, 98)}%` }}
            title="Heute"
          />
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Heute</span>
          <span className="text-xs text-gray-500">●</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Angebotsfrist</span>
          <span className={`font-bold ${isOverdue ? 'text-red-600' : 'text-protender-blue'}`}>
            {formatDate(deadlineISO)}
          </span>
        </div>
        {isOverdue && (
          <div className="text-sm text-red-600 font-medium bg-red-50 rounded-lg px-3 py-2">
            Frist abgelaufen
          </div>
        )}
        {!isOverdue && (
          <div className="text-lg font-bold text-protender-blue">
            Noch {days} Tage
          </div>
        )}
        <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
          <span className="text-gray-600">Projektstart</span>
          <span className="font-medium text-gray-900">{formatDate(projectStartISO)}</span>
        </div>
      </div>
    </div>
  )
}
