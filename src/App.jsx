import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Onboarding from './pages/Onboarding'
import Profile from './pages/Profile'
import Radar from './pages/Radar'
import TenderDetail from './pages/TenderDetail'
import ApplicationProcess from './pages/ApplicationProcess'
import Projekte from './pages/Projekte'
import Archiv from './pages/Archiv'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/radar" element={<Radar />} />
      <Route path="/tender/:id" element={<TenderDetail />} />
      <Route path="/application/:id" element={<ApplicationProcess />} />
      <Route path="/projekte" element={<Projekte />} />
      <Route path="/archiv" element={<Archiv />} />
    </Routes>
  )
}
