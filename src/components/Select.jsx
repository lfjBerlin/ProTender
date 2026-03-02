export default function Select({ value, onChange, options, placeholder, className = '', id }) {
  const uid = id || `select-${Math.random().toString(36).slice(2)}`
  return (
    <select
      id={uid}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className={`px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 shadow-sm focus:ring-2 focus:ring-protender-blue/30 focus:border-protender-blue outline-none transition-colors ${className}`}
    >
      {placeholder && (
        <option value="">{placeholder}</option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
