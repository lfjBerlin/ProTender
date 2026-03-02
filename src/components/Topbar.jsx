import { Link } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import { getProfile } from '../lib/store'

function getCompanyName() {
  return getProfile()?.unternehmensname || null
}

export default function Topbar() {
  const companyName = getCompanyName()

  return (
    <header className="h-14 flex-shrink-0 border-b border-gray-200/80 bg-white/95 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 shadow-sm">
      <h1 className="text-lg font-bold text-protender-blue">Ausschreibungs-Radar</h1>
      {companyName ? (
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-protender-blue/8 text-protender-blue text-sm font-medium border border-protender-blue/20">
          <Building2 className="w-4 h-4" />
          <span className="truncate max-w-[180px]">{companyName}</span>
        </div>
      ) : (
        <Link
          to="/onboarding"
          className="px-4 py-2 rounded-full bg-protender-yellow/20 text-protender-blue text-sm font-medium hover:bg-protender-yellow/30 transition-colors border border-protender-yellow/40"
        >
          Profil vervollständigen
        </Link>
      )}
    </header>
  )
}
