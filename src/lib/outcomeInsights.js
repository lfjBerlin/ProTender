import { computeTenderScore } from './radarService'

function safeNumber(n, fallback = 0) {
  const v = typeof n === 'number' ? n : Number(n)
  return Number.isFinite(v) ? v : fallback
}

export function generateOutcomeInsight({ tender, applicationState, application, profile }) {
  const outcome = application?.status === 'won' ? 'won' : 'lost'
  const appState = applicationState || {}
  const outputs = appState.outputs || {}
  const calc = outputs.calc || {}
  const compliance = outputs.compliance || {}
  const bidder = outputs.bidder || {}

  const offerPrice = safeNumber(calc.totals?.offerPrice, null)
  const dbPct = safeNumber(calc.totals?.contributionMarginPct, null)
  const completeness = safeNumber(compliance.completenessPct, null)
  const missingDocs = (compliance.missingDocs || []).length
  const questions = Array.isArray(bidder.questions) ? bidder.questions : []
  const markedQuestions = questions.filter((q) => q.marked).length

  const score = tender ? computeTenderScore(tender, profile || {}) : 75

  const factors = {
    priceCompetitiveness: 'medium',
    compliance: completeness >= 90 && missingDocs === 0 ? 'strong' : missingDocs > 0 ? 'weak' : 'ok',
    timing: 'on_time',
    differentiation: markedQuestions > 0 ? 'high' : 'low',
  }

  if (outcome === 'won') {
    if (dbPct >= 15) {
      factors.priceCompetitiveness = 'balanced_margin'
    } else if (dbPct > 0) {
      factors.priceCompetitiveness = 'aggressive'
    }
  } else {
    if (missingDocs > 0 || completeness < 80) {
      factors.compliance = 'insufficient'
    }
    if (dbPct > 18) {
      factors.priceCompetitiveness = 'too_high'
    }
  }

  const bullets = []

  if (outcome === 'won') {
    bullets.push('Starke inhaltliche Passung zu unserem Leistungsprofil und Region.')
    if (dbPct != null) {
      bullets.push(`Angebot mit attraktivem Deckungsbeitrag (${dbPct}% DB) bei wettbewerbsfähigem Preisniveau.`)
    } else {
      bullets.push('Preis-/Leistungsverhältnis laut Bewertung der Vergabestelle im oberen Drittel.')
    }
    if (missingDocs === 0) {
      bullets.push('Vollständige und fristgerechte Unterlagen ohne formale Abzüge.')
    }
    if (markedQuestions > 0) {
      bullets.push('Bieterfragen gezielt genutzt, um Unklarheiten zu klären und Risiken zu reduzieren.')
    }
  } else {
    if (missingDocs > 0 || completeness < 80) {
      bullets.push('Formale Abzüge durch fehlende oder unvollständige Nachweise.')
    }
    if (dbPct != null && dbPct > 18) {
      bullets.push(`Deckungsbeitrag (${dbPct}%) deutet auf ein zu hohes Preisniveau im Vergleich zur Konkurrenz hin.`)
    } else {
      bullets.push('Preis lag vermutlich über dem durchschnittlichen Wettbewerbsniveau.')
    }
    bullets.push('Begrenzte Differenzierung im Angebot; wenig herausgearbeitete Mehrwerte im Vergleich zum Standard.')
  }

  const summary =
    outcome === 'won'
      ? 'Zuschlag dank guter Passung, wettbewerbsfähigem Preis und formal sauberer Unterlagen.'
      : 'Kein Zuschlag, voraussichtlich aufgrund von Preisniveau und/oder formalen Abzügen.'

  return {
    outcome,
    score,
    summary,
    bullets,
    factors,
  }
}

