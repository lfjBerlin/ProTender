import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react'

export default function RequirementsPanel({ requirements }) {
  if (!requirements) return null

  const items = [
    {
      key: 'insuranceRequired',
      label: 'Versicherung',
      met: requirements.insuranceRequired,
      status: requirements.insuranceRequired ? 'met' : 'optional',
    },
    {
      key: 'referencesRequired',
      label: 'Referenzen',
      met: requirements.referencesRequired,
      status: requirements.referencesRequired ? 'met' : 'optional',
    },
    {
      key: 'siteVisitRequired',
      label: 'Ortsbesichtigung',
      met: requirements.siteVisitRequired,
      status: requirements.siteVisitRequired ? 'required' : 'notRequired',
    },
    {
      key: 'sustainabilityRequired',
      label: 'Nachhaltigkeit',
      met: requirements.sustainabilityRequired,
      status: requirements.sustainabilityRequired ? 'met' : 'optional',
    },
  ]

  const getIcon = (item) => {
    if (item.status === 'met' || item.status === 'required') {
      return item.met ? (
        <CheckCircle2 className="w-5 h-5 text-green-600" />
      ) : (
        <AlertCircle className="w-5 h-5 text-amber-500" />
      )
    }
    return <XCircle className="w-5 h-5 text-gray-400" />
  }

  const getLabel = (item) => {
    if (item.key === 'siteVisitRequired' && item.met && requirements.siteVisitISO) {
      return `Ortsbesichtigung (${new Date(requirements.siteVisitISO).toLocaleDateString('de-DE')})`
    }
    return item.label
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-700">Compliance Snapshot</h4>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <div
            key={item.key}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${
              item.met
                ? 'bg-green-50 border-green-200 text-green-800'
                : item.status === 'required'
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-gray-50 border-gray-200 text-gray-600'
            }`}
          >
            {getIcon(item)}
            <span className="text-sm font-medium">{getLabel(item)}</span>
            {item.met && <span className="text-green-600">✓</span>}
            {item.status === 'required' && !item.met && <span className="text-amber-600">⚠</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
