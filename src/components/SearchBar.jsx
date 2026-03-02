import { Search } from 'lucide-react'

export default function SearchBar({ value, onChange, placeholder = 'Stichwort, Ort oder CPV-Code…' }) {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm placeholder:text-gray-400 focus:ring-2 focus:ring-protender-blue/30 focus:border-protender-blue outline-none transition-colors"
        aria-label="Suche"
      />
    </div>
  )
}
