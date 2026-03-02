import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  FileCheck,
  HelpCircle,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react'
import ProgressSteps from '../components/ProgressSteps'
import GlassCard from '../components/GlassCard'
import UploadItem from '../components/UploadItem'
import ChipSelect from '../components/ChipSelect'
import { setProfile, setUploads, getProfile, getUploads } from '../lib/store'

const RECHTSFORMEN = ['GmbH', 'UG', 'GbR', 'Einzelunternehmen', 'AG', 'Sonstiges']
const REGIONEN = ['Berlin', 'Brandenburg', 'Sachsen', 'Sachsen-Anhalt', 'Thüringen', 'Bayern', 'Baden-Württemberg', 'NRW', 'Hessen', 'Sonstiges']
const GEWERKE = ['Tiefbau', 'Straßenbau', 'Hochbau', 'Ausbau', 'Elektro', 'HLS', 'Garten-/Landschaftsbau', 'Sonstiges']
const UNTERNEHMENSGROESSE = ['1–10', '11–50', '51–250']

const UPLOAD_CONFIG = [
  {
    id: 'handelsregister',
    label: 'Handelsregisterauszug / Gewerbeanmeldung',
    hint: 'Amtlicher Nachweis der Eintragung',
    required: true,
  },
  {
    id: 'unbedenklichkeit',
    label: 'Unbedenklichkeitsbescheinigung(en)',
    hint: 'Finanzamt / Sozialkassen',
    required: false,
  },
  {
    id: 'versicherung',
    label: 'Versicherungsnachweis(e) (Betriebshaftpflicht)',
    hint: 'Aktueller Nachweis',
    required: true,
  },
  {
    id: 'referenzliste',
    label: 'Referenzliste / Projektliste',
    hint: 'Relevante abgeschlossene Projekte',
    required: true,
  },
  {
    id: 'eigenerklaerungen',
    label: 'Eigenerklärungen / Formblätter',
    hint: 'SEL-Formulare etc.',
    required: false,
  },
]

const defaultForm = {
  unternehmensname: '',
  rechtsform: '',
  ansprechpartner: '',
  email: '',
  telefon: '',
  region: [],
  gewerke: [],
  unternehmensgroesse: '',
  projektgroesse: '',
  cpvCodes: [],
  keywords: [],
}

function fileToMeta(f) {
  if (!f) return null
  return { name: f.name, size: f.size, type: f.type, lastModified: f.lastModified }
}

export default function Onboarding() {
  const navigate = useNavigate()
  const [form, setForm] = useState(defaultForm)
  const [files, setFiles] = useState({})
  const [fileObjects, setFileObjects] = useState({})
  const [toast, setToast] = useState(null)

  const loadFromStorage = useCallback(() => {
    const profile = getProfile()
    if (Object.keys(profile).length) setForm((prev) => ({ ...defaultForm, ...profile }))
    const uploads = getUploads()
    if (Object.keys(uploads).length) setFiles(uploads)
  }, [])

  useEffect(() => {
    loadFromStorage()
  }, [loadFromStorage])

  const saveToStorage = useCallback(() => {
    setProfile(form)
    setUploads(files)
  }, [form, files])

  useEffect(() => {
    saveToStorage()
  }, [form, files, saveToStorage])

  const updateForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleFileChange = (id, file) => {
    if (!file) return
    setFileObjects((prev) => ({ ...prev, [id]: file }))
    setFiles((prev) => ({ ...prev, [id]: fileToMeta(file) }))
  }

  const handleFileRemove = (id) => {
    setFileObjects((prev => {
      const next = { ...prev }
      delete next[id]
      return next
    }))
    setFiles((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
  const profileComplete =
    form.unternehmensname.trim() &&
    form.rechtsform &&
    form.ansprechpartner.trim() &&
    form.email.trim() &&
    emailValid &&
    form.region.length > 0 &&
    form.gewerke.length > 0 &&
    form.unternehmensgroesse

  const uploadsComplete =
    files.handelsregister &&
    files.versicherung &&
    files.referenzliste

  const canProceed = profileComplete && uploadsComplete

  const handleWeiter = () => {
    if (!canProceed) return
    setProfile(form)
    setUploads(files)
    setToast('Profil gespeichert')
    setTimeout(() => setToast(null), 2500)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-protender-blue via-protender-blue-dark to-protender-blue relative overflow-hidden">
      {/* Background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-protender-blue-light/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-20 w-80 h-80 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute bottom-20 right-1/3 w-64 h-64 bg-protender-yellow/10 rounded-full blur-2xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-32">
        {/* Header */}
        <header className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Willkommen bei ProTender
          </h1>
          <p className="mt-2 text-lg text-white/90 max-w-2xl mx-auto">
            Einmal einrichten – danach analysiert ProTender Ausschreibungen automatisch und bewertet Risiken & Kalkulation.
          </p>
        </header>

        <ProgressSteps current={1} />

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-2 gap-8 mt-8">
          {/* Left: Company Profile */}
          <GlassCard title="Unternehmensprofil" icon={Building2}>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unternehmensname <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.unternehmensname}
                  onChange={(e) => updateForm('unternehmensname', e.target.value)}
                  placeholder="z.B. Müller Bau GmbH"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-protender-blue/30 focus:border-protender-blue outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rechtsform <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.rechtsform}
                  onChange={(e) => updateForm('rechtsform', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-protender-blue/30 focus:border-protender-blue outline-none bg-white"
                >
                  <option value="">Bitte wählen</option>
                  {RECHTSFORMEN.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ansprechpartner <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.ansprechpartner}
                    onChange={(e) => updateForm('ansprechpartner', e.target.value)}
                    placeholder="Name"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-protender-blue/30 focus:border-protender-blue outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-Mail <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateForm('email', e.target.value)}
                    placeholder="name@firma.de"
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-colors ${
                      form.email && !emailValid
                        ? 'border-red-400 focus:ring-red-200'
                        : 'border-gray-300 focus:ring-2 focus:ring-protender-blue/30 focus:border-protender-blue'
                    }`}
                  />
                  {form.email && !emailValid && (
                    <p className="text-xs text-red-500 mt-0.5">Bitte gültige E-Mail eingeben</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                <input
                  type="tel"
                  value={form.telefon}
                  onChange={(e) => updateForm('telefon', e.target.value)}
                  placeholder="Optional"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-protender-blue/30 focus:border-protender-blue outline-none"
                />
              </div>

              <ChipSelect
                label="Region / Einsatzgebiet"
                options={REGIONEN}
                value={form.region}
                onChange={(v) => updateForm('region', v)}
                required
                placeholder="Regionen auswählen"
              />

              <ChipSelect
                label="Gewerke"
                options={GEWERKE}
                value={form.gewerke}
                onChange={(v) => updateForm('gewerke', v)}
                required
                placeholder="Gewerke auswählen"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unternehmensgröße <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.unternehmensgroesse}
                  onChange={(e) => updateForm('unternehmensgroesse', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-protender-blue/30 focus:border-protender-blue outline-none bg-white"
                >
                  <option value="">Bitte wählen</option>
                  {UNTERNEHMENSGROESSE.map((u) => (
                    <option key={u} value={u}>{u} MA</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durchschnittliche Projektgröße (€)
                </label>
                <input
                  type="text"
                  value={form.projektgroesse}
                  onChange={(e) => updateForm('projektgroesse', e.target.value)}
                  placeholder="z.B. 500.000"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-protender-blue/30 focus:border-protender-blue outline-none"
                />
              </div>

              <ChipSelect
                label="Präferierte CPV-Codes"
                value={form.cpvCodes}
                onChange={(v) => updateForm('cpvCodes', v)}
                placeholder="z.B. 45233140"
                allowCustom
              />

              <ChipSelect
                label="Keywords"
                value={form.keywords}
                onChange={(v) => updateForm('keywords', v)}
                options={['Asphalt', 'Pflaster', 'Kanal', 'Rohrleitungsbau', 'Straßenbau']}
                placeholder="z.B. Asphalt, Pflaster"
                allowCustom
              />
            </form>
          </GlassCard>

          {/* Right: Uploads + Why card */}
          <div className="space-y-6">
            <GlassCard title="Wichtige Nachweise" icon={FileCheck}>
              <div className="space-y-6">
                {UPLOAD_CONFIG.map((item) => (
                  <UploadItem
                    key={item.id}
                    label={item.label}
                    hint={item.hint}
                    required={item.required}
                    file={fileObjects[item.id] || (files[item.id] ? { name: files[item.id].name, size: files[item.id].size } : null)}
                    onFileChange={(f) => handleFileChange(item.id, f)}
                    onRemove={() => handleFileRemove(item.id)}
                  />
                ))}
              </div>
            </GlassCard>

            <GlassCard title="Warum diese Daten?" icon={HelpCircle}>
              <ul className="space-y-3">
                {[
                  'Bessere Matching-Qualität im Radar',
                  'Automatischer Compliance- & Vollständigkeitscheck',
                  'Schneller Start der KI-Analyse & LV-Kalkulation',
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-protender-blue flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{text}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Sticky footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/80 py-4 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück
          </button>
          <button
            type="button"
            onClick={handleWeiter}
            disabled={!canProceed}
            className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold transition-all ${
              canProceed
                ? 'bg-protender-yellow text-protender-blue hover:bg-protender-yellow-hover hover:shadow-lg cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Weiter
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </footer>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl bg-white shadow-xl border border-gray-200 flex items-center gap-2 animate-fade-in-up">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span className="font-medium text-gray-900">{toast}</span>
        </div>
      )}
    </div>
  )
}
