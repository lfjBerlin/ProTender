import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { Menu, X } from 'lucide-react'
import { NAV_ITEMS } from './Sidebar'

export default function MobileNav() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path) => {
    if (path === '/projekte') return location.pathname.startsWith('/projekte')
    if (path === '/archiv') return location.pathname.startsWith('/archiv')
    if (path === '/profile') return location.pathname.startsWith('/profile')
    if (path === '/tender') return location.pathname.startsWith('/tender')
    if (path === '/application') return location.pathname.startsWith('/application')
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const handleNav = (path) => {
    setOpen(false)
    navigate(path)
  }

  useEffect(() => {
    if (!open) return
    const onEsc = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onEsc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onEsc)
      document.body.style.overflow = ''
    }
  }, [open])

  const drawer = open && createPortal(
    <div className="fixed inset-0 z-[9999] lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
      <div
        className="absolute inset-0 bg-black/50"
        aria-hidden="true"
        onClick={() => setOpen(false)}
      />
      <div
        className="absolute left-0 top-0 h-full w-[280px] max-w-[85vw] bg-[#002a94] text-white shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <span className="text-lg font-bold text-white">Menü</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-2 rounded-lg text-white/90 hover:bg-white/10 text-white transition-colors"
            aria-label="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => handleNav(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-colors ${
                  active
                    ? 'bg-protender-yellow/25 text-protender-yellow'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </div>,
    document.body
  )

  return (
    <div className="lg:hidden flex items-center gap-2 flex-shrink-0">
      <span className="font-semibold text-protender-blue text-lg">ProTender</span>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-protender-blue transition-colors"
        aria-label="Menü öffnen"
      >
        <Menu className="w-6 h-6" />
      </button>
      {drawer}
    </div>
  )
}
