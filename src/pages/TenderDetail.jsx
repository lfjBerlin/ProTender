import { useParams, useLocation, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { ClipboardList, FileCheck, MessageSquare, Send } from 'lucide-react'
import { MOCK_TENDERS } from '../data/tenders'
import { markTenderViewed, setLastViewedTenderId, upsertApplication } from '../lib/store'
import { computeTenderScore } from '../lib/radarService'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import TenderHeader from '../components/TenderHeader'
import TenderTimeline from '../components/TenderTimeline'
import TenderTabs from '../components/TenderTabs'
import ChatPanel from '../components/ChatPanel'
import NotesPanel from '../components/NotesPanel'
import WeightBar from '../components/WeightBar'

import { getProfile } from '../lib/store'

function getSimilarTenders(currentId, current) {
  return MOCK_TENDERS.filter(
    (t) => t.id !== currentId && (t.trade === current.trade || t.location === current.location)
  ).slice(0, 3)
}

export default function TenderDetail() {
  const { id } = useParams()
  const location = useLocation()
  const tender = MOCK_TENDERS.find((t) => t.id === id)
  const scoreFromNav = location.state?.score
  const profile = getProfile()
  const score = scoreFromNav ?? (tender ? computeTenderScore(tender, profile) : null)

  useEffect(() => {
    if (tender?.id) {
      markTenderViewed(tender.id)
      setLastViewedTenderId(tender.id)
    }
  }, [tender?.id])

  if (!tender) {
    return (
      <div className="min-h-screen flex w-full max-w-full overflow-x-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-b from-white to-blue-50/80 overflow-x-hidden">
          <Topbar />
          <main className="flex-1 p-8 flex items-center justify-center overflow-x-hidden">
            <div className="text-center">
              <p className="text-xl text-gray-700 mb-4">Ausschreibung nicht gefunden.</p>
              <Link
                to="/radar"
                className="inline-flex items-center gap-2 text-protender-blue hover:underline font-medium"
              >
                Zurück zum Radar
              </Link>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const kf = tender.keyFacts || {}
  const days = Math.ceil((new Date(tender.deadlineISO) - new Date()) / (1000 * 60 * 60 * 24))
  const ampel = days < 0 ? 'red' : days <= 7 ? 'red' : days <= 14 ? 'yellow' : 'green'
  const similar = getSimilarTenders(id, tender)

  const formatVol = (n) => (n >= 1000000 ? `${(n / 1000000).toFixed(1)} Mio €` : `${(n / 1000).toFixed(0)}k €`)
  const formatDate = (iso) => new Date(iso).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="min-h-screen flex w-full max-w-full overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-b from-white to-blue-50/80 overflow-x-hidden">
        <Topbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6 min-w-0 w-full">
            <TenderHeader tender={tender} score={score} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
              <div className="lg:col-span-2 space-y-6 min-w-0 w-full max-w-full">
                <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm p-4 sm:p-6 shadow-sm w-full max-w-full overflow-hidden">
                  <h2 className="font-bold text-protender-blue mb-4">Übersicht</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Vergabestelle</p>
                      <p className="font-medium text-gray-900 break-words">{tender.authority}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Ort</p>
                      <p className="font-medium text-gray-900 break-words">{tender.location}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Volumen</p>
                      <p className="font-medium text-gray-900">{formatVol(tender.volumeEur)}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Frist</p>
                      <p className="font-medium text-gray-900">{formatDate(tender.deadlineISO)}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Veröffentlichung</p>
                      <p className="font-medium text-gray-900">{formatDate(tender.publishedISO)}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Projektstart</p>
                      <p className="font-medium text-gray-900">{formatDate(tender.projectStartISO)}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Dauer</p>
                      <p className="font-medium text-gray-900">{tender.projectDurationWeeks} Wochen</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Los</p>
                      <p className="font-medium text-gray-900 break-words">{kf.lot || '–'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-4" title={ampel === 'green' ? 'Ausreichend Zeit' : ampel === 'yellow' ? 'Bald fällig' : 'Dringend'}>
                    <span className={`w-3 h-3 rounded-full ${ampel === 'green' ? 'bg-green-500' : ampel === 'yellow' ? 'bg-amber-500' : 'bg-red-500'}`} />
                    <span className="text-sm font-medium">
                      {ampel === 'green' ? 'Ausreichend Zeit' : ampel === 'yellow' ? 'Bald fällig' : days < 0 ? 'Frist abgelaufen' : 'Dringend'}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Was ist zu tun?</p>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-protender-blue" />
                        Unterlagen prüfen
                      </li>
                      <li className="flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-protender-blue" />
                        LV kalkulieren
                      </li>
                      <li className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-protender-blue" />
                        Bieterfragen
                      </li>
                      <li className="flex items-center gap-2">
                        <Send className="w-4 h-4 text-protender-blue" />
                        Angebot einreichen
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm p-4 sm:p-6 shadow-sm w-full max-w-full overflow-hidden">
                  <h2 className="font-bold text-protender-blue mb-4">Zuschlagskriterien</h2>
                  <WeightBar
                    priceWeight={tender.evaluation?.priceWeight}
                    qualityWeight={tender.evaluation?.qualityWeight}
                    sustainabilityWeight={tender.evaluation?.sustainabilityWeight}
                  />
                </div>

                <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm p-4 sm:p-6 shadow-sm w-full max-w-full overflow-hidden">
                  <TenderTabs tender={tender} />
                </div>

                <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm p-4 shadow-sm w-full max-w-full overflow-hidden">
                  <h3 className="font-bold text-protender-blue text-sm mb-2">Letzte Änderungen</h3>
                  <p className="text-sm text-gray-500">Keine Änderungen seit Veröffentlichung.</p>
                </div>

                {similar.length > 0 && (
                  <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm p-4 sm:p-6 shadow-sm w-full max-w-full overflow-hidden">
                    <h3 className="font-bold text-protender-blue mb-4">Ähnliche Ausschreibungen</h3>
                    <ul className="space-y-3">
                      {similar.map((t) => (
                        <li key={t.id}>
                          <Link
                            to={`/tender/${t.id}`}
                            state={{ score: computeTenderScore(t, profile) }}
                            className="block p-3 rounded-xl hover:bg-gray-50 transition-colors min-w-0"
                          >
                            <p className="font-medium text-gray-900 break-words">{t.title}</p>
                            <p className="text-sm text-gray-500">{t.location} · {formatVol(t.volumeEur)}</p>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="space-y-6 min-w-0 w-full max-w-full">
                <TenderTimeline
                  publishedISO={tender.publishedISO}
                  deadlineISO={tender.deadlineISO}
                  projectStartISO={tender.projectStartISO}
                />
                <ChatPanel tenderId={tender.id} tender={tender} />
                <NotesPanel tenderId={tender.id} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
