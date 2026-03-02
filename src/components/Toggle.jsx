export default function Toggle({ checked, onChange, label, id }) {
  const uid = id || `toggle-${Math.random().toString(36).slice(2)}`
  return (
    <label
      htmlFor={uid}
      className="flex items-center gap-3 cursor-pointer select-none"
    >
      <div className="relative w-11 h-6">
        <input
          id={uid}
          type="checkbox"
          checked={!!checked}
          onChange={(e) => onChange?.(e.target.checked)}
          className="sr-only peer"
        />
        <div className="absolute inset-0 w-11 h-6 rounded-full bg-gray-300 peer-focus:ring-2 peer-focus:ring-protender-blue/50 peer-checked:bg-protender-blue transition-colors" />
        <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </div>
      {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
    </label>
  )
}
