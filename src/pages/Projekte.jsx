import { useEffect, useState, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FolderOpen, Search, ChevronRight, FileCheck } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import { MOCK_TENDERS } from '../data/tenders'
import { MOCK_TEAM } from '../data/team'
import {
  getApplications,
  getApplicationState,
  getApplicationEvents,
  appendApplicationEvent,
  setApplicationResponsible,
  upsertApplication,
} from '../lib/store'
import { daysUntil } from '../config/time'
import { STEP_KEYS } from '../lib/applicationEngine'

const STATUS_LABELS = {
  draft: 'Entwurf',
  in_progress: 'In Bearbeitung',
  submitted: 'Eingereicht',
  won: 'Gewonnen',
  lost: 'Verloren',
}

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  submitted: 'bg-amber-100 text-amber-700',
  won: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
}

const EVENT_LABELS = {
  analysis_done: 'Analyse abgeschlossen',
  calc_updated: 'Kalkulation angepasst',
  compliance_done: 'Compliance geprüft',
  bidder_questions_done: 'Bieterfragen abgeschlossen',
  sustainability_done: 'Nachhaltigkeit berechnet',
  submission_ready: 'Submission bereit',
  deadline_warning: 'Frist in 7 Tagen',
  won: 'Als gewonnen markiert',
  lost: 'Als verloren markiert',
}

const PROGRESS_MAP = {
  analysis: 15,
  calc: 35,
  compliance: 55,
  bidder: 70,
  sustainability: 85,
  submission: 100,
}

function deriveProgress(appState) {
  if (!appState?.statuses) return 0
  let pct = 0
  for (const key of STEP_KEYS) {
    if (appState.statuses[key] === 'done') {
      pct = PROGRESS_MAP[key] ?? pct
    }
  }
  return pct
}

const STEP_EVENT_TYPES = {
  analysis: 'analysis_done',
  calc: 'calc_updated',
  compliance: 'compliance_done',
  bidder: 'bidder_questions_done',
  sustainability: 'sustainability_done',
  submission: 'submission_ready',
}

function getOrSynthesizeEvents(tenderId, tender, applications) {
  const raw = getApplicationEvents(tenderId)
  if (raw.length > 0) return raw

  const app = applications[tenderId]
  const appState = getApplicationState(tenderId)
  const days = tender ? daysUntil(tender.deadlineISO) : 999
  const synthetic = []
  const ts = app?.updatedAtISO || new Date().toISOString()

  if (appState?.statuses) {
    for (const key of STEP_KEYS) {
      if (appState.statuses[key] === 'done' && STEP_EVENT_TYPES[key]) {
        synthetic.push({ type: STEP_EVENT_TYPES[key], createdAtISO: ts })
      }
    }
  }
  if (days > 0 && days <= 7 && !synthetic.some((e) => e.type === 'deadline_warning')) {
    synthetic.push({ type: 'deadline_warning', createdAtISO: ts })
  }
  return synthetic.sort((a, b) => new Date(b.createdAtISO || 0) - new Date(a.createdAtISO || 0)).slice(0, 5)
}

export default function Projekte() {
  const location = useLocation()
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    setRefreshKey((k) => k + 1)
  }, [location.pathname])

  const applications = getApplications()

  const [filterStatus, setFilterStatus] = useState(null)
  const [filterResponsible, setFilterResponsible] = useState(null)
  const [search, setSearch] = useState('')

  const projectEntries = useMemo(() => {
    return Object.entries(applications).filter(
      ([, v]) =>
        ['in_progress', 'submitted', 'won', 'lost', 'draft'].includes(v.status)
    )
  }, [applications])

  const filtered = useMemo(() => {
    return projectEntries.filter(([tenderId, app]) => {
      const t = MOCK_TENDERS.find((x) => x.id === tenderId)
      if (filterStatus && app.status !== filterStatus) return false
      if (filterResponsible && (app.responsibleUserId || '') !== filterResponsible) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        if (!t?.title?.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [projectEntries, filterStatus, filterResponsible, search])

  const counts = useMemo(() => {
    const inProgress = projectEntries.filter(([, v]) => v.status === 'in_progress').length
    const submitted = projectEntries.filter(([, v]) => v.status === 'submitted').length
    const won = projectEntries.filter(([, v]) => v.status === 'won').length
    const lost = projectEntries.filter(([, v]) => v.status === 'lost').length
    return { inProgress, submitted, won, lost }
  }, [projectEntries])

  const allEvents = useMemo(() => {
    const out = []
    for (const [tenderId, app] of projectEntries) {
      const t = MOCK_TENDERS.find((x) => x.id === tenderId)
      const evs = getOrSynthesizeEvents(tenderId, t, applications)
      evs.forEach((e) => {
        out.push({
          tenderId,
          title: t?.title || tenderId,
          ...e,
        })
      })
    }
    return out
      .sort((a, b) => new Date(b.createdAtISO || 0) - new Date(a.createdAtISO || 0))
      .slice(0, 10)
  }, [projectEntries, applications])

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-b from-white to-blue-50/80">
        <Topbar />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-protender-blue flex items-center gap-2">
                <FolderOpen className="w-7 h-7" />
                Projekte
              </h1>
              <p className="text-gray-600 mt-1">Übersicht Ihrer aktiven und abgeschlossenen Bewerbungen</p>
            </div>

            {/* Summary Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                type="button"
                onClick={() => setFilterStatus(filterStatus === 'in_progress' ? null : 'in_progress')}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  filterStatus === 'in_progress'
                    ? 'border-protender-blue bg-protender-blue/5 shadow-md'
                    : 'border-gray-200/80 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md'
                }`}
              >
                <p className="text-sm text-gray-500">Laufende Projekte</p>
                <p className="text-2xl font-bold text-protender-blue">{counts.inProgress}</p>
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus(filterStatus === 'submitted' ? null : 'submitted')}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  filterStatus === 'submitted'
                    ? 'border-amber-400 bg-amber-50 shadow-md'
                    : 'border-gray-200/80 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md'
                }`}
              >
                <p className="text-sm text-gray-500">Eingereicht</p>
                <p className="text-2xl font-bold text-amber-600">{counts.submitted}</p>
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus(filterStatus === 'won' ? null : 'won')}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  filterStatus === 'won'
                    ? 'border-green-400 bg-green-50 shadow-md'
                    : 'border-gray-200/80 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md'
                }`}
              >
                <p className="text-sm text-gray-500">Gewonnen</p>
                <p className="text-2xl font-bold text-green-600">{counts.won}</p>
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus(filterStatus === 'lost' ? null : 'lost')}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  filterStatus === 'lost'
                    ? 'border-red-400 bg-red-50 shadow-md'
                    : 'border-gray-200/80 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md'
                }`}
              >
                <p className="text-sm text-gray-500">Verloren</p>
                <p className="text-2xl font-bold text-red-600">{counts.lost}</p>
              </button>
            </div>

            {/* Filter & Search */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Projekt suchen…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-protender-blue/50"
                />
              </div>
              <select
                value={filterStatus ?? ''}
                onChange={(e) => setFilterStatus(e.target.value || null)}
                className="px-4 py-2 rounded-xl border border-gray-200 bg-white"
              >
                <option value="">Alle Status</option>
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <select
                value={filterResponsible ?? ''}
                onChange={(e) => setFilterResponsible(e.target.value || null)}
                className="px-4 py-2 rounded-xl border border-gray-200 bg-white"
              >
                <option value="">Alle Verantwortliche</option>
                {MOCK_TEAM.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Project List */}
              <div className="lg:col-span-2 space-y-4">
                {filtered.length === 0 ? (
                  <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm p-8 text-center">
                    <p className="text-gray-500">Keine Projekte gefunden.</p>
                    <Link to="/radar" className="mt-2 inline-block text-protender-blue font-medium hover:underline">
                      Zum Radar →
                    </Link>
                  </div>
                ) : (
                  filtered.map(([tenderId, app]) => {
                    const t = MOCK_TENDERS.find((x) => x.id === tenderId)
                    const appState = getApplicationState(tenderId)
                    const progress = deriveProgress(appState)
                    const days = t ? daysUntil(t.deadlineISO) : 0

                    return (
                      <div
                        key={tenderId}
                        className="rounded-2xl border border-gray-200/80 bg-white/90 backdrop-blur-sm p-5 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-wrap gap-4 items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 line-clamp-1">{t?.title || tenderId}</h3>
                            <p className="text-sm text-gray-500 mt-0.5">
                              {t?.location || '–'} · {days < 0 ? 'Abgelaufen' : `Noch ${days} Tage`}
                            </p>
                          </div>
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                              STATUS_COLORS[app.status] || 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {STATUS_LABELS[app.status] || app.status}
                          </span>
                        </div>
                        <div className="mt-3">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                              <div
                                className="h-full bg-protender-blue rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">{progress}%</span>
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-3 items-center">
                          <select
                            value={app.responsibleUserId ?? ''}
                            onChange={(e) => {
                              const v = e.target.value || null
                              setApplicationResponsible(tenderId, v)
                              setRefreshKey((k) => k + 1)
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm"
                          >
                            <option value="">– Verantwortlich –</option>
                            {MOCK_TEAM.map((m) => (
                              <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                          </select>
                          {(app.status === 'submitted' || app.status === 'in_progress') && (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const now = new Date().toISOString()
                                  upsertApplication(tenderId, 'won', { closedAtISO: now })
                                  appendApplicationEvent(tenderId, { type: 'won', createdAtISO: new Date().toISOString() })
                                  setRefreshKey((k) => k + 1)
                                }}
                                className="px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-sm font-medium hover:bg-green-200"
                              >
                                Gewonnen
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const now = new Date().toISOString()
                                  upsertApplication(tenderId, 'lost', { closedAtISO: now })
                                  appendApplicationEvent(tenderId, { type: 'lost', createdAtISO: new Date().toISOString() })
                                  setRefreshKey((k) => k + 1)
                                }}
                                className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-sm font-medium hover:bg-red-200"
                              >
                                Verloren
                              </button>
                            </div>
                          )}
                          <Link
                            to={`/application/${tenderId}`}
                            className="ml-auto inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-protender-yellow hover:bg-protender-yellow-hover text-protender-blue font-medium text-sm transition-colors"
                          >
                            Öffnen
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Notifications Panel */}
              <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm p-5 shadow-sm">
                <h2 className="font-bold text-protender-blue mb-4 flex items-center gap-2">
                  <FileCheck className="w-5 h-5" />
                  Letzte Updates
                </h2>
                {allEvents.length === 0 ? (
                  <p className="text-gray-500 text-sm">Noch keine Updates.</p>
                ) : (
                  <ul className="space-y-3">
                    {allEvents.map((ev, i) => (
                      <li key={i} className="text-sm">
                        <Link
                          to={`/application/${ev.tenderId}`}
                          className="block p-2 rounded-lg hover:bg-gray-50"
                        >
                          <p className="font-medium text-gray-900 line-clamp-1">{ev.title}</p>
                          <p className="text-gray-500 text-xs mt-0.5">
                            {EVENT_LABELS[ev.type] || ev.type}
                          </p>
                          {ev.createdAtISO && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {new Date(ev.createdAtISO).toLocaleDateString('de-DE')}
                            </p>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
