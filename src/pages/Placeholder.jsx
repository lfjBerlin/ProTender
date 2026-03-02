import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'

export default function Placeholder({ title, step }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-protender-blue via-protender-blue-dark to-protender-blue flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center text-white">
            <p className="text-xl font-bold mb-2">{title}</p>
            <p className="text-white/80 mb-4">Schritt {step} – Platzhalter für Click-Dummy</p>
            <Link to="/radar" className="text-protender-yellow hover:underline">
              Zum Radar
            </Link>
          </div>
        </main>
      </div>
    </div>
  )
}
