export default function ScoreRing({ score = 0, size = 80 }) {
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  let color = 'stroke-gray-400'
  if (score >= 80) color = 'stroke-green-500'
  else if (score >= 60) color = 'stroke-protender-yellow'

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-gray-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${color} transition-all duration-500`}
        />
      </svg>
      <span className="absolute text-lg font-bold text-gray-900">{score}</span>
    </div>
  )
}
