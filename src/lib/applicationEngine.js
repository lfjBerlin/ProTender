/**
 * Application process engine. Persists to localStorage (protender:application:{id}:state).
 * API: getOrInitAppState, startStep, tickStep, setAutoRun, setPaused, resetApp, updateCalcLineItem.
 */

import { demoNow } from '../config/time'
import { getApplicationState, setApplicationState, appendApplicationEvent } from './store'

const STEP_EVENT_TYPES = {
  analysis: 'analysis_done',
  calc: 'calc_updated',
  compliance: 'compliance_done',
  bidder: 'bidder_questions_done',
  sustainability: 'sustainability_done',
  submission: 'submission_ready',
}

export const STEPS = [
  { key: 'analysis', title: 'Analyse', icon: 'FileSearch', durationMs: 10000, requires: [] },
  { key: 'calc', title: 'LV-Kalkulation', icon: 'Calculator', durationMs: 17000, requires: ['analysis'] },
  { key: 'compliance', title: 'Compliance & Vollständigkeit', icon: 'ShieldCheck', durationMs: 10000, requires: ['calc'] },
  { key: 'bidder', title: 'Bieterfragen', icon: 'MessageCircleQuestion', durationMs: 8000, requires: ['compliance'] },
  { key: 'sustainability', title: 'Nachhaltigkeit', icon: 'Leaf', durationMs: 10000, requires: ['compliance'] },
  { key: 'submission', title: 'Submission-Ready', icon: 'Send', durationMs: 6000, requires: ['calc', 'compliance'] },
]

export const STEP_KEYS = ['analysis', 'calc', 'compliance', 'bidder', 'sustainability', 'submission']

export function getNextStepKey(currentKey) {
  const i = STEP_KEYS.indexOf(currentKey)
  if (i === -1 || i === STEP_KEYS.length - 1) return null
  return STEP_KEYS[i + 1]
}

function getPreviousStepKey(stepKey) {
  const i = STEP_KEYS.indexOf(stepKey)
  if (i <= 0) return null
  return STEP_KEYS[i - 1]
}

const DEFAULT_OUTPUTS = {
  analysis: { managementSummary: [], riskSummary: { high: 0, medium: 0, low: 0 }, recommendation: null, logs: [] },
  calc: { rows: [], totals: null, anomalies: [] },
  compliance: { completenessPct: 0, missingDocs: [] },
  bidder: { questions: [] },
  sustainability: { totalCO2Kg: 0, topDrivers: [] },
  submission: { ready: false, blockers: [] },
}

const DEFAULT_LOGS = Object.fromEntries(STEP_KEYS.map((k) => [k, []]))

const ANALYSIS_LOGS = [
  'Dokumente geladen (3): Ausschreibungsbeschreibung, LV, Vertragsbedingungen',
  'Leistungsbeschreibung extrahiert',
  'Vertragsklauseln gescannt',
  'Fristen & Eignung geprüft',
  'Risiken klassifiziert',
  'Empfehlung berechnet',
]

function persist(state, tenderId) {
  state.lastUpdatedISO = demoNow().toISOString()
  setApplicationState(tenderId, state)
}

function getStep(stepKey) {
  return STEPS.find((s) => s.key === stepKey)
}

function allRequiresDone(state, step) {
  if (!state?.statuses) return false
  return (step?.requires ?? []).every((r) => state.statuses[r] === 'done')
}

function mergeOutputs(base) {
  const out = {}
  for (const k of STEP_KEYS) {
    const def = DEFAULT_OUTPUTS[k]
    const src = base?.[k]
    out[k] = src && typeof src === 'object' ? { ...def, ...src } : { ...def }
  }
  return out
}

function emptyState() {
  const statuses = {}
  const progress = {}
  for (const k of STEP_KEYS) {
    statuses[k] = 'idle'
    progress[k] = 0
  }
  return {
    activeKey: null,
    lastCompletedKey: null,
    expandedKey: STEP_KEYS[0],
    autoRun: false,
    paused: false,
    statuses,
    progress,
    logs: { ...DEFAULT_LOGS },
    outputs: mergeOutputs({}),
    stepStartMs: null,
    lastUpdatedISO: demoNow().toISOString(),
  }
}

function normalize(state) {
  const base = state && typeof state === 'object' ? state : {}
  const out = emptyState()
  Object.assign(out.statuses, base.statuses)
  Object.assign(out.progress, base.progress)
  if (base.logs && typeof base.logs === 'object') {
    for (const k of STEP_KEYS) {
      if (Array.isArray(base.logs[k])) out.logs[k] = [...base.logs[k]]
    }
  }
  out.outputs = mergeOutputs(base.outputs)
  out.activeKey = base.activeKey ?? null
  out.lastCompletedKey = base.lastCompletedKey ?? null
  out.expandedKey = base.expandedKey ?? base.lastCompletedKey ?? base.activeKey ?? STEP_KEYS[0]
  out.autoRun = !!base.autoRun
  out.paused = !!base.paused
  out.stepStartMs = base.stepStartMs ?? null
  out.lastUpdatedISO = base.lastUpdatedISO ?? demoNow().toISOString()
  return out
}

function generateStepOutput(stepKey, tender, uploads, calcOutput = null) {
  const def = DEFAULT_OUTPUTS[stepKey]
  switch (stepKey) {
    case 'analysis': {
      const risks = tender?.risks || []
      const byLevel = { high: 0, medium: 0, low: 0 }
      risks.forEach((r) => { byLevel[r?.level] = (byLevel[r?.level] || 0) + 1 })
      const high = byLevel.high || 0
      const recommendation = high >= 2 ? 'Nicht empfohlen' : high >= 1 ? 'Bedingt' : 'Empfohlen'
      const docNames = (tender?.documents || []).slice(0, 3).map((d) => d?.name?.replace(/\.[^.]+$/, '') || 'Dokument').join(', ') || 'Ausschreibungsbeschreibung, LV, Vertragsbedingungen'
      return {
        ...def,
        managementSummary: [
          'Dokumentenanalyse abgeschlossen',
          'Leistungsbeschreibung extrahiert und klassifiziert',
          'Vertragsklauseln geprüft',
          'Risiken kategorisiert (Hoch/Mittel/Niedrig)',
          `Empfehlung: ${recommendation}`,
        ],
        riskSummary: byLevel,
        recommendation,
      }
    }
    case 'calc':
      return { ...def, ...(calcOutput || {}) }
    case 'compliance': {
      const required = ['handelsregister', 'versicherung', 'referenzliste']
      const missing = required.filter((rid) => !uploads?.[rid])
      const completenessPct = Math.round(((required.length - missing.length) / required.length) * 100)
      return { ...def, completenessPct, missingDocs: missing }
    }
    case 'bidder':
      return {
        ...def,
        questions: [
          { id: 'q1', text: 'Ist die Mengenangabe in Pos. 012 verbindlich?', prioritaet: 'Hoch', marked: false },
          { id: 'q2', text: 'Werden Nachunternehmeranteile separat bewertet?', prioritaet: 'Mittel', marked: false },
          { id: 'q3', text: 'An welchem Tag ist die Ortsbesichtigung?', prioritaet: 'Hoch', marked: false },
          { id: 'q4', text: 'Gilt die Nachhaltigkeitsanforderung für alle Lose?', prioritaet: 'Niedrig', marked: false },
        ],
      }
    case 'sustainability':
      return {
        ...def,
        totalCO2Kg: (tender?.id?.length || 2) * 1200,
        topDrivers: ['Beton & Zement', 'Transport', 'Asphalt'],
      }
    case 'submission':
      return { ...def, ready: true }
    default:
      return { ...def }
  }
}

// --- Public API ---

export function getAppState(tenderId) {
  if (!tenderId) return normalize(null)
  const raw = getApplicationState(tenderId)
  return normalize(raw)
}

export function getOrInitAppState(tenderId) {
  if (!tenderId) return normalize(null)
  const raw = getApplicationState(tenderId)
  const state = normalize(raw)
  persist(state, tenderId)
  return state
}

export function startStep(tenderId, stepKey) {
  const state = normalize(getApplicationState(tenderId) || emptyState())
  if (state.activeKey) return state
  const step = getStep(stepKey)
  if (!step) return state
  const prev = getPreviousStepKey(stepKey)
  if (prev && state.statuses[prev] !== 'done') return state
  if (state.statuses[stepKey] === 'done') return state

  state.activeKey = stepKey
  state.statuses[stepKey] = 'running'
  state.progress[stepKey] = 0
  state.logs[stepKey] = []
  state.stepStartMs = Date.now()
  state.expandedKey = stepKey
  persist(state, tenderId)
  return state
}

/**
 * tickStep(tenderId, ctx) - ctx = { tender, uploads, getCalcOutput }
 * Returns { state, completed, nextKey }
 */
export function tickStep(tenderId, ctx = {}) {
  const { tender = {}, uploads = {}, getCalcOutput } = ctx
  const state = normalize(getApplicationState(tenderId) || emptyState())
  if (state.paused) return { state, completed: false, nextKey: null }

  const stepKey = state.activeKey
  const status = state.statuses?.[stepKey]
  const step = getStep(stepKey)

  if (status !== 'running' || !step) {
    return { state, completed: false, nextKey: null }
  }

  const now = Date.now()
  const start = state.stepStartMs ?? now
  const elapsed = now - start
  const pct = Math.min(100, Math.floor((elapsed / step.durationMs) * 100))
  state.progress[stepKey] = pct

  if (stepKey === 'analysis' && Array.isArray(state.logs[stepKey])) {
    const logIndex = Math.floor((pct / 100) * ANALYSIS_LOGS.length)
    while (state.logs[stepKey].length < logIndex && state.logs[stepKey].length < ANALYSIS_LOGS.length) {
      state.logs[stepKey].push(ANALYSIS_LOGS[state.logs[stepKey].length])
    }
  }

  if (pct >= 100) {
    const calcOutput = stepKey === 'calc' && typeof getCalcOutput === 'function' ? getCalcOutput() : null
    state.statuses[stepKey] = 'done'
    state.progress[stepKey] = 100
    state.outputs[stepKey] = generateStepOutput(stepKey, tender, uploads, calcOutput)
    state.lastCompletedKey = stepKey
    state.activeKey = null
    state.stepStartMs = null
    const eventType = STEP_EVENT_TYPES[stepKey] || `${stepKey}_done`
    appendApplicationEvent(tenderId, { type: eventType })
    persist(state, tenderId)
    return { state, completed: true, nextKey: getNextStepKey(stepKey) }
  }

  persist(state, tenderId)
  return { state, completed: false, nextKey: null }
}

export function setAutoRun(tenderId, value) {
  const state = normalize(getApplicationState(tenderId) || emptyState())
  state.autoRun = !!value
  persist(state, tenderId)

  if (value && state.activeKey === null && state.lastCompletedKey) {
    const next = getNextStepKey(state.lastCompletedKey)
    if (next && state.statuses[next] === 'idle') {
      return startStep(tenderId, next)
    }
  }
  return getAppState(tenderId)
}

export function setPaused(tenderId, value) {
  const state = normalize(getApplicationState(tenderId) || emptyState())
  state.paused = !!value
  persist(state, tenderId)
  return state
}

export function resetApp(tenderId) {
  const existing = getApplicationState(tenderId)
  const keepAutoRun = existing?.autoRun === true
  const state = emptyState()
  state.autoRun = keepAutoRun
  persist(state, tenderId)
  return state
}


export function canStartStep(state, stepKey) {
  if (!state || typeof state !== 'object') return false
  const step = getStep(stepKey)
  if (!step) return false
  return allRequiresDone(state, step)
}

export function getCurrentStepIndex(state) {
  if (state?.activeKey) return STEP_KEYS.indexOf(state.activeKey)
  if (state?.lastCompletedKey) return STEP_KEYS.indexOf(state.lastCompletedKey)
  return 0
}

export function isCurrentStepDone(state) {
  return !!state?.lastCompletedKey
}

export function updateCalcOutput(tenderId, calcOutput) {
  const state = normalize(getApplicationState(tenderId) || emptyState())
  state.outputs.calc = { ...DEFAULT_OUTPUTS.calc, ...calcOutput }
  persist(state, tenderId)
  return state
}

export function updateCalcLineItem(tenderId, rowId, patch) {
  const state = normalize(getApplicationState(tenderId) || emptyState())
  const rows = state.outputs?.calc?.rows ?? []
  const next = rows.map((r) => (r.id === rowId ? { ...r, ...patch } : r))
  state.outputs.calc = { ...state.outputs.calc, rows: next }
  persist(state, tenderId)
  return state
}

export function updateBidderOutput(tenderId, questions) {
  const state = normalize(getApplicationState(tenderId) || emptyState())
  state.outputs.bidder = { ...state.outputs.bidder, questions }
  persist(state, tenderId)
  return state
}
