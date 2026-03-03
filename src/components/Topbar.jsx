import { Link, useLocation } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import { getProfile } from '../lib/store'
import MobileNav from './MobileNav'

function getCompanyName() {
  return getProfile()?.unternehmensname || null
}

function getPageTitle(pathname) {
  if (pathname === '/dashboard') return 'Dashboard'
  if (pathname.startsWith('/radar')) return 'Radar'
  if (pathname.startsWith('/projekte')) return 'Projekte'
  if (pathname.startsWith('/archiv')) return 'Archiv'
  if (pathname.startsWith('/profile')) return 'Profil'
  if (pathname.startsWith('/tender')) return 'Ausschreibung'
  if (pathname.startsWith('/application')) return 'Bewerbung'
  return null
}

export default function Topbar() {
  const location = useLocation()
  const companyName = getCompanyName()
  const pageTitle = getPageTitle(location.pathname)

  return (
    <header className="h-14 flex-shrink-0 border-b border-gray-200/80 bg-white/95 backdrop-blur-sm flex items-center justify-between gap-2 px-3 sm:px-4 lg:px-6 shadow-sm min-w-0">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <MobileNav />
        {pageTitle && (
          <span className="hidden sm:block truncate text-sm text-slate-600 font-medium max-w-[40vw]">
            {pageTitle}
          </span>
        )}
      </div>
      <div className="flex-shrink-0 flex items-center gap-2">
        {companyName ? (
          <Link
            to="/profile"
            className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-protender-blue/8 text-protender-blue text-sm font-medium border border-protender-blue/20 truncate max-w-[140px] sm:max-w-[180px]"
          >
            <Building2 className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{companyName}</span>
          </Link>
        ) : (
          <Link
            to="/onboarding"
            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-protender-yellow/20 text-protender-blue text-sm font-medium hover:bg-protender-yellow/30 transition-colors border border-protender-yellow/40 whitespace-nowrap"
          >
            Profil anlegen
          </Link>
        )}
      </div>
    </header>
  )
}
