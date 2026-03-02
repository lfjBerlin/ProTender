import { X } from 'lucide-react'
import { useState } from 'react'

export default function ChipSelect({
  label,
  options = [],
  value = [],
  onChange,
  required,
  placeholder = 'Auswählen oder eingeben...',
  allowCustom = false,
}) {
  const [input, setInput] = useState('')

  const add = (item) => {
    const s = item.trim()
    if (!s || value.includes(s)) return
    onChange([...value, s])
    setInput('')
  }

  const remove = (item) => onChange(value.filter((v) => v !== item))

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const v = input.trim()
      if (v) add(v)
      else if (options.length && !value.includes(options[0])) {
        const first = options.find((o) => !value.includes(o))
        if (first) add(first)
      }
    }
  }

  const availableOptions = options.filter((o) => !value.includes(o))

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-gray-300 focus-within:ring-2 focus-within:ring-protender-blue/30 focus-within:border-protender-blue bg-white min-h-[44px]">
        {value.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-protender-blue/10 text-protender-blue text-sm font-medium"
          >
            {item}
            <button
              type="button"
              onClick={() => remove(item)}
              className="p-0.5 rounded hover:bg-protender-blue/20 transition-colors"
              aria-label={`${item} entfernen`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}
        {(allowCustom || availableOptions.length > 0) && (
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => input.trim() && add(input.trim())}
            placeholder={value.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[120px] outline-none bg-transparent text-sm"
          />
        )}
      </div>
      {availableOptions.length > 0 && !allowCustom && (
        <div className="flex flex-wrap gap-1.5">
          {availableOptions.slice(0, 8).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => add(opt)}
              className="px-2.5 py-1 rounded-lg text-xs bg-gray-100 hover:bg-protender-blue/10 text-gray-600 hover:text-protender-blue transition-colors"
            >
              + {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
