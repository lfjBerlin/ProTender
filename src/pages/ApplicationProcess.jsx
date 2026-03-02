import { useParams, Link, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState, useCallback } from 'react'
import {
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  FileWarning,
  ExternalLink,
  Send,
} from 'lucide-react'
import { MOCK_TENDERS } from '../data/tenders'
import { getUploads, upsertApplication, incrementUsedAnalysis } from '../lib/store'
import {
  STEPS,
  STEP_KEYS,
  getOrInitAppState,
  getAppState,
  resetApp,
  startStep,
  tickStep,
  setAutoRun,
  setPaused,
  canStartStep,
  getCurrentStepIndex,
  getNextStepKey,
  updateCalcOutput,
  updateBidderOutput,
} from '../lib/applicationEngine'
import { daysUntil } from '../config/time'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import TopProcessBar from '../components/process/TopProcessBar'
import ProcessBoard from '../components/process/ProcessBoard'
import ProgressBar from '../components/process/ProgressBar'
import ProgressLog from '../components/process/ProgressLog'
import LVTable, { computeTotals } from '../components/process/LVTable'
import SummaryBox from '../components/process/SummaryBox'

const UPLOAD_LABELS = {
  handelsregister: 'Handelsregister/Gewerbe',
  versicherung: 'Versicherung',
  referenzliste: 'Referenzen',
}

function buildMockLVPositions(tenderId) {
  const base = (tenderId || 't1').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const pos = [
    { kurztext: 'Erdarbeiten', menge: 120, einheit: 'm³', ep: 18.5, kommentar: null },
    { kurztext: 'Betonarbeiten C20/25', menge: 45, einheit: 'm³', ep: 185, kommentar: null },
    { kurztext: 'Bewehrungsarbeiten', menge: 3.2, einheit: 't', ep: 1200, kommentar: null },
    { kurztext: 'Schalungsarbeiten', menge: 280, einheit: 'm²', ep: 42, kommentar: null },
    { kurztext: 'Asphaltdecke 4 cm', menge: 850, einheit: 'm²', ep: 28, kommentar: null },
    { kurztext: 'Randsteine', menge: 180, einheit: 'lfm', ep: 35, kommentar: null },
    { kurztext: 'Entwässerung DN300', menge: 45, einheit: 'lfm', ep: 85, kommentar: null },
    { kurztext: 'Markierungsarbeiten', menge: 320, einheit: 'm²', ep: 8.5, kommentar: null },
    { kurztext: 'Temporäre Beschilderung', menge: 1, einheit: 'Pauschal', ep: 4500, kommentar: null },
    { kurztext: 'Sicherungsmaßnahmen', menge: 1, einheit: 'Pauschal', ep: 2800, kommentar: null },
    { kurztext: 'Baustelleneinrichtung', menge: 1, einheit: 'Pauschal', ep: 5200, kommentar: null },
    { kurztext: 'Restarbeiten', menge: 1, einheit: 'Pauschal', ep: 3500, kommentar: null },
    { kurztext: 'Nachunternehmeranteil', menge: 1, einheit: 'Pauschal', ep: 18000, kommentar: null },
    { kurztext: 'Gleisbaubetrieb', menge: 80, einheit: 'm', ep: 320, kommentar: null },
    { kurztext: 'Oberbauarbeiten', menge: 120, einheit: 'm³', ep: 45, kommentar: null },
    { kurztext: 'Drainage', menge: 60, einheit: 'lfm', ep: 95, kommentar: null },
    { kurztext: 'Pflasterarbeiten', menge: 450, einheit: 'm²', ep: 52, kommentar: null },
    { kurztext: 'Begrünung', menge: 120, einheit: 'm²', ep: 18, kommentar: null },
  ]
  const count = 16 + (base % 9)
  return pos.slice(0, count).map((p, i) => ({
    id: `pos-${i}`,
    pos: String(i + 1).padStart(3, '0'),
    kurztext: p.kurztext,
    menge: p.menge,
    einheit: p.einheit,
    ep: p.ep,
    kommentar: base % 5 === i ? 'Auffällig: Prüfen' : p.kommentar,
  }))
}

const TICK_MS = 200
const INITIAL_DELAY_MS = 2000
const AUTO_ADVANCE_DELAY_MS = 900

export default function ApplicationProcess() {
  const { id } = useParams()
  const navigate = useNavigate()
  const tender = MOCK_TENDERS.find((t) => t.id === id)
  const uploads = getUploads()

  const [state, setState] = useState(() => (id ? getOrInitAppState(id) : null))
  const [expandedKey, setExpandedKey] = useState(null)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const intervalRef = useRef(null)
  const advanceTimeoutRef = useRef(null)
  const initTimeoutRef = useRef(null)
  const initDoneRef = useRef(false)

  const refreshState = useCallback(() => {
    if (!id) return
    setState(getOrInitAppState(id))
  }, [id])

  // Initial 2s delay, then auto-start Analyse (only if fresh start)
  useEffect(() => {
    if (!id || !tender || initDoneRef.current) return
    const s = getOrInitAppState(id)
    setState(s)
    setExpandedKey(s.expandedKey || s.lastCompletedKey || STEP_KEYS[0])

    const shouldAutoStart =
      s.statuses?.analysis === 'idle' &&
      !s.lastCompletedKey &&
      !s.activeKey

    if (!shouldAutoStart) {
      initDoneRef.current = true
      return
    }
    initTimeoutRef.current = setTimeout(() => {
      initDoneRef.current = true
      const next = startStep(id, 'analysis')
      setState(next)
      setExpandedKey('analysis')
    }, INITIAL_DELAY_MS)
    return () => {
      if (initTimeoutRef.current) clearTimeout(initTimeoutRef.current)
    }
  }, [id, tender?.id])

  // Single interval tick (stable: only id in deps)
  useEffect(() => {
    if (!id) return
    const tenderData = MOCK_TENDERS.find((t) => t.id === id)
    if (!tenderData) return

    const doTick = () => {
      const s = getAppState(id)
      if (!s || s.paused) return

      const getCalcOutput = () => {
        const rows = s.outputs?.calc?.rows?.length ? s.outputs.calc.rows : buildMockLVPositions(id)
        return { rows, totals: computeTotals(rows) }
      }

      const result = tickStep(id, {
        tender: tenderData,
        uploads: getUploads(),
        getCalcOutput,
      })
      if (result.state) {
        setState(result.state)
        if (result.completed) setExpandedKey(result.state.lastCompletedKey)
      }
      if (result.completed && result.nextKey && s.autoRun) {
        advanceTimeoutRef.current = setTimeout(() => {
          const next = startStep(id, result.nextKey)
          setState(next)
          setExpandedKey(result.nextKey)
        }, AUTO_ADVANCE_DELAY_MS)
      }
    }

    intervalRef.current = setInterval(doTick, TICK_MS)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current)
    }
  }, [id])

  const handleWeiter = useCallback(() => {
    if (!id) return
    const s = getAppState(id)
    const nextKey = getNextStepKey(s.lastCompletedKey)
    const canProceed =
      !s.autoRun &&
      s.lastCompletedKey &&
      nextKey &&
      s.statuses?.[nextKey] === 'idle'
    if (!canProceed) return
    const next = startStep(id, nextKey)
    setState(next)
    setExpandedKey(nextKey)
  }, [id])

  const handleReset = useCallback(() => {
    if (!id) return
    initDoneRef.current = true
    const next = resetApp(id)
    setState(next)
    setExpandedKey('analysis')
    setTimeout(() => {
      const started = startStep(id, 'analysis')
      setState(started)
      setExpandedKey('analysis')
    }, 800)
  }, [id])

  const handleLVRowsChange = useCallback((rows) => {
    if (!id) return
    const totals = computeTotals(rows)
    const next = updateCalcOutput(id, { rows, totals })
    setState(next)
  }, [id])

  const handleSubmit = useCallback(() => {
    if (!tender?.id) return
    upsertApplication(tender.id, 'submitted')
    incrementUsedAnalysis()
    setShowSubmitModal(true)
  }, [tender?.id])

  const handleCloseModal = useCallback(() => {
    setShowSubmitModal(false)
    navigate('/dashboard')
  }, [navigate])

  if (!tender) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1 flex flex-col bg-gradient-to-b from-white to-blue-50/80">
          <Topbar />
          <main className="flex-1 p-8 flex items-center justify-center">
            <p className="text-gray-600">Ausschreibung nicht gefunden.</p>
            <Link to="/radar" className="text-protender-blue hover:underline ml-2">Zum Radar</Link>
          </main>
        </div>
      </div>
    )
  }

  const days = daysUntil(tender.deadlineISO)
  const isOverdue = days < 0
  const currentIdx = state ? getCurrentStepIndex(state) : 0
  const complianceOutput = state?.outputs?.compliance ?? { completenessPct: 0, missingDocs: [] }
  const nextKey = state ? getNextStepKey(state.lastCompletedKey) : null
  const canProceed =
    !state?.autoRun &&
    state?.lastCompletedKey &&
    nextKey &&
    state?.statuses?.[nextKey] === 'idle'
  const weiterEnabled = !!canProceed

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-b from-white to-blue-50/80">
        <Topbar />
        <main className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6">
            <nav className="text-sm text-gray-500 mb-2 flex items-center gap-1">
              <Link to="/radar" className="hover:text-protender-blue">Radar</Link>
              <ChevronRight className="w-4 h-4" />
              <Link to={`/tender/${tender.id}`} className="hover:text-protender-blue">Ausschreibung</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-700">Bewerbungsprozess</span>
            </nav>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-protender-blue mb-1">{tender.title}</h1>
                <div className="flex items-center gap-3 text-sm">
                  <span className={isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}>
                    {isOverdue ? 'Frist abgelaufen' : `Noch ${days} Tage`}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TopProcessBar
                  stepIndex={currentIdx}
                  totalSteps={STEPS.length}
                  autoRun={state?.autoRun}
                  onAutoRunChange={(v) => {
                  const newState = setAutoRun(id, v)
                  setState(newState)
                  if (newState?.activeKey) setExpandedKey(newState.activeKey)
                }}
                  paused={state?.paused}
                  onPauseToggle={() => { setPaused(id, !state?.paused); refreshState() }}
                  weiterEnabled={weiterEnabled}
                  onWeiter={handleWeiter}
                  onReset={handleReset}
                  showWeiter={!state?.autoRun}
                />
                <Link
                  to={`/tender/${tender.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Zurück zur Ausschreibung
                </Link>
              </div>
            </div>

            <ProcessBoard
              steps={STEPS}
              state={state}
              expandedKey={expandedKey}
              onToggleExpand={(key) => setExpandedKey((p) => (p === key ? null : key))}
              canStartStep={canStartStep}
              renderStepContent={(step) => {
                const progress = state?.progress?.[step.key] ?? 0
                const output = state?.outputs?.[step.key] ?? {}
                const status = state?.statuses?.[step.key] ?? 'idle'
                const isDone = status === 'done'

                return (
                  <>
                    {step.key === 'analysis' && (
                      <div className="space-y-4">
                        {status === 'running' && (
                          <>
                            <ProgressBar value={progress} />
                            <ProgressLog lines={state?.logs?.analysis ?? []} />
                          </>
                        )}
                        {isDone && (
                          <>
                            <SummaryBox title="Management Summary">
                              <ul className="space-y-1 text-sm list-disc list-inside">
                                {(output.managementSummary ?? []).map((s, i) => (
                                  <li key={i}>{s}</li>
                                ))}
                              </ul>
                            </SummaryBox>
                            <SummaryBox title="Risiko-Ampel">
                              <div className="flex gap-4 text-sm">
                                <span>Hoch: {output.riskSummary?.high ?? 0}</span>
                                <span>Mittel: {output.riskSummary?.medium ?? 0}</span>
                                <span>Niedrig: {output.riskSummary?.low ?? 0}</span>
                              </div>
                            </SummaryBox>
                            <SummaryBox title="Empfehlung" variant={output.recommendation === 'Nicht empfohlen' ? 'error' : output.recommendation === 'Bedingt' ? 'warning' : 'success'}>
                              <p className="font-medium">{output.recommendation ?? '–'}</p>
                            </SummaryBox>
                          </>
                        )}
                      </div>
                    )}

                    {step.key === 'calc' && (
                      <div className="space-y-4">
                        {status === 'running' && (
                          <>
                            <ProgressBar value={progress} />
                            <p className="text-sm text-gray-500">LV-Positionen werden geladen …</p>
                            <LVTable
                              rows={buildMockLVPositions(tender.id)}
                              visibleCount={Math.max(1, Math.floor((progress / 100) * 20))}
                              totalRows={20}
                            />
                          </>
                        )}
                        {isDone && (
                          <>
                            <LVTable
                              rows={output.rows ?? buildMockLVPositions(tender.id)}
                              editable
                              onRowsChange={handleLVRowsChange}
                              totals={output.totals}
                            />
                            <div className="flex gap-2">
                              <button type="button" className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm">GAEB exportieren</button>
                              <button type="button" className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm">Kalkulationsbericht (PDF)</button>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {step.key === 'compliance' && (
                      <div className="space-y-4">
                        {status === 'running' && (
                          <>
                            <ProgressBar value={progress} />
                            <p className="text-sm text-gray-500">Unterlagen werden geprüft …</p>
                          </>
                        )}
                        {isDone && (
                          <>
                            <div>
                              <h4 className="font-semibold mb-2">Pflichtdokumente</h4>
                              <ul className="space-y-2">
                                {['handelsregister', 'versicherung', 'referenzliste'].map((rid) => {
                                  const ok = !!uploads[rid]
                                  return (
                                    <li key={rid} className="flex items-center gap-2">
                                      {ok ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <FileWarning className="w-5 h-5 text-amber-500" />}
                                      <span className={ok ? 'text-gray-700' : 'text-amber-700'}>{UPLOAD_LABELS[rid] || rid}</span>
                                    </li>
                                  )
                                })}
                              </ul>
                            </div>
                            <p className="text-sm text-gray-600">Vollständigkeit: {output.completenessPct ?? 0}%</p>
                            {(output.missingDocs ?? []).length > 0 && (
                              <>
                                <Link to="/onboarding" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-protender-yellow hover:bg-protender-yellow-hover text-protender-blue font-medium">
                                  Jetzt im Profil hochladen
                                  <ExternalLink className="w-4 h-4" />
                                </Link>
                                <p className="text-xs text-amber-700">In der echten Version würde Submission blockieren, bis Pflichtdokumente vorliegen.</p>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {step.key === 'bidder' && (
                      <div className="space-y-4">
                        {status === 'running' && (
                          <>
                            <ProgressBar value={progress} />
                            <p className="text-sm text-gray-500">Fragen werden vorgeschlagen …</p>
                          </>
                        )}
                        {isDone && (
                          <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                            {(output.questions ?? []).map((q) => (
                              <div key={q.id} className="flex items-center gap-2 p-3 rounded-lg border border-gray-200">
                                <input
                                  type="checkbox"
                                  checked={!!q.marked}
                                  onChange={() => {
                                    const next = (output.questions ?? []).map((x) =>
                                      x.id === q.id ? { ...x, marked: !x.marked } : x
                                    )
                                    const st = updateBidderOutput(id, next)
                                    setState(st)
                                  }}
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{q.text ?? ''}</p>
                                  <span className="text-xs text-gray-500">{q.prioritaet ?? ''}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {step.key === 'sustainability' && (
                      <div className="space-y-4">
                        {status === 'running' && (
                          <>
                            <ProgressBar value={progress} />
                            <p className="text-sm text-gray-500">CO₂-Bilanz wird berechnet …</p>
                          </>
                        )}
                        {isDone && (
                          <>
                            <SummaryBox title="CO₂-Schätzung">
                              <p className="text-2xl font-bold text-protender-blue">{(output.totalCO2Kg ?? 0).toLocaleString('de-DE')} kg CO₂e</p>
                            </SummaryBox>
                            <SummaryBox title="Top-Treiber">
                              <ul className="text-sm space-y-1">
                                {(output.topDrivers ?? []).map((d, i) => (
                                  <li key={i}>• {d}</li>
                                ))}
                              </ul>
                            </SummaryBox>
                            <button type="button" className="px-4 py-2 rounded-lg bg-gray-100 text-sm">CO₂-Bericht exportieren</button>
                          </>
                        )}
                      </div>
                    )}

                    {step.key === 'submission' && (
                      <div className="space-y-4">
                        {status === 'running' && (
                          <>
                            <ProgressBar value={progress} />
                            <p className="text-sm text-gray-500">Finale Prüfung …</p>
                          </>
                        )}
                        {isDone && output.ready && (
                          <>
                            <ul className="space-y-2">
                              {['analysis', 'calc', 'compliance'].map((k) => (
                                <li key={k} className="flex items-center gap-2">
                                  {state?.statuses?.[k] === 'done' ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <AlertTriangle className="w-5 h-5 text-amber-500" />}
                                  <span>{STEPS.find((s) => s.key === k)?.title}</span>
                                </li>
                              ))}
                            </ul>
                            <button
                              type="button"
                              onClick={handleSubmit}
                              className="w-full py-4 rounded-xl font-bold text-lg bg-protender-yellow hover:bg-protender-yellow-hover text-protender-blue flex items-center justify-center gap-2"
                            >
                              <Send className="w-6 h-6" />
                              Angebot einreichen (Dummy)
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </>
                )
              }}
            />
          </div>
        </main>
      </div>

      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={handleCloseModal}>
          <div className="bg-white rounded-2xl p-8 max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-protender-blue mb-2">Angebot eingereicht</h3>
            <p className="text-gray-600 mb-6">Das Angebot wurde erfolgreich eingereicht (Demo).</p>
            <button
              type="button"
              onClick={handleCloseModal}
              className="w-full py-3 rounded-xl bg-protender-yellow hover:bg-protender-yellow-hover text-protender-blue font-medium"
            >
              Zum Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
