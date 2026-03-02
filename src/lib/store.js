/**
 * Unified ProTender store (localStorage). Backend-ready model.
 * Keys: protender:profile, protender:uploads, protender:tender:feedback, etc.
 */

import { demoNow } from '../config/time'

const NS = 'protender'
const KEYS = {
  profile: `${NS}:profile`,
  uploads: `${NS}:uploads`,
  feedback: `${NS}:tender:feedback`,
  saved: `${NS}:tender:saved`,
  notes: `${NS}:tender:notes`,
  recentTenders: `${NS}:recentTenders`,
  applications: `${NS}:applications`,
  subscription: `${NS}:subscription`,
}

const MAX_RECENT = 20

function getJson(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function setJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

// --- Profile (migrate from protender_onboarding if needed) ---
export function getProfile() {
  let data = getJson(KEYS.profile, null)
  if (data) return data
  try {
    const raw = localStorage.getItem('protender_onboarding')
    if (raw) {
      const legacy = JSON.parse(raw)
      if (legacy.form) {
        data = legacy.form
        setJson(KEYS.profile, data)
        if (legacy.files && Object.keys(legacy.files).length) {
          setJson(KEYS.uploads, legacy.files)
        }
        return data
      }
    }
  } catch {}
  return {}
}

export function setProfile(data) {
  setJson(KEYS.profile, { ...getProfile(), ...data })
}

// --- Uploads (from onboarding) { [id]: { name, size, type, lastModified } } ---
export function getUploads() {
  let data = getJson(KEYS.uploads, null)
  if (data) return data
  try {
    const raw = localStorage.getItem('protender_onboarding')
    if (raw) {
      const legacy = JSON.parse(raw)
      if (legacy.files) {
        setJson(KEYS.uploads, legacy.files)
        return legacy.files
      }
    }
  } catch {}
  return {}
}

export function setUploads(items) {
  setJson(KEYS.uploads, items)
}

// --- Feedback (like/dislike) ---
export function getTenderFeedback(tenderId) {
  const data = getJson(KEYS.feedback, {})
  return data[tenderId] || null
}

export function setTenderFeedback(tenderId, value) {
  const data = getJson(KEYS.feedback, {})
  if (value) data[tenderId] = value
  else delete data[tenderId]
  setJson(KEYS.feedback, data)
}

export function getLikedTenderIds() {
  const data = getJson(KEYS.feedback, {})
  return Object.entries(data).filter(([, v]) => v === 'like').map(([id]) => id)
}

// --- Saved / bookmarked ---
export function getSavedTenderIds() {
  const data = getJson(KEYS.saved, {})
  return Object.keys(data).filter((id) => data[id])
}

export function isTenderSaved(tenderId) {
  const data = getJson(KEYS.saved, {})
  return !!data[tenderId]
}

export function toggleSaveTender(tenderId) {
  const data = getJson(KEYS.saved, {})
  data[tenderId] = data[tenderId] ? false : true
  if (!data[tenderId]) delete data[tenderId]
  setJson(KEYS.saved, data)
}

// --- Notes (unified: { [id]: { text, pinned, updatedAtISO } }) ---
export function getTenderNotes(tenderId) {
  const data = getJson(KEYS.notes, {})
  return data[tenderId]?.text ?? ''
}

export function setTenderNotes(tenderId, text) {
  const data = getJson(KEYS.notes, {})
  const trimmed = (text ?? '').trim()

  // If no text and not pinned, remove the note instead of keeping an empty entry
  if (!trimmed && !data[tenderId]?.pinned) {
    if (data[tenderId]) {
      delete data[tenderId]
      setJson(KEYS.notes, data)
    }
    return
  }

  if (!data[tenderId]) data[tenderId] = {}
  data[tenderId].text = text
  data[tenderId].updatedAtISO = demoNow().toISOString()
  setJson(KEYS.notes, data)
}

export function getTenderNotesSavedAt(tenderId) {
  const data = getJson(KEYS.notes, {})
  return data[tenderId]?.updatedAtISO ?? null
}

export function getTenderPinned(tenderId) {
  const data = getJson(KEYS.notes, {})
  return !!data[tenderId]?.pinned
}

export function setTenderPinned(tenderId, pinned) {
  const data = getJson(KEYS.notes, {})
  if (!data[tenderId]) data[tenderId] = {}
  data[tenderId].pinned = pinned
  setJson(KEYS.notes, data)
}

export function getAllNotes() {
  const data = getJson(KEYS.notes, {})
  return Object.entries(data).map(([id, v]) => ({
    tenderId: id,
    text: v.text,
    pinned: !!v.pinned,
    updatedAtISO: v.updatedAtISO,
  }))
}

// --- Chat (keep separate key for backward compat) ---
const chatKey = (id) => `${NS}:tender:${id}:chat`
export function getTenderChat(tenderId) {
  return getJson(chatKey(tenderId), [])
}

export function appendTenderChatMessage(tenderId, message) {
  const msgs = getTenderChat(tenderId)
  msgs.push({ ...message, id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}` })
  setJson(chatKey(tenderId), msgs)
}

// --- Recent / viewed ---
export function markTenderViewed(tenderId) {
  const list = getJson(KEYS.recentTenders, [])
  const entry = { id: tenderId, viewedAtISO: demoNow().toISOString() }
  const filtered = list.filter((e) => e.id !== tenderId)
  setJson(KEYS.recentTenders, [entry, ...filtered].slice(0, MAX_RECENT))
}

export function getRecentTenders() {
  return getJson(KEYS.recentTenders, [])
}

export function setLastViewedTenderId(tenderId) {
  try {
    localStorage.setItem(`${NS}:lastViewedTenderId`, tenderId)
  } catch {}
}

// --- Applications ---
export function getApplications() {
  const data = getJson(KEYS.applications, {})

  // Seed demo archive entries (idempotent)
  const now = demoNow().toISOString()
  if (!data.t3) {
    data.t3 = {
      status: 'won',
      updatedAtISO: now,
      startedAtISO: now,
      closedAtISO: now,
      responsibleUserId: 'pl1',
      aiOutcomeInsight: null,
      outcomeReasonManual: null,
    }
  }
  if (!data.t12) {
    data.t12 = {
      status: 'lost',
      updatedAtISO: now,
      startedAtISO: now,
      closedAtISO: now,
      responsibleUserId: 'pl2',
      aiOutcomeInsight: null,
      outcomeReasonManual: null,
    }
  }

  setJson(KEYS.applications, data)
  return data
}

export function upsertApplication(tenderId, status, extra = {}) {
  const data = getJson(KEYS.applications, {})
  const now = demoNow().toISOString()
  const existing = data[tenderId] || {}
  data[tenderId] = {
    ...existing,
    status,
    updatedAtISO: now,
    startedAtISO: status === 'in_progress' ? (extra.startedAtISO || existing.startedAtISO || now) : existing.startedAtISO,
    ...extra,
  }
  setJson(KEYS.applications, data)
}

export function getApplication(tenderId) {
  return getJson(KEYS.applications, {})[tenderId] || null
}

// --- Application events (per tender) ---
function applicationEventsKey(tenderId) {
  return `${NS}:application:${tenderId}:events`
}

export function getApplicationEvents(tenderId) {
  return getJson(applicationEventsKey(tenderId), [])
}

export function appendApplicationEvent(tenderId, event) {
  const list = getApplicationEvents(tenderId)
  list.push({ ...event, createdAtISO: (event.createdAtISO || demoNow().toISOString()) })
  setJson(applicationEventsKey(tenderId), list)
}

export function setApplicationResponsible(tenderId, responsibleUserId) {
  const data = getJson(KEYS.applications, {})
  const existing = data[tenderId] || {}
  data[tenderId] = { ...existing, responsibleUserId, updatedAtISO: demoNow().toISOString() }
  setJson(KEYS.applications, data)
}

// --- Application process state (per tender) ---
export function applicationStateKey(tenderId) {
  return `${NS}:application:${tenderId}:state`
}

export function getApplicationState(tenderId) {
  return getJson(applicationStateKey(tenderId), null)
}

export function setApplicationState(tenderId, state) {
  setJson(applicationStateKey(tenderId), state)
}

// --- Subscription ---
const DEFAULT_SUBSCRIPTION = {
  plan: 'PRO',
  monthlyQuota: 20,
  usedThisMonth: 0,
  resetISO: '2026-04-01T00:00:00.000Z',
}

export function getSubscription() {
  return getJson(KEYS.subscription, DEFAULT_SUBSCRIPTION)
}

export function incrementUsedAnalysis() {
  const sub = getSubscription()
  sub.usedThisMonth = (sub.usedThisMonth || 0) + 1
  setJson(KEYS.subscription, sub)
}
