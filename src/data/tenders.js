/** Dates aligned with DEMO_NOW = 2026-03-02. Mix: expired, open, urgent (<=14 days). */
const TENDER_BASE = [
  { id: 't1', title: 'Erneuerung von Gehwegen und Bordsteinen im Stadtgebiet', authority: 'Stadt Berlin - Amt für Tiefbau', location: 'Berlin', cpvCodes: ['45233140', '45233150', '45233222'], trade: 'Straßenbau', volumeEur: 450000, deadlineISO: '2026-02-15T12:00:00.000Z', sustainabilityRequired: true, procedureType: 'VOB/A', summary: 'Umfassende Sanierung von Gehwegen, Bordsteinen und Rinnsteinen in verschiedenen Bezirken. Nachhaltige Materialien gewünscht.', docCount: 12 },
  { id: 't2', title: 'Kanalbau- und Rohrleitungsarbeiten, Lottumstraße', authority: 'Wasserbetriebe Brandenburg GmbH', location: 'Brandenburg', cpvCodes: ['45231300', '45232140', '45232400'], trade: 'Tiefbau', volumeEur: 1200000, deadlineISO: '2026-03-05T12:00:00.000Z', sustainabilityRequired: false, procedureType: 'UVgO', summary: 'Neubau von Kanälen und Rohrleitungen im Rahmen eines Wohngebietserschließungsprojekts.', docCount: 18 },
  { id: 't3', title: 'Asphaltdeckschicht und Markierungen, Bundesstraße B96', authority: 'Landesamt für Straßenwesen Sachsen', location: 'Sachsen', cpvCodes: ['45233220', '45233141', '45233142'], trade: 'Straßenbau', volumeEur: 2800000, deadlineISO: '2026-03-28T12:00:00.000Z', sustainabilityRequired: true, procedureType: 'VOB/A', summary: 'Einbau von Asphaltdeckschicht sowie Markierungsarbeiten auf einem Streckenabschnitt der B96.', docCount: 22 },
  { id: 't4', title: 'Außenanlagen und Pflasterarbeiten Schule', authority: 'Landkreis Leipzig', location: 'Sachsen', cpvCodes: ['45233222', '45112700', '45232150'], trade: 'Garten-/Landschaftsbau', volumeEur: 380000, deadlineISO: '2026-02-20T12:00:00.000Z', sustainabilityRequired: true, procedureType: 'VOB/A', summary: 'Pflasterung von Schulhof und Zugangswegen, Begrünung und Außenbeleuchtung.', docCount: 8 },
  { id: 't5', title: 'HLS-Installation Verwaltungsneubau', authority: 'Bauamt Thüringen', location: 'Thüringen', cpvCodes: ['45331000', '45332000', '45350000'], trade: 'HLS', volumeEur: 890000, deadlineISO: '2026-03-12T12:00:00.000Z', sustainabilityRequired: true, procedureType: 'VOB/A', summary: 'Heizung, Lüftung, Sanitär und Klimatechnik für einen Verwaltungsneubau.', docCount: 15 },
  { id: 't6', title: 'Rohrleitungsbau und Kanalisierung Gewerbegebiet', authority: 'Stadt Dresden', location: 'Sachsen', cpvCodes: ['45231300', '45232140', '45232400'], trade: 'Tiefbau', volumeEur: 2100000, deadlineISO: '2026-04-18T12:00:00.000Z', sustainabilityRequired: false, procedureType: 'VOB/A', summary: 'Erschließung eines neuen Gewerbegebiets mit Kanalisation und Versorgungsleitungen.', docCount: 25 },
  { id: 't7', title: 'Ausbauarbeiten Innenausbau Kita', authority: 'Jugendamt Berlin-Mitte', location: 'Berlin', cpvCodes: ['45421100', '45421000', '45431000'], trade: 'Ausbau', volumeEur: 520000, deadlineISO: '2026-02-25T12:00:00.000Z', sustainabilityRequired: true, procedureType: 'UVgO', summary: 'Innenausbau einer Kindertagesstätte inkl. Bodenbeläge, Decken und Sanitär.', docCount: 10 },
  { id: 't8', title: 'Elektroinstallation Sporthalle', authority: 'Sportamt Bayern', location: 'Bayern', cpvCodes: ['45310000', '45315000', '45316100'], trade: 'Elektro', volumeEur: 310000, deadlineISO: '2026-03-16T12:00:00.000Z', sustainabilityRequired: false, procedureType: 'VOB/A', summary: 'Elektrische Installationen für Beleuchtung und Steuerung einer neuen Sporthalle.', docCount: 11 },
  { id: 't9', title: 'Straßen- und Wegebau Parkanlage', authority: 'Grünflächenamt NRW', location: 'NRW', cpvCodes: ['45233222', '45233140', '45112700'], trade: 'Straßenbau', volumeEur: 780000, deadlineISO: '2026-04-02T12:00:00.000Z', sustainabilityRequired: true, procedureType: 'VOB/A', summary: 'Wege- und Platzgestaltung in einer Parkanlage mit Pflaster und Asphalt.', docCount: 14 },
  { id: 't10', title: 'Tiefbauarbeiten Brückenfundament', authority: 'Landesbetrieb Straßenbau Hessen', location: 'Hessen', cpvCodes: ['45221100', '45221200', '45231300'], trade: 'Tiefbau', volumeEur: 5400000, deadlineISO: '2026-05-10T12:00:00.000Z', sustainabilityRequired: false, procedureType: 'VOB/A', summary: 'Fundamentarbeiten und Tiefbau für eine neue Straßenbrücke.', docCount: 28 },
  { id: 't11', title: 'Kanalreinigung und Inspektion Stadtautobahn', authority: 'Autobahnamt Berlin-Brandenburg', location: 'Brandenburg', cpvCodes: ['45231310', '45231320', '45232400'], trade: 'Tiefbau', volumeEur: 190000, deadlineISO: '2026-03-10T12:00:00.000Z', sustainabilityRequired: false, procedureType: 'UVgO', summary: 'Reinigung und TV-Inspektion von Entwässerungskanälen entlang der Stadtautobahn.', docCount: 6 },
  { id: 't12', title: 'Hochbau Dachsanierung Verwaltungsgebäude', authority: 'Landesbau Baden-Württemberg', location: 'Baden-Württemberg', cpvCodes: ['45261400', '45261410', '45261900'], trade: 'Hochbau', volumeEur: 1200000, deadlineISO: '2026-04-25T12:00:00.000Z', sustainabilityRequired: true, procedureType: 'VOB/A', summary: 'Dachsanierung und Dämmung eines denkmalgeschützten Verwaltungsgebäudes.', docCount: 16 },
]

const DOC_TEMPLATES = [
  { name: 'Leistungsverzeichnis Teil A', type: 'PDF', category: 'LV', sizeKb: 240 },
  { name: 'Leistungsverzeichnis Teil B', type: 'GAEB', category: 'LV', sizeKb: 180 },
  { name: 'Leistungsverzeichnis Teil C', type: 'XLSX', category: 'LV', sizeKb: 95 },
  { name: 'Allgemeine Vertragsbedingungen', type: 'PDF', category: 'Vertrag', sizeKb: 120 },
  { name: 'Besondere Vertragsbedingungen', type: 'PDF', category: 'Vertrag', sizeKb: 85 },
  { name: 'Ausschreibungsunterlagen', type: 'PDF', category: 'Formblatt', sizeKb: 45 },
  { name: 'Verdingungsordnung', type: 'PDF', category: 'Formblatt', sizeKb: 320 },
  { name: 'Bauzeichnungen', type: 'PDF', category: 'Anlage', sizeKb: 2100 },
  { name: 'Technische Spezifikationen', type: 'PDF', category: 'Anlage', sizeKb: 180 },
]

const RISK_TEMPLATES = [
  { level: 'low', title: 'Standardbauleistung', description: 'Gewerke entspricht etablierten Standards.' },
  { level: 'medium', title: 'Termindruck', description: 'Projektstart kurz nach Zuschlag.' },
  { level: 'high', title: 'Genehmigungsrisiko', description: 'Baurechtliche Genehmigungen können Verzögerungen verursachen.' },
]

function enrichTender(base, i) {
  const deadline = new Date(base.deadlineISO)
  const published = new Date(deadline)
  published.setDate(published.getDate() - 45)
  const projectStart = new Date(deadline)
  projectStart.setDate(projectStart.getDate() + 21)

  const MOCK_DOCS = [
    { name: 'Ausschreibungsbeschreibung.pdf', type: 'PDF', sizeKb: 120, category: 'Ausschreibung' },
    { name: 'Leistungsverzeichnis.gaeb', type: 'GAEB', sizeKb: 240, category: 'LV' },
    { name: 'Vertragsbedingungen.pdf', type: 'PDF', sizeKb: 85, category: 'Vertrag' },
  ]
  const docCount = Math.min(base.docCount || 6, MOCK_DOCS.length + DOC_TEMPLATES.length)
  const allDocs = [...MOCK_DOCS, ...DOC_TEMPLATES]
  const documents = allDocs.slice(0, docCount).map((d, j) => ({
    id: `doc-${base.id}-${j}`,
    name: d.name,
    type: d.type,
    sizeKb: d.sizeKb,
    category: d.category,
    url: '#',
  }))

  const riskCount = 1 + (i % 3)
  const risks = RISK_TEMPLATES.slice(0, riskCount).map((r, j) => ({
    id: `risk-${base.id}-${j}`,
    level: r.level,
    title: r.title,
    description: r.description,
  }))

  return {
    ...base,
    publishedISO: published.toISOString(),
    projectStartISO: projectStart.toISOString(),
    projectDurationWeeks: 12 + (i % 8),
    submissionType: i % 3 === 0 ? 'postalisch' : 'elektronisch',
    contact: {
      name: `Sachbearbeiter${i % 3 === 0 ? 'in' : ''} Muster`,
      email: `vergabe-${base.id}@behoerde.de`,
      phone: '+49 30 1234567',
    },
    documents,
    requirements: {
      referencesRequired: true,
      insuranceRequired: true,
      sustainabilityRequired: base.sustainabilityRequired,
      siteVisitRequired: i % 2 === 0,
      siteVisitISO: i % 2 === 0 ? new Date(deadline.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
    },
    evaluation: {
      priceWeight: 60 + (i % 25),
      qualityWeight: 25 - (i % 10),
      sustainabilityWeight: 15 - (i % 5),
    },
    keyFacts: {
      lot: `Los ${String.fromCharCode(65 + (i % 5))}`,
      clientType: i % 3 === 0 ? 'Kommune' : 'Land',
      contractType: 'Einheitspreisvertrag',
      executionPlace: base.location,
    },
    longDescription: `${base.summary}\n\nDie Vergabestelle erwartet eine termingerechte Ausführung gemäß den Leistungsbeschreibungen. Besondere Anforderungen an die Nachhaltigkeit sind in den Anlagen dokumentiert. Der Bieter hat alle erforderlichen Nachweise rechtzeitig einzureichen.`,
    risks,
    questions: [
      { id: 'q1', dateISO: published.toISOString(), q: 'Können Unterlospreisungen vorgenommen werden?', a: 'Nein, gemäß Ausschreibung sind Unterlospreisungen nicht zulässig.' },
      { id: 'q2', dateISO: new Date(published.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), q: 'Ist eine Ortsbesichtigung verpflichtend?', a: i % 2 === 0 ? 'Ja, die Ortsbesichtigung am angegebenen Termin ist verpflichtend.' : 'Nein.' },
    ].slice(0, 1 + (i % 2)),
  }
}

export const MOCK_TENDERS = TENDER_BASE.map((t, i) => enrichTender(t, i))
