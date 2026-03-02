import { useState } from 'react'
import { FileText, FolderOpen, ListChecks, AlertTriangle, Copy } from 'lucide-react'
import DocumentsPanel from './DocumentsPanel'
import RequirementsPanel from './RequirementsPanel'
import RisksPanel from './RisksPanel'

const TABS = [
  { id: 'details', label: 'Details', icon: FileText },
  { id: 'documents', label: 'Dokumente', icon: FolderOpen },
  { id: 'requirements', label: 'Anforderungen', icon: ListChecks },
  { id: 'risks', label: 'Risiken', icon: AlertTriangle },
]

function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-protender-blue transition-colors focus:outline-none focus:ring-2 focus:ring-protender-blue/50"
      aria-label={`${label} kopieren`}
      title="Kopieren"
    >
      <Copy className="w-4 h-4" />
    </button>
  )
}

function DetailsTab({ tender }) {
  const [expanded, setExpanded] = useState(false)
  const kf = tender.keyFacts || {}

  return (
    <div className="space-y-6">
      <section>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Beschreibung</h4>
        <div className="relative">
          <p className={`text-gray-600 text-sm leading-relaxed ${!expanded ? 'line-clamp-4' : ''}`}>
            {tender.longDescription || tender.summary}
          </p>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-protender-blue font-medium mt-1 hover:underline"
          >
            {expanded ? 'Weniger' : 'Mehr anzeigen'}
          </button>
        </div>
      </section>

      <section>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Kontakt</h4>
        <div className="flex flex-wrap gap-4">
          {tender.contact?.name && (
            <span className="flex items-center gap-1">
              {tender.contact.name}
              <CopyButton text={tender.contact.name} label="Name" />
            </span>
          )}
          {tender.contact?.email && (
            <a href={`mailto:${tender.contact.email}`} className="text-protender-blue hover:underline flex items-center gap-1">
              {tender.contact.email}
              <CopyButton text={tender.contact.email} label="E-Mail" />
            </a>
          )}
          {tender.contact?.phone && (
            <span className="flex items-center gap-1">
              {tender.contact.phone}
              <CopyButton text={tender.contact.phone} label="Telefon" />
            </span>
          )}
        </div>
      </section>

      <section>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">CPV-Codes</h4>
        <div className="flex flex-wrap gap-2">
          {tender.cpvCodes?.map((c) => (
            <span key={c} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 text-sm">
              {c}
              <CopyButton text={c} label="CPV" />
            </span>
          ))}
        </div>
      </section>
    </div>
  )
}

export default function TenderTabs({ tender }) {
  const [active, setActive] = useState('details')

  return (
    <div>
      <div className="flex gap-1 border-b border-gray-200 mb-4 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                active === tab.id
                  ? 'border-protender-blue text-protender-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {active === 'details' && <DetailsTab tender={tender} />}
      {active === 'documents' && <DocumentsPanel documents={tender.documents || []} updatedAt={tender.deadlineISO} />}
      {active === 'requirements' && <RequirementsPanel requirements={tender.requirements} />}
      {active === 'risks' && <RisksPanel risks={tender.risks} />}
    </div>
  )
}
