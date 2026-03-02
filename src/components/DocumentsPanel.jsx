import { useState } from 'react'
import { FileText, Download, ExternalLink, Search } from 'lucide-react'
import Badge from './Badge'

const CATEGORY_LABELS = { LV: 'Leistungsverzeichnis', Vertrag: 'Vertrag', Formblatt: 'Formblätter', Anlage: 'Anlagen' }

function formatSize(kb) {
  if (kb >= 1000) return `${(kb / 1000).toFixed(1)} MB`
  return `${kb} KB`
}

export default function DocumentsPanel({ documents, updatedAt }) {
  const [search, setSearch] = useState('')

  const filtered = documents.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (CATEGORY_LABELS[d.category] || d.category).toLowerCase().includes(search.toLowerCase())
  )

  const byCategory = filtered.reduce((acc, d) => {
    const c = d.category || 'Sonstige'
    if (!acc[c]) acc[c] = []
    acc[c].push(d)
    return acc
  }, {})

  const categories = ['LV', 'Vertrag', 'Formblatt', 'Anlage'].filter((c) => byCategory[c]?.length)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Dokumente durchsuchen…"
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-protender-blue/30 focus:border-protender-blue outline-none"
          />
        </div>
        <span className="text-sm text-gray-500 whitespace-nowrap">
          {documents.length} Dokumente {updatedAt && `• zuletzt aktualisiert ${new Date(updatedAt).toLocaleDateString('de-DE')}`}
        </span>
      </div>

      {documents.length === 0 ? (
        <p className="text-gray-500 py-8 text-center">Keine Dokumente hinterlegt</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500 py-8 text-center">Keine Treffer</p>
      ) : (
        <div className="space-y-6">
          {categories.map((cat) => (
            <section key={cat}>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">{CATEGORY_LABELS[cat] || cat}</h4>
              <div className="space-y-2">
                {byCategory[cat].map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors"
                  >
                    <FileText className="w-5 h-5 text-protender-blue flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                      <div className="flex gap-2 mt-0.5">
                        <Badge>{doc.type}</Badge>
                        <span className="text-xs text-gray-500">{formatSize(doc.sizeKb)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <a
                        href={doc.url}
                        className="p-2 rounded-lg text-gray-500 hover:bg-white hover:text-protender-blue transition-colors"
                        title="Öffnen"
                        aria-label="Öffnen"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <a
                        href={doc.url}
                        className="p-2 rounded-lg text-gray-500 hover:bg-white hover:text-protender-blue transition-colors"
                        title="Download"
                        aria-label="Download"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
