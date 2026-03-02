import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

export default function Landing() {
  const observerRef = useRef(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up')
            entry.target.style.opacity = '1'
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    observerRef.current = observer
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    return () => observerRef.current?.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-protender-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-protender-white/95 backdrop-blur-md border-b border-gray-200/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-protender-blue">ProTender</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="#problem" className="text-gray-600 hover:text-protender-blue transition-colors text-sm font-medium">
                Problem
              </a>
              <a href="#solution" className="text-gray-600 hover:text-protender-blue transition-colors text-sm font-medium">
                Lösung
              </a>
              <a href="#features" className="text-gray-600 hover:text-protender-blue transition-colors text-sm font-medium">
                Features
              </a>
              <a href="#cta" className="text-protender-blue hover:text-protender-blue-dark font-medium text-sm">
                Demo
              </a>
              <Link
                to="/onboarding"
                className="bg-protender-yellow hover:bg-protender-yellow-hover text-protender-blue font-semibold px-5 py-2.5 rounded-lg transition-all hover:shadow-lg text-sm"
              >
                Live-Demo starten
              </Link>
            </div>
            <button
              type="button"
              className="md:hidden p-2 text-gray-600 hover:text-protender-blue"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menü öffnen"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col gap-4">
                <a href="#problem" className="text-gray-600 hover:text-protender-blue font-medium" onClick={() => setMobileMenuOpen(false)}>Problem</a>
                <a href="#solution" className="text-gray-600 hover:text-protender-blue font-medium" onClick={() => setMobileMenuOpen(false)}>Lösung</a>
                <a href="#features" className="text-gray-600 hover:text-protender-blue font-medium" onClick={() => setMobileMenuOpen(false)}>Features</a>
                <Link to="/onboarding" className="bg-protender-yellow text-protender-blue font-semibold px-5 py-3 rounded-lg text-center" onClick={() => setMobileMenuOpen(false)}>
                  Jetzt Dummy testen
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-gradient-to-br from-protender-blue via-protender-blue-dark to-protender-blue">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-protender-blue-light/30 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-20 w-80 h-80 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute bottom-20 right-1/3 w-64 h-64 bg-protender-yellow/10 rounded-full blur-2xl" />
          <svg className="absolute bottom-0 left-0 w-full h-48 text-protender-blue/20" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,60 Q300,0 600,60 T1200,60 L1200,120 L0,120 Z" fill="currentColor" opacity="0.3" />
            <path d="M0,80 Q400,20 800,80 T1200,80 L1200,120 L0,120 Z" fill="currentColor" opacity="0.2" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="reveal space-y-8" style={{ opacity: 0 }}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
                Öffentliche Ausschreibungen. Endlich beherrschbar.
              </h1>
              <p className="text-lg sm:text-xl text-white/90 max-w-xl leading-relaxed">
                Die KI-gestützte End-to-End-Plattform für Bau-KMU – von der Suche über Analyse und Kalkulation bis zur Einreichung.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/onboarding"
                  className="inline-flex items-center justify-center bg-protender-yellow hover:bg-protender-yellow-hover text-protender-blue font-bold px-8 py-4 rounded-lg transition-all hover:shadow-xl hover:scale-[1.02] text-lg"
                >
                  Live-Demo starten
                </Link>
                <a
                  href="#solution"
                  className="inline-flex items-center justify-center border-2 border-white/50 hover:border-white text-white font-semibold px-8 py-4 rounded-lg transition-all"
                >
                  Mehr erfahren
                </a>
              </div>
            </div>

            <div className="reveal lg:ml-auto" style={{ opacity: 0 }}>
              <div className="glass-white rounded-2xl p-8 shadow-2xl border border-white/50">
                <h3 className="text-lg font-bold text-protender-blue mb-6">Alles in einer Plattform</h3>
                <ul className="space-y-4">
                  {[
                    'Automatisierte Ausschreibungssuche',
                    'KI-Dokumentenanalyse',
                    'LV-Kalkulation & Margenbewertung',
                    'Vertrags- & Nachhaltigkeitscheck',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-700">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-protender-yellow flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-protender-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="py-24 lg:py-32 bg-protender-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="reveal text-3xl sm:text-4xl lg:text-5xl font-extrabold text-protender-blue text-center mb-6" style={{ opacity: 0 }}>
            Warum Bau-KMU bei öffentlichen Vergaben verlieren
          </h2>
          <p className="reveal text-xl text-gray-600 text-center max-w-2xl mx-auto mb-16" style={{ opacity: 0 }}>
            Drei zentrale Hürden blockieren den Erfolg kleiner und mittelständischer Bauunternehmen.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Hoher Zeitaufwand', desc: 'Wochenlange manuelle Sichtung von Ausschreibungen, Lesen hunderter Seiten Dokumente und zeitintensive Recherche – wertvolle Ressourcen, die für die eigentliche Projektarbeit fehlen.', icon: '⏱' },
              { title: 'Komplexe Dokumente & Formalien', desc: 'Leistungsverzeichnisse, Vertragsbedingungen und formale Anforderungen überfordern oft die Kapazitäten. Fehlende Unterlagen oder formale Fehler führen zur direkten Ablehnung.', icon: '📄' },
              { title: 'Hohe Bewerbungskosten ohne Garantie', desc: 'Jede Bewerbung erfordert erhebliche Vorarbeit – ohne Erfolgsgarantie. Der ROI bleibt unsicher, die Risikobereitschaft sinkt und wertvolle Aufträge gehen an die Großen.', icon: '💰' },
            ].map((card, i) => (
              <div key={i} className="reveal glass-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100" style={{ opacity: 0 }}>
                <h3 className="text-xl font-bold text-protender-blue mb-3">{card.title}</h3>
                <p className="text-gray-600 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solution" className="py-24 lg:py-32 bg-protender-blue relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-protender-blue-dark/50 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="reveal text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white text-center mb-6" style={{ opacity: 0 }}>
            Ein digitales Bid-Office – powered by KI
          </h2>
          <p className="reveal text-xl text-white/90 text-center max-w-3xl mx-auto mb-16" style={{ opacity: 0 }}>
            ProTender kombiniert spezialisierte KI-Agenten zu einem intelligenten Assistenzsystem.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {['Such-Agent', 'Analyse-Agent', 'Kalkulations-Agent', 'Legal-Check', 'Nachhaltigkeits-Agent', 'Sanity-Check'].map((agent, i) => (
              <div key={i} className="reveal glass rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all" style={{ opacity: 0 }}>
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-lg bg-protender-yellow/20 flex items-center justify-center">
                    <span className="text-protender-yellow font-bold text-sm">{i + 1}</span>
                  </span>
                  <span className="text-lg font-bold text-white">{agent}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Feature Section */}
      <section id="features" className="py-24 lg:py-32 bg-protender-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="reveal text-3xl sm:text-4xl lg:text-5xl font-extrabold text-protender-blue text-center mb-6" style={{ opacity: 0 }}>
            KI-Analyse & Kalkulation in Minuten
          </h2>
          <p className="reveal text-xl text-gray-600 text-center max-w-3xl mx-auto mb-16" style={{ opacity: 0 }}>
            Das System analysiert alle Ausschreibungsunterlagen, bewertet Risiken, kalkuliert Kosten und empfiehlt, ob sich eine Teilnahme lohnt.
          </p>

          <div className="reveal max-w-5xl mx-auto glass-white rounded-2xl p-8 shadow-2xl" style={{ opacity: 0 }}>
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between p-4 rounded-xl bg-protender-blue/5"><span className="text-gray-700">Fit-Score</span><span className="font-bold text-protender-blue">78% Match</span></div>
                <div className="flex justify-between p-4 rounded-xl bg-protender-blue/5"><span className="text-gray-700">Risiko-Level</span><span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold">Moderat</span></div>
                <div className="flex justify-between p-4 rounded-xl bg-protender-blue/5"><span className="text-gray-700">Fristen</span><span className="font-semibold">12. März 2025</span></div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between p-4 rounded-xl bg-protender-blue/5"><span className="text-gray-700">Geschätzte Kosten</span><span className="font-bold">€ 2,4 Mio.</span></div>
                <div className="flex justify-between p-4 rounded-xl bg-protender-blue/5"><span className="text-gray-700">Empfohlener Preis</span><span className="font-bold text-protender-blue">€ 2,68 Mio.</span></div>
                <div className="flex justify-between p-4 rounded-xl bg-protender-blue/5"><span className="text-gray-700">Deckungsbeitrag</span><span className="font-bold text-green-700">11,7%</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Now Section */}
      <section className="py-24 lg:py-32 bg-gradient-to-br from-gray-50 to-protender-blue/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="reveal text-3xl sm:text-4xl lg:text-5xl font-extrabold text-protender-blue text-center mb-16" style={{ opacity: 0 }}>
            Warum jetzt?
          </h2>
          <div className="grid sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              'Technologische Reife von LLMs – KI versteht komplexe Dokumente zuverlässig',
              'Steigende Nachhaltigkeitsanforderungen – ProTender prüft CO₂ und ESG-Kriterien automatisch',
              'Wachsender Ausschreibungsdruck – immer mehr öffentliche Aufträge erfordern Effizienz',
              'Personalmangel im Bauwesen – digitale Assistenz kompensiert fehlende Kapazitäten',
            ].map((point, i) => (
              <div key={i} className="reveal flex gap-4 items-start" style={{ opacity: 0 }}>
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-protender-yellow flex items-center justify-center mt-0.5">
                  <svg className="w-4 h-4 text-protender-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <p className="text-lg text-gray-700 font-medium">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section id="cta" className="py-24 lg:py-32 bg-protender-blue relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-protender-blue-dark to-protender-blue" />
        <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="reveal text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-8" style={{ opacity: 0 }}>
            Erleben Sie, wie ProTender den Vergabeprozess transformiert.
          </h2>
          <Link
            to="/onboarding"
            className="reveal inline-flex items-center justify-center bg-protender-yellow hover:bg-protender-yellow-hover text-protender-blue font-bold px-12 py-5 rounded-xl text-xl transition-all hover:shadow-2xl hover:scale-[1.03]"
            style={{ opacity: 0 }}
          >
            Jetzt Dummy testen
          </Link>
          <p className="reveal mt-6 text-white/80 text-sm" style={{ opacity: 0 }}>
            Keine Registrierung erforderlich.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-protender-blue-dark">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link to="/" className="text-white font-bold text-lg">ProTender</Link>
            <div className="flex gap-8 text-white/80 text-sm">
              <a href="#" className="hover:text-white transition-colors">Impressum</a>
              <a href="#" className="hover:text-white transition-colors">Datenschutz</a>
              <a href="#" className="hover:text-white transition-colors">Kontakt</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
