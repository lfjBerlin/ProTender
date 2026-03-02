import {
  FileSearch,
  Calculator,
  ShieldCheck,
  MessageCircleQuestion,
  Leaf,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Lock,
} from 'lucide-react'
import ProgressBar from './ProgressBar'

const ICONS = {
  FileSearch,
  Calculator,
  ShieldCheck,
  MessageCircleQuestion,
  Leaf,
  Send,
}

const STATUS_CONFIG = {
  idle: { label: 'Wartet', Icon: Clock, class: 'bg-gray-100 text-gray-600' },
  running: { label: 'Läuft', Icon: Loader2, class: 'bg-blue-100 text-protender-blue' },
  done: { label: 'Abgeschlossen', Icon: CheckCircle2, class: 'bg-green-100 text-green-700' },
  blocked: { label: 'Gesperrt', Icon: Lock, class: 'bg-gray-100 text-gray-500' },
  error: { label: 'Fehler', Icon: AlertCircle, class: 'bg-red-100 text-red-700' },
}

export default function StepCard({
  step,
  status,
  progress,
  outputPreview,
  expanded,
  onToggle,
  isBlocked,
  children,
}) {
  const Icon = ICONS[step.icon] || FileSearch
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.idle
  const StatusIcon = cfg.Icon

  return (
    <article
      className={`
        rounded-2xl border transition-all duration-300 ease-out
        bg-white/90 backdrop-blur-sm overflow-hidden
        ${expanded ? 'border-protender-blue shadow-lg col-span-full' : 'border-gray-200/80 shadow-sm hover:shadow-md'}
      `}
      aria-expanded={expanded}
    >
      <div
        className="p-4 flex items-start gap-4 cursor-pointer"
        onClick={() => onToggle?.()}
        onKeyDown={(e) => e.key === 'Enter' && onToggle?.()}
        role="button"
        tabIndex={0}
        aria-label={`${step.title}, ${cfg.label} – zum Auf- und Zuklappen`}
      >
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-protender-blue/10 flex items-center justify-center text-protender-blue">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-bold text-gray-900">{step.title}</h3>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.class}`}
            >
              {status === 'running' && <StatusIcon className="w-3.5 h-3.5 animate-spin" />}
              {status !== 'running' && <StatusIcon className="w-3.5 h-3.5" />}
              {cfg.label}
            </span>
          </div>
          <ProgressBar value={progress} className="mb-2" />
          {outputPreview && (
            <p className="text-sm text-gray-600 truncate">{outputPreview}</p>
          )}
        </div>
        <div
          className={`
            flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
            transition-transform duration-200
            ${expanded ? 'rotate-180 bg-protender-blue/10 text-protender-blue' : 'bg-gray-100 text-gray-500'}
          `}
          aria-hidden
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {expanded && (
        <div
          className="border-t border-gray-200/80 bg-gray-50/50 p-4 animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          {isBlocked ? (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Vorschau (gesperrt)</p>
              <p className="text-sm text-gray-500 italic">
                Startet nach Abschluss der vorherigen Schritte.
              </p>
            </div>
          ) : (
            children
          )}
        </div>
      )}
    </article>
  )
}
