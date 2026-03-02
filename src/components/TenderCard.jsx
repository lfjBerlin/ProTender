import { Link } from 'react-router-dom'
import { ThumbsUp, ThumbsDown, ChevronRight, Bookmark } from 'lucide-react'
import ScoreRing from './ScoreRing'
import { daysUntil } from '../config/time'
import { getTenderFeedback, setTenderFeedback, isTenderSaved, toggleSaveTender, markTenderViewed } from '../lib/store'

export default function TenderCard({ tender, onFeedbackChange, onSaveChange }) {
  const feedback = getTenderFeedback(tender.id)
  const saved = isTenderSaved(tender.id)
  const days = daysUntil(tender.deadlineISO)
  const isUrgent = days <= 14

  const handleLike = (e) => {
    e.preventDefault()
    const next = feedback === 'like' ? null : 'like'
    setTenderFeedback(tender.id, next)
    onFeedbackChange?.()
  }

  const handleDislike = (e) => {
    e.preventDefault()
    const next = feedback === 'dislike' ? null : 'dislike'
    setTenderFeedback(tender.id, next)
    onFeedbackChange?.()
  }

  const handleSave = (e) => {
    e.preventDefault()
    toggleSaveTender(tender.id)
    onSaveChange?.()
  }

  const tags = []
  if (tender.volumeEur >= 5000000) tags.push('Volumen >5 Mio €')
  else if (tender.volumeEur >= 2000000) tags.push('Volumen >2 Mio €')
  if (tender.sustainabilityRequired) tags.push('Nachhaltigkeit gefordert')

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      <div className="p-6 flex flex-col sm:flex-row gap-4 sm:gap-6">
        <div className="flex-shrink-0 flex items-center">
          <ScoreRing score={tender.score} size={80} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-protender-blue mb-1 line-clamp-2">
            {tender.title}
          </h3>
          <p className="text-sm text-gray-600 mb-2">{tender.authority}</p>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {tender.location} · {tender.procedureType} · {tender.docCount} Dokumente
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                isUrgent ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Frist: {days < 0 ? 'Abgelaufen' : `Noch ${days} Tage`}
            </span>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 rounded-lg bg-protender-blue/10 text-protender-blue"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex sm:flex-col items-center sm:items-end gap-3 flex-shrink-0">
          <div className="flex items-center gap-1 select-none">
            <button
              type="button"
              onClick={handleSave}
              className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-protender-blue/50 ${
                saved ? 'bg-protender-yellow text-protender-blue' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
              }`}
              aria-label={saved ? 'Gespeichert (entfernen)' : 'Speichern'}
            >
              <Bookmark className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
            </button>
            <button
              type="button"
              onClick={handleLike}
              className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-protender-blue/50 ${
                feedback === 'like'
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
              }`}
              aria-label={feedback === 'like' ? 'Like aktiv (klicken zum Aufheben)' : 'Gefällt mir'}
            >
              <ThumbsUp className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleDislike}
              className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-protender-blue/50 ${
                feedback === 'dislike'
                  ? 'bg-red-100 text-red-600'
                  : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
              }`}
              aria-label={feedback === 'dislike' ? 'Dislike aktiv (klicken zum Aufheben)' : 'Gefällt mir nicht'}
            >
              <ThumbsDown className="w-5 h-5" />
            </button>
          </div>
          <Link
            to={`/tender/${tender.id}`}
            state={{ score: tender.score }}
            onClick={() => markTenderViewed(tender.id)}
            className="inline-flex items-center gap-1.5 bg-protender-yellow hover:bg-protender-yellow-hover text-protender-blue font-semibold px-4 py-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-protender-blue/50 shadow-sm"
          >
            Details prüfen
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
