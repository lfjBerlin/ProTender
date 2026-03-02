import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'

export default function Application() {
  const { id } = useParams()

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-gradient-to-b from-white to-blue-50/80">
        <Topbar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-protender-blue mb-2">Bewerbungsprozess</h1>
            <p className="text-gray-600 mb-6">Coming next: Bewerbungsprozess für Ausschreibung {id || '–'}</p>
            <Link
              to={id ? `/tender/${id}` : '/radar'}
              className="inline-flex items-center gap-2 text-protender-blue hover:underline font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              {id ? 'Zurück zur Ausschreibung' : 'Zum Radar'}
            </Link>
          </div>
        </main>
      </div>
    </div>
  )
}
