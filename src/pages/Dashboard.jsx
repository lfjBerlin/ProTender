import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import {
  LayoutDashboard,
  FileCheck,
  ThumbsUp,
  Bookmark,
  StickyNote,
  Upload,
  Clock,
  ChevronRight,
  ExternalLink,
  AlertCircle,
} from 'lucide-react'
import { MOCK_TENDERS } from '../data/tenders'
import { computeTenderScore } from '../lib/radarService'
import { daysUntil } from '../config/time'
import {
  getProfile,
  getUploads,
  getApplications,
  getSubscription,
  getSavedTenderIds,
  getLikedTenderIds,
  getAllNotes,
  getRecentTenders,
} from '../lib/store'

const STATUS_LABELS = { draft: 'Entwurf', in_progress: 'In Bearbeitung', submitted: 'Eingereicht', won: 'Gewonnen', lost: 'Verloren' }
const REQUIRED_UPLOADS = ['handelsregister', 'versicherung', 'referenzliste']

export default function Dashboard() {
  const location = useLocation()
  const [, setRefreshKey] = useState(0)

  useEffect(() => {
    setRefreshKey((k) => k + 1)
  }, [location.pathname])

  const profile = getProfile()
  const uploads = getUploads()
  const applications = getApplications()
  const subscription = getSubscription()
  const savedIds = getSavedTenderIds()
  const likedIds = getLikedTenderIds()
  const notes = getAllNotes()
  const recent = getRecentTenders()

  const profileComplete = !!(
    profile.unternehmensname?.trim() &&
    profile.rechtsform &&
    profile.ansprechpartner?.trim() &&
    profile.email?.trim() &&
    profile.region?.length &&
    profile.gewerke?.length &&
    profile.unternehmensgroesse
  )

  const requiredUploaded = REQUIRED_UPLOADS.every((id) => uploads[id])
  const missingUploads = REQUIRED_UPLOADS.filter((id) => !uploads[id])

  const activeApps = Object.entries(applications).filter(
    ([, v]) => v.status === 'in_progress' || v.status === 'submitted' || v.status === 'draft'
  )
  const wonCount = Object.values(applications).filter((v) => v.status === 'won').length
  const lostCount = Object.values(applications).filter((v) => v.status === 'lost').length

  const pinnedNotes = notes.filter(
    (n) =>
      n.pinned &&
      typeof n.tenderId === 'string' &&
      n.tenderId &&
      typeof n.text === 'string' &&
      n.text.trim().length > 0
  )
  const savedTenders = savedIds.map((id) => MOCK_TENDERS.find((t) => t.id === id)).filter(Boolean)
  const likedTenders = likedIds.map((id) => MOCK_TENDERS.find((t) => t.id === id)).filter(Boolean)
  const recentTenders = recent
    .slice(0, 5)
    .map((r) => MOCK_TENDERS.find((t) => t.id === r.id))
    .filter(Boolean)

  const used = subscription.usedThisMonth || 0
  const quota = subscription.monthlyQuota || 20
  const resetDate = subscription.resetISO ? new Date(subscription.resetISO).toLocaleDateString('de-DE') : '–'

  const formatVol = (n) => (n >= 1000000 ? `${(n / 1000000).toFixed(1)} Mio €` : `${(n / 1000).toFixed(0)}k €`)

  const nextSteps = []
  if (!requiredUploaded) nextSteps.push({ label: 'Dokumente hochladen', href: '/onboarding' })
  if (savedIds.length === 0) nextSteps.push({ label: 'Radar öffnen und Ausschreibungen speichern', href: '/radar' })
  if (activeApps.length === 0) nextSteps.push({ label: 'Bewerbungsprozess starten', href: '/radar' })

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-b from-white to-blue-50/80">
        <Topbar />

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm p-4 shadow-sm">
                <p className="text-sm text-gray-500">Aktive Bewerbungen</p>
                <p className="text-2xl font-bold text-protender-blue">{activeApps.length}</p>
              </div>
              <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm p-4 shadow-sm">
                <p className="text-sm text-gray-500">Gewonnen / Verloren</p>
                <p className="text-2xl font-bold text-green-600">{wonCount} / <span className="text-red-600">{lostCount}</span></p>
              </div>
              <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm p-4 shadow-sm">
                <p className="text-sm text-gray-500">Gespeichert</p>
                <p className="text-2xl font-bold text-protender-blue">{savedIds.length}</p>
              </div>
              <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm p-4 shadow-sm">
                <p className="text-sm text-gray-500">Notizen (Pinned)</p>
                <p className="text-2xl font-bold text-protender-blue">{pinnedNotes.length}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm p-5 shadow-sm">
              <h2 className="font-bold text-protender-blue mb-4">Abo & Nutzung</h2>
              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <p className="text-sm text-gray-500">Plan</p>
                  <p className="font-bold text-gray-900">{subscription.plan}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Teilnahmen diesen Monat</p>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className="h-full bg-protender-blue rounded-full"
                        style={{ width: `${Math.min(100, (used / quota) * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{used} / {quota}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Zurücksetzung</p>
                  <p className="text-sm font-medium">{resetDate}</p>
                </div>
                <Link
                  to="#"
                  className="ml-auto px-4 py-2 rounded-xl bg-protender-yellow text-protender-blue font-semibold text-sm hover:bg-protender-yellow-hover transition-colors"
                >
                  Abo verwalten
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm p-5 shadow-sm">
              <h2 className="font-bold text-protender-blue mb-4">Laufende Bewerbungen</h2>
              {activeApps.length === 0 ? (
                <p className="text-gray-500 py-4">Noch keine aktiven Bewerbungen.</p>
              ) : (
                <ul className="space-y-3">
                  {activeApps.map(([tenderId, app]) => {
                    const t = MOCK_TENDERS.find((x) => x.id === tenderId)
                    const days = t ? daysUntil(t.deadlineISO) : 0
                    return (
                      <li key={tenderId} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100">
                        <div>
                          <p className="font-medium text-gray-900">{t?.title || tenderId}</p>
                          <p className="text-sm text-gray-500">
                            {t ? (days < 0 ? 'Abgelaufen' : `Noch ${days} Tage`) : ''} · {STATUS_LABELS[app.status] || app.status}
                          </p>
                        </div>
                        <Link
                          to={`/tender/${tenderId}`}
                          className="text-protender-blue font-medium text-sm hover:underline"
                        >
                          Weiterarbeiten →
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm p-5 shadow-sm">
                <h2 className="font-bold text-protender-blue mb-4 flex items-center gap-2">
                  <Bookmark className="w-5 h-5" />
                  Gespeichert
                </h2>
                {savedTenders.length === 0 ? (
                  <p className="text-gray-500 py-4">Keine gespeicherten Ausschreibungen.</p>
                ) : (
                  <ul className="space-y-2">
                    {savedTenders.map((t) => (
                      <li key={t.id}>
                        <Link
                          to={`/tender/${t.id}`}
                          className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50"
                        >
                          <span className="font-medium text-gray-900 line-clamp-1">{t.title}</span>
                          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        </Link>
                        <p className="text-xs text-gray-500 pl-3">Score {computeTenderScore(t, profile)} · {formatVol(t.volumeEur)}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm p-5 shadow-sm">
                <h2 className="font-bold text-protender-blue mb-4 flex items-center gap-2">
                  <ThumbsUp className="w-5 h-5" />
                  Geliked
                </h2>
                {likedTenders.length === 0 ? (
                  <p className="text-gray-500 py-4">Noch keine gelikten Ausschreibungen.</p>
                ) : (
                  <ul className="space-y-2">
                    {likedTenders.map((t) => (
                      <li key={t.id}>
                        <Link
                          to={`/tender/${t.id}`}
                          className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50"
                        >
                          <span className="font-medium text-gray-900 line-clamp-1">{t.title}</span>
                          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm p-5 shadow-sm">
              <h2 className="font-bold text-protender-blue mb-4 flex items-center gap-2">
                <StickyNote className="w-5 h-5" />
                Notizen
              </h2>
              {pinnedNotes.length === 0 ? (
                <p className="text-gray-500 py-4">Keine Notizen.</p>
              ) : (
                <ul className="space-y-3">
                  {pinnedNotes.map((n) => {
                    const t = MOCK_TENDERS.find((x) => x.id === n.tenderId)
                    return (
                      <li key={n.tenderId}>
                        <Link
                          to={`/tender/${n.tenderId}`}
                          className="block p-3 rounded-xl hover:bg-gray-50"
                        >
                          <p className="font-medium text-gray-900">{t?.title || n.tenderId}</p>
                          <p className="text-sm text-gray-600 line-clamp-2 mt-0.5">{n.text || '(leer)'}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {n.updatedAtISO ? new Date(n.updatedAtISO).toLocaleString('de-DE') : ''}
                            {n.pinned && ' · Pin'}
                          </p>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm p-5 shadow-sm">
              <h2 className="font-bold text-protender-blue mb-4 flex items-center gap-2">
                <FileCheck className="w-5 h-5" />
                Unternehmens-Setup
              </h2>
              <div className="space-y-3">
                <div className={`flex items-center gap-3 p-3 rounded-xl ${profileComplete ? 'bg-green-50' : 'bg-amber-50'}`}>
                  {profileComplete ? (
                    <span className="text-green-600">✓</span>
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                  )}
                  <span className="font-medium">{profileComplete ? 'Profil vollständig' : 'Profil unvollständig'}</span>
                  {!profileComplete && (
                    <Link to="/onboarding" className="ml-auto text-sm text-protender-blue font-medium hover:underline">
                      Jetzt vervollständigen
                    </Link>
                  )}
                </div>
                <div className={`flex items-center gap-3 p-3 rounded-xl ${requiredUploaded ? 'bg-green-50' : 'bg-red-50'}`}>
                  {requiredUploaded ? (
                    <span className="text-green-600">✓</span>
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="font-medium">
                    {requiredUploaded ? 'Pflichtdokumente hochgeladen' : `${missingUploads.length} fehlende Pflichtdokumente`}
                  </span>
                  {!requiredUploaded && (
                    <Link to="/onboarding" className="ml-auto px-4 py-2 rounded-xl bg-protender-yellow text-protender-blue font-semibold text-sm hover:bg-protender-yellow-hover">
                      Jetzt hochladen
                    </Link>
                  )}
                </div>
                {missingUploads.length > 0 && (
                  <div className="flex flex-wrap gap-2 pl-8">
                    {missingUploads.map((id) => (
                      <span key={id} className="px-2 py-1 rounded-lg bg-red-100 text-red-700 text-sm">
                        {id}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm p-5 shadow-sm">
              <h2 className="font-bold text-protender-blue mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Zuletzt angesehen
              </h2>
              {recentTenders.length === 0 ? (
                <p className="text-gray-500 py-4">Noch keine angesehenen Ausschreibungen.</p>
              ) : (
                <ul className="space-y-2">
                  {recentTenders.map((t) => (
                    <li key={t.id}>
                      <Link
                        to={`/tender/${t.id}`}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50"
                      >
                        <span className="font-medium text-gray-900 line-clamp-1">{t.title}</span>
                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {nextSteps.length > 0 && (
              <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm p-5 shadow-sm">
                <h2 className="font-bold text-protender-blue mb-4">Empfohlene nächste Schritte</h2>
                <ul className="space-y-2">
                  {nextSteps.map((step) => (
                    <li key={step.label}>
                      <Link
                        to={step.href}
                        className="flex items-center gap-2 text-protender-blue font-medium hover:underline"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {step.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
