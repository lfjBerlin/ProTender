export default function ProgressBar({ value = 0, className = '' }) {
  const pct = Math.min(100, Math.max(0, Number(value)))
  return (
    <div
      className={`h-2 rounded-full bg-gray-200 overflow-hidden ${className}`}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-protender-blue transition-all duration-500 ease-out rounded-full"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
