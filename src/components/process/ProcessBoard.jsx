/**
 * ProcessBoard: Dashboard of process-step cards.
 * Renders a responsive grid; expanded card spans full width.
 * Handles undefined state gracefully with skeleton fallback.
 */
import StepCard from './StepCard'

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white/90 p-4 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-200 rounded w-1/3" />
          <div className="h-2 bg-gray-100 rounded w-full" />
        </div>
      </div>
    </div>
  )
}

export default function ProcessBoard({ steps = [], state, expandedKey, onToggleExpand, canStartStep, renderStepContent }) {
  const safeSteps = Array.isArray(steps) ? steps : []
  const safeState = state && typeof state === 'object' ? state : null

  if (!safeState) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {safeSteps.length > 0 ? safeSteps.map((s) => <SkeletonCard key={s.key} />) : (
          <div className="col-span-full p-8 text-center text-gray-500">Lade …</div>
        )}
      </div>
    )
  }

  if (safeSteps.length === 0) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-6 text-center">
        <p className="text-amber-800 font-medium">Konfiguration fehlt</p>
        <p className="text-sm text-amber-700 mt-1">Keine Prozessschritte definiert.</p>
      </div>
    )
  }

  const canStartStepFn = typeof canStartStep === 'function' ? canStartStep : () => false

  function getOutputPreview(stepKey, output) {
    if (!output || typeof output !== 'object') return null
    switch (stepKey) {
      case 'analysis': return output.recommendation ? `Empfehlung: ${output.recommendation}` : null
      case 'calc': return output.totals?.offerPrice != null ? `Angebotspreis: ${(output.totals.offerPrice / 1000).toFixed(0)}k € • DB: ${output.totals.contributionMarginPct}%` : null
      case 'compliance': return output.completenessPct != null ? `Vollständigkeit: ${output.completenessPct}%` : null
      case 'bidder': return output.questions?.length ? `${output.questions.length} Fragen vorgeschlagen` : null
      case 'sustainability': return output.totalCO2Kg != null ? `CO₂-Bilanz: ${output.totalCO2Kg.toLocaleString('de-DE')} kg` : null
      case 'submission': return output.ready ? 'Bereit zur Einreichung' : null
      default: return null
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {safeSteps.map((step) => {
        const status = safeState.statuses?.[step.key] ?? 'idle'
        const progress = safeState.progress?.[step.key] ?? 0
        const output = safeState.outputs?.[step.key]
        const outputPreview = getOutputPreview(step.key, output)
        const expanded = expandedKey === step.key
        const isBlocked = !canStartStepFn(safeState, step.key) && status !== 'done' && status !== 'running'

        return (
          <StepCard
            key={step.key}
            step={step}
            status={isBlocked ? 'blocked' : status}
            progress={progress}
            outputPreview={outputPreview}
            expanded={expanded}
            onToggle={() => onToggleExpand?.(step.key)}
            isBlocked={isBlocked}
          >
            {renderStepContent?.(step)}
          </StepCard>
        )
      })}
    </div>
  )
}
