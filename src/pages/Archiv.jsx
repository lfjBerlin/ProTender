import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Archive, Search, ChevronRight } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import { MOCK_TENDERS } from '../data/tenders'
import { MOCK_TEAM } from '../data/team'
import { getApplications, getApplicationState, getProfile } from '../lib/store'
import { generateOutcomeInsight } from '../lib/outcomeInsights'
import { daysUntil } from '../config/time'
import { computeTenderScore } from '../lib/radarService'

const STATUS_BADGE = {
  won: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
}

export default function Archiv() {
  const location = useLocation()
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    setRefreshKey((k) => k + 1)
  }, [location.pathname])

  const applications = getApplications()
  const profile = getProfile()

  const [filterStatus, setFilterStatus] = useState('all')
  const [filterResponsible, setFilterResponsible] = useState('')
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  const archivedEntries = useMemo(
    () =>
      Object.entries(applications).filter(
        ([, v]) => v.status === 'won' || v.status === 'lost'
      ),
    [applications, refreshKey]
  )

  const kpis = useMemo(() => {
    let won = 0
    let lost = 0
    let scoreSum = 0
    let scoreCount = 0
    archivedEntries.forEach(([tenderId, app]) => {
      if (app.status === 'won') won += 1
      if (app.status === 'lost') lost += 1
      const tender = MOCK_TENDERS.find((t) => t.id === tenderId)
      if (tender) {
        const s = computeTenderScore(tender, profile)
        scoreSum += s
        scoreCount += 1
      }
    })
    const total = won + lost
    const winRate = total ? Math.round((won / total) * 100) : 0
    const avgScore = scoreCount ? Math.round(scoreSum / scoreCount) : 0
    return { won, lost, winRate, avgScore }
  }, [archivedEntries, profile])

  const filtered = useMemo(() => {
    return archivedEntries.filter(([tenderId, app]) => {
      const tender = MOCK_TENDERS.find((t) => t.id === tenderId)
      if (filterStatus !== 'all' && app.status !== filterStatus) return false
      if (filterResponsible && (app.responsibleUserId || '') !== filterResponsible) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        if (!tender?.title?.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [archivedEntries, filterStatus, filterResponsible, search])

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-b from-white to-blue-50/80">
        <Topbar />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-protender-blue flex items-center gap-2">
                <Archive className="w-7 h-7" />
                Archiv
              </h1>
              <p className="text-gray-600 mt-1">
                Abgeschlossene Projekte mit Learnings und schnellen Zugriffen auf Artefakte.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm p-4 shadow-sm">
                <p className="text-sm text-gray-500">Gewonnen</p>
                <p className="text-2xl font-bold text-green-600">{kpis.won}</p>
              </div>
              <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm p-4 shadow-sm">
                <p className="text-sm text-gray-500">Verloren</p>
                <p className="text-2xl font-bold text-red-600">{kpis.lost}</p>
              </div>
              <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm p-4 shadow-sm">
                <p className="text-sm text-gray-500">Win-Rate</p>
                <p className="text-2xl font-bold text-protender-blue">{kpis.winRate}%</p>
              </div>
              <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm p-4 shadow-sm">
                <p className="text-sm text-gray-500">Ø Match-Score</p>
                <p className="text-2xl font-bold text-protender-blue">{kpis.avgScore}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[220px]">
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
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 rounded-xl border border-gray-200 bg-white"
              >
                <option value="all">Alle Outcomes</option>
                <option value="won">Nur gewonnen</option>
                <option value="lost">Nur verloren</option>
              </select>
              <select
                value={filterResponsible}
                onChange={(e) => setFilterResponsible(e.target.value)}
                className="px-4 py-2 rounded-xl border border-gray-200 bg-white"
              >
                <option value="">Alle Verantwortliche</option>
                {MOCK_TEAM.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              {filtered.length === 0 ? (
                <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm p-8 text-center">
                  <p className="text-gray-500">
                    Noch keine abgeschlossenen Projekte im Archiv. Markieren Sie Projekte in{' '}
                    <Link to="/projekte" className="text-protender-blue font-medium hover:underline">
                      Projekte
                    </Link>{' '}
                    als gewonnen oder verloren.
                  </p>
                </div>
              ) : (
                filtered.map(([tenderId, app]) => {
                  const tender = MOCK_TENDERS.find((t) => t.id === tenderId)
                  if (!tender) return null
                  const state = getApplicationState(tenderId)
                  const insight = generateOutcomeInsight({
                    tender,
                    applicationState: state,
                    application: app,
                    profile,
                  })
                  const daysToDeadline = daysUntil(tender.deadlineISO)
                  const closedAt = app.closedAtISO || app.updatedAtISO
                  const responsible = MOCK_TEAM.find((m) => m.id === app.responsibleUserId)
                  const offerPrice = state?.outputs?.calc?.totals?.offerPrice
                  const dbPct = state?.outputs?.calc?.totals?.contributionMarginPct
                  const isExpanded = expandedId === tenderId

                  return (
                    <div
                      key={tenderId}
                      className="rounded-2xl border border-gray-200/80 bg-white/90 backdrop-blur-sm p-5 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : tenderId)}
                        className="w-full text-left"
                      >
                        <div className="flex flex-wrap gap-4 items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 line-clamp-1">{tender.title}</h3>
                            <p className="text-sm text-gray-500 mt-0.5">
                              {tender.location} · Frist {new Date(tender.deadlineISO).toLocaleDateString('de-DE')}
                              {daysToDeadline < 0 && ' (abgelaufen)'}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Abschluss:{' '}
                              {closedAt
                                ? new Date(closedAt).toLocaleDateString('de-DE')
                                : '—'}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span
                              className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                                STATUS_BADGE[app.status] || 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {app.status === 'won' ? 'Gewonnen' : 'Verloren'}
                            </span>
                            <span className="text-xs text-gray-500">
                              Match-Score: <span className="font-semibold">{insight.score}</span>
                            </span>
                            {responsible && (
                              <span className="text-xs text-gray-500">
                                Verantwortlich: <span className="font-medium">{responsible.name}</span>
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <p className="text-sm text-gray-700 line-clamp-2 flex-1">
                            {insight.summary}
                          </p>
                          <div className="text-xs text-gray-500 text-right">
                            <p>
                              Angebot:{' '}
                              {offerPrice != null
                                ? new Intl.NumberFormat('de-DE', {
                                    style: 'currency',
                                    currency: 'EUR',
                                  }).format(offerPrice)
                                : '—'}
                            </p>
                            <p>DB: {dbPct != null ? `${dbPct}%` : '—'}</p>
                          </div>
                        </div>
                      </button>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Link
                          to={`/application/${tenderId}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-protender-blue text-white text-sm font-medium hover:bg-protender-blue/90"
                        >
                          Bewerbungsprozess ansehen
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
                        >
                          Kalkulationsbericht
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
                        >
                          CO₂-Bericht
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
                        >
                          Compliance-Check
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="mt-4 border-t border-gray-100 pt-4 space-y-3">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-800 mb-1">
                              Warum {app.status === 'won' ? 'gewonnen' : 'verloren'}?
                            </h4>
                            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                              {insight.bullets.map((b, i) => (
                                <li key={i}>{b}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="grid sm:grid-cols-3 gap-3 text-xs text-gray-600">
                            <div>
                              <p className="font-semibold mb-0.5">Preiswettbewerb</p>
                              <p>{insight.factors.priceCompetitiveness}</p>
                            </div>
                            <div>
                              <p className="font-semibold mb-0.5">Compliance</p>
                              <p>{insight.factors.compliance}</p>
                            </div>
                            <div>
                              <p className="font-semibold mb-0.5">Differenzierung</p>
                              <p>{insight.factors.differentiation}</p>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            <p className="font-semibold mb-1">Timeline</p>
                            <p>
                              Veröffentlichung:{' '}
                              {new Date(tender.publishedISO).toLocaleDateString('de-DE')} · Frist:{' '}
                              {new Date(tender.deadlineISO).toLocaleDateString('de-DE')} · Abschluss:{' '}
                              {closedAt
                                ? new Date(closedAt).toLocaleDateString('de-DE')
                                : '—'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

