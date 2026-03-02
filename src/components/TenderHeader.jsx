import { Link } from 'react-router-dom'
import { ArrowLeft, Play, ChevronRight, Bookmark } from 'lucide-react'
import Badge from './Badge'
import { daysUntil } from '../config/time'
import { isTenderSaved, toggleSaveTender, upsertApplication, markTenderViewed } from '../lib/store'

function formatVolume(n) {
  if (!n) return '–'
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)} Mio €`
  return `${(n / 1000).toFixed(0)}k €`
}

export default function TenderHeader({ tender, score }) {
  const saved = isTenderSaved(tender.id)
  const days = daysUntil(tender.deadlineISO)
  const isOverdue = days < 0

  let ampel = 'success'
  if (isOverdue) ampel = 'error'
  else if (days <= 7) ampel = 'error'
  else if (days <= 14) ampel = 'warning'

  const ampelLabels = { success: 'Ausreichend Zeit', warning: 'Bald fällig', error: isOverdue ? 'Frist abgelaufen' : 'Dringend' }

  return (
    <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 -mx-4 px-4 py-4 lg:-mx-6 lg:px-6 lg:py-5">
      <div className="max-w-6xl mx-auto">
        <nav className="text-sm text-gray-500 mb-3">
          <Link to="/radar" className="hover:text-protender-blue transition-colors">
            Radar
          </Link>
          <ChevronRight className="inline w-4 h-4 mx-1 align-middle" />
          <span className="text-gray-700">Ausschreibung</span>
        </nav>
        <h1 className="text-xl lg:text-2xl font-bold text-protender-blue mb-3">{tender.title}</h1>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <button
            type="button"
            onClick={() => toggleSaveTender(tender.id)}
            className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-protender-blue/50 ${
              saved ? 'bg-protender-yellow text-protender-blue' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
            aria-label={saved ? 'Gespeichert' : 'Speichern'}
            title={saved ? 'Gespeichert' : 'Speichern'}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
          </button>
          <Badge variant="blue">{tender.location}</Badge>
          <Badge>{tender.procedureType}</Badge>
          <Badge variant={ampel} title={ampelLabels[ampel]}>
            {isOverdue ? 'Frist abgelaufen' : `Noch ${days} Tage`}
          </Badge>
          {score != null && <Badge variant="blue">Score {score}</Badge>}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Link
            to={`/application/${tender.id}`}
            onClick={() => {
              markTenderViewed(tender.id)
              upsertApplication(tender.id, 'in_progress')
            }}
            className="inline-flex items-center justify-center gap-2 bg-protender-yellow hover:bg-protender-yellow-hover text-protender-blue font-bold px-6 py-3 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-protender-blue/50 shadow-sm"
          >
            <Play className="w-5 h-5" />
            Bewerbungsprozess starten
          </Link>
          <Link
            to="/radar"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-protender-blue font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zum Radar
          </Link>
        </div>
      </div>
    </header>
  )
}
