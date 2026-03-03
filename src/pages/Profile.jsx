import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { User, FileCheck, ArrowLeft } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import ProfileForm from '../components/profile/ProfileForm'
import DocumentUploads from '../components/profile/DocumentUploads'
import { getProfile, setProfile } from '../lib/store'

const TABS = [
  { id: 'company', label: 'Unternehmensdaten', icon: User },
  { id: 'documents', label: 'Dokumente', icon: FileCheck },
]

const defaultForm = {
  unternehmensname: '',
  rechtsform: '',
  ansprechpartner: '',
  email: '',
  telefon: '',
  websiteUrl: '',
  region: [],
  gewerke: [],
  unternehmensgroesse: '',
  projektgroesse: '',
  cpvCodes: [],
  keywords: [],
}

export default function Profile() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const activeTab = tabParam === 'documents' ? 'documents' : 'company'

  const [form, setForm] = useState(defaultForm)

  const loadProfile = useCallback(() => {
    const profile = getProfile()
    setForm((prev) => ({ ...defaultForm, ...prev, ...profile }))
  }, [])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  useEffect(() => {
    if (tabParam === 'documents') setSearchParams({ tab: 'documents' }, { replace: true })
  }, [tabParam, setSearchParams])

  const updateForm = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      setProfile(next)
      return next
    })
  }

  const setTab = (id) => {
    setSearchParams(id === 'documents' ? { tab: 'documents' } : {}, { replace: true })
  }

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email || '')

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-b from-white to-blue-50/80">
        <Topbar />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-protender-blue"
              >
                <ArrowLeft className="w-4 h-4" />
                Zurück zum Dashboard
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-protender-blue">Profil</h1>

            <div className="flex gap-2 border-b border-gray-200 pb-2">
              {TABS.map((t) => {
                const Icon = t.icon
                const active = activeTab === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      active
                        ? 'bg-protender-blue text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {t.label}
                  </button>
                )
              })}
            </div>

            {activeTab === 'company' && (
              <ProfileForm form={form} updateForm={updateForm} emailValid={emailValid} />
            )}
            {activeTab === 'documents' && <DocumentUploads />}
          </div>
        </main>
      </div>
    </div>
  )
}
