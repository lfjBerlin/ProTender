import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Search, FolderOpen, Archive } from 'lucide-react'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/radar', label: 'Radar', icon: Search },
  { path: '/projekte', label: 'Projekte', icon: FolderOpen },
  { path: '/archiv', label: 'Archiv', icon: Archive },
]

export default function Sidebar() {
  const location = useLocation()
  const isActive = (path) => {
    if (path === '/projekte') return location.pathname.startsWith('/projekte')
    if (path === '/archiv') return location.pathname.startsWith('/archiv')
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <aside className="w-56 flex-shrink-0 hidden lg:flex flex-col bg-[#002a94] border-r border-[#002a94]/80">
      <div className="p-4">
        <Link to="/" className="text-xl font-bold text-white">
          ProTender
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? 'bg-protender-yellow/25 text-protender-yellow'
                  : 'text-white/85 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
