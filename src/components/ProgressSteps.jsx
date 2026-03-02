const STEPS = ['Profil', 'Radar', 'Ausschreibung', 'Bewerbung']

export default function ProgressSteps({ current = 1 }) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 py-6">
      {STEPS.map((label, i) => {
        const stepNum = i + 1
        const isActive = stepNum === current
        const isPast = stepNum < current
        return (
          <div key={label} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-sm font-bold transition-colors ${
                  isActive
                    ? 'bg-protender-yellow text-protender-blue'
                    : isPast
                    ? 'bg-protender-blue/80 text-white'
                    : 'bg-white/30 text-white/70'
                }`}
              >
                {stepNum}
              </div>
              <span
                className={`text-sm font-medium hidden sm:inline ${
                  isActive ? 'text-white' : isPast ? 'text-white/90' : 'text-white/60'
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-6 sm:w-12 h-0.5 mx-1 sm:mx-2 ${
                  isPast ? 'bg-protender-yellow/60' : 'bg-white/30'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
