/**
 * Radar Service – fetches and filters tenders.
 *
 * BACKEND IMPLEMENTATION NOTES (vector DB):
 * - Hybrid retrieval: Combine vector similarity (embeddings of q + company profile)
 *   with metadata filters (cpv, locations, trades, volume) in a single query.
 *   Use pgvector/Pinecone/Weaviate: filter by metadata first, then rank by vector score.
 * - Score normalization: Map raw similarity (e.g. 0–1) to 0–100 for UI.
 *   Option: min-max scale per result set or use calibrated relevance scores.
 * - Feedback learning: Store like/dislike in user_preferences. Use to:
 *   (a) Update user preference embedding via contrastive learning, or
 *   (b) Train a lightweight re-ranker that boosts liked patterns.
 *   Expose via POST /feedback { tenderId, action: "like"|"dislike" }.
 */

import { demoNow } from '../config/time'
import { MOCK_TENDERS } from '../data/tenders'

const REGIONS = ['Berlin', 'Brandenburg', 'Sachsen', 'Sachsen-Anhalt', 'Thüringen', 'Bayern', 'Baden-Württemberg', 'NRW', 'Hessen', 'Sonstiges']
const TRADES = ['Tiefbau', 'Straßenbau', 'Hochbau', 'Ausbau', 'Elektro', 'HLS', 'Garten-/Landschaftsbau', 'Sonstiges']

export const VOLUME_PRESETS = [
  { label: 'bis 500k €', min: 0, max: 500000 },
  { label: 'bis 2 Mio €', min: 0, max: 2000000 },
  { label: '500k – 2 Mio €', min: 500000, max: 2000000 },
  { label: '> 2 Mio €', min: 2000000, max: null },
  { label: '> 5 Mio €', min: 5000000, max: null },
]

export const DEADLINE_PRESETS = [
  { label: '≤ 14 Tage', days: 14 },
  { label: '≤ 30 Tage', days: 30 },
  { label: '≤ 60 Tage', days: 60 },
]

/**
 * Compute a deterministic mock score (0–100) based on overlaps with profile.
 * In production: replace with vector similarity + metadata boost from backend.
 */
function computeScore(tender, query, profile = {}) {
  const profileRegions = profile.region || []
  const profileTrades = profile.gewerke || []
  const profileCpv = profile.cpvCodes || []
  const profileKeywords = (profile.keywords || []).map((k) => k.toLowerCase())

  let score = 50 // base

  if (query.q) {
    const q = query.q.toLowerCase()
    const text = `${tender.title} ${tender.summary} ${tender.authority}`.toLowerCase()
    if (text.includes(q)) score += 15
    if (tender.cpvCodes.some((c) => c.includes(q))) score += 10
  }

  if (profileTrades.length && profileTrades.includes(tender.trade)) score += 15
  if (profileRegions.length && (profileRegions.includes(tender.location) || profileRegions.includes('Sonstiges'))) score += 12
  if (profileCpv.length && tender.cpvCodes.some((c) => profileCpv.includes(c))) score += 10

  if (query.sustainabilityOnly && tender.sustainabilityRequired) score += 5

  for (const kw of profileKeywords) {
    const text = `${tender.title} ${tender.summary}`.toLowerCase()
    if (text.includes(kw)) score += 3
  }

  return Math.min(100, Math.max(0, Math.round(score)))
}

export function computeTenderScore(tender, profile = {}) {
  return computeScore(tender, {}, profile)
}

/**
 * Filter and sort tenders based on RadarQuery.
 * In production: this would be a POST to /api/radar/search with query body.
 */
export function fetchTenders(query, profile = {}) {
  let items = [...MOCK_TENDERS]

  if (query.locations?.length) {
    items = items.filter((t) => query.locations.includes(t.location))
  }
  if (query.trades?.length) {
    items = items.filter((t) => query.trades.includes(t.trade))
  }
  if (query.cpv?.length) {
    items = items.filter((t) => t.cpvCodes.some((c) => query.cpv.includes(c)))
  }
  if (query.volumeMin != null) {
    items = items.filter((t) => t.volumeEur >= query.volumeMin)
  }
  if (query.volumeMax != null) {
    items = items.filter((t) => t.volumeEur <= query.volumeMax)
  }
  if (query.sustainabilityOnly) {
    items = items.filter((t) => t.sustainabilityRequired)
  }
  if (query.deadlineMaxDays != null) {
    const cutoff = demoNow()
    cutoff.setDate(cutoff.getDate() + query.deadlineMaxDays)
    items = items.filter((t) => new Date(t.deadlineISO) <= cutoff)
  }

  if (query.q?.trim()) {
    const q = query.q.toLowerCase().trim()
    items = items.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        t.authority.toLowerCase().includes(q) ||
        t.cpvCodes.some((c) => c.includes(q)) ||
        t.location.toLowerCase().includes(q)
    )
  }

  const withScores = items.map((t) => ({
    ...t,
    score: computeScore(t, query, profile),
  }))

  if (query.minScore != null) {
    items = withScores.filter((t) => t.score >= query.minScore)
  } else {
    items = withScores
  }

  if (query.sortBy === 'deadline') {
    items.sort((a, b) => new Date(a.deadlineISO) - new Date(b.deadlineISO))
    if (query.sortDir === 'desc') items.reverse()
  } else if (query.sortBy === 'volume') {
    items.sort((a, b) => a.volumeEur - b.volumeEur)
    if (query.sortDir === 'desc') items.reverse()
  } else {
    items.sort((a, b) => b.score - a.score)
    if (query.sortDir === 'asc') items.reverse()
  }

  const total = items.length
  const avgScore = total ? Math.round(items.reduce((s, t) => s + t.score, 0) / total) : 0

  return { items, total, avgScore }
}

export { REGIONS, TRADES }
