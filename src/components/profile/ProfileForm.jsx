import { Building2 } from 'lucide-react'
import ChipSelect from '../ChipSelect'

const RECHTSFORMEN = ['GmbH', 'UG', 'GbR', 'Einzelunternehmen', 'AG', 'Sonstiges']
const REGIONEN = ['Berlin', 'Brandenburg', 'Sachsen', 'Sachsen-Anhalt', 'Thüringen', 'Bayern', 'Baden-Württemberg', 'NRW', 'Hessen', 'Sonstiges']
const GEWERKE = ['Tiefbau', 'Straßenbau', 'Hochbau', 'Ausbau', 'Elektro', 'HLS', 'Garten-/Landschaftsbau', 'Sonstiges']
const UNTERNEHMENSGROESSE = ['1–10', '11–50', '51–250']

export default function ProfileForm({ form, updateForm, emailValid }) {
  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm p-5 shadow-sm">
      <h2 className="font-bold text-protender-blue mb-4 flex items-center gap-2">
        <Building2 className="w-5 h-5" />
        Unternehmensdaten
      </h2>
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Unternehmensname *</label>
          <input
            type="text"
            value={form.unternehmensname}
            onChange={(e) => updateForm('unternehmensname', e.target.value)}
            placeholder="z.B. Müller Bau GmbH"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-protender-blue/30 focus:border-protender-blue outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rechtsform *</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Ansprechpartner *</label>
            <input
              type="text"
              value={form.ansprechpartner}
              onChange={(e) => updateForm('ansprechpartner', e.target.value)}
              placeholder="Name"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-protender-blue/30 focus:border-protender-blue outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateForm('email', e.target.value)}
              placeholder="name@firma.de"
              className={`w-full px-4 py-2.5 rounded-xl border outline-none ${
                form.email && !emailValid ? 'border-red-400' : 'border-gray-300 focus:ring-2 focus:ring-protender-blue/30 focus:border-protender-blue'
              }`}
            />
            {form.email && !emailValid && <p className="text-xs text-red-500 mt-0.5">Bitte gültige E-Mail eingeben</p>}
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Webseite (optional)</label>
          <input
            type="url"
            value={form.websiteUrl || ''}
            onChange={(e) => updateForm('websiteUrl', e.target.value)}
            placeholder="https://www.firma.de"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-protender-blue/30 focus:border-protender-blue outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            Hilft ProTender, Ihr Unternehmen besser zu verstehen (z.B. Leistungsportfolio).
          </p>
        </div>
        <ChipSelect
          label="Region / Einsatzgebiet"
          options={REGIONEN}
          value={form.region || []}
          onChange={(v) => updateForm('region', v)}
          required
          placeholder="Regionen auswählen"
        />
        <ChipSelect
          label="Gewerke"
          options={GEWERKE}
          value={form.gewerke || []}
          onChange={(v) => updateForm('gewerke', v)}
          required
          placeholder="Gewerke auswählen"
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Unternehmensgröße *</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Durchschnittliche Projektgröße (€)</label>
          <input
            type="text"
            value={form.projektgroesse || ''}
            onChange={(e) => updateForm('projektgroesse', e.target.value)}
            placeholder="z.B. 500.000"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-protender-blue/30 focus:border-protender-blue outline-none"
          />
        </div>
        <ChipSelect
          label="Präferierte CPV-Codes"
          value={form.cpvCodes || []}
          onChange={(v) => updateForm('cpvCodes', v)}
          placeholder="z.B. 45233140"
          allowCustom
        />
        <ChipSelect
          label="Keywords"
          value={form.keywords || []}
          onChange={(v) => updateForm('keywords', v)}
          options={['Asphalt', 'Pflaster', 'Kanal', 'Rohrleitungsbau', 'Straßenbau']}
          placeholder="z.B. Asphalt, Pflaster"
          allowCustom
        />
      </form>
    </div>
  )
}
