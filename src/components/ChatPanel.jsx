/**
 * AI Chat – mock RAG-style responses.
 * BACKEND: retrieve relevant chunks from tender docs via vector DB using user message;
 * pass retrieved chunks + tender metadata into LLM; return answer with refs to chunk ids/docs.
 */
import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User } from 'lucide-react'
import { getTenderChat, appendTenderChatMessage } from '../lib/tenderStore'

const QUICK_CHIPS = [
  'Fristen zusammenfassen',
  'Risiken prüfen',
  'Nachhaltigkeitsanforderungen',
  'Welche Unterlagen fehlen?',
  'Kurzbeschreibung für Chef',
]

function getMockResponse(query, tender) {
  const q = query.toLowerCase()
  const req = tender.requirements || {}

  if (q.includes('frist') || q.includes('termin')) {
    const d = new Date(tender.deadlineISO).toLocaleDateString('de-DE')
    const ps = new Date(tender.projectStartISO).toLocaleDateString('de-DE')
    return {
      text: `Die Angebotsfrist endet am ${d}. Projektstart voraussichtlich am ${ps}. Ortsbesichtigung: ${req.siteVisitRequired ? 'verpflichtend' : 'nicht vorgesehen'}.`,
      source: 'Quelle: Ausschreibungsunterlagen',
    }
  }
  if (q.includes('risik')) {
    const risks = tender.risks || []
    const list = risks.map((r) => r.title + ': ' + r.description).join('\n')
    return { text: list || 'Keine besonderen Risiken.', source: 'Quelle: KI-Analyse' }
  }
  if (q.includes('nachhaltig') || q.includes('unterlagen')) {
    const items = []
    if (req.sustainabilityRequired) items.push('Nachhaltigkeitsnachweise')
    if (req.insuranceRequired) items.push('Versicherungsnachweis')
    if (req.referencesRequired) items.push('Referenzliste')
    return {
      text: 'Erforderliche Unterlagen: ' + items.join(', ') + '.',
      source: 'Quelle: Dokumente',
    }
  }
  if (q.includes('kurz') || q.includes('chef') || q.includes('beschreibung')) {
    const vol = tender.volumeEur >= 1000000 ? (tender.volumeEur / 1000000).toFixed(1) + ' Mio €' : (tender.volumeEur / 1000).toFixed(0) + 'k €'
    return {
      text: tender.title + ' – ' + tender.summary + ' Volumen ca. ' + vol + '. Vergabestelle: ' + tender.authority + '.',
      source: 'Quelle: Ausschreibungsunterlagen',
    }
  }

  return {
    text: 'Basierend auf den Ausschreibungsunterlagen: ' + tender.summary,
    source: 'Quelle: Dokumente',
  }
}

export default function ChatPanel({ tenderId, tender }) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    const stored = getTenderChat(tenderId)
    if (stored.length > 0) {
      setMessages(stored)
    } else {
      const welcome = {
        role: 'assistant',
        text: tender.summary + ' Worauf soll ich achten?',
        source: 'Quelle: Ausschreibungsunterlagen',
        id: 'welcome',
      }
      setMessages([welcome])
      appendTenderChatMessage(tenderId, welcome)
    }
  }, [tenderId, tender.summary])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = (text) => {
    const q = text.trim()
    if (!q) return

    const userMsg = { role: 'user', text: q }
    setMessages((m) => [...m, userMsg])
    appendTenderChatMessage(tenderId, userMsg)
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      const res = getMockResponse(q, tender)
      const assistantMsg = { role: 'assistant', text: res.text, source: res.source }
      setMessages((m) => [...m, assistantMsg])
      appendTenderChatMessage(tenderId, assistantMsg)
      setIsTyping(false)
    }, 600)
  }

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm flex flex-col shadow-sm h-[380px] w-full max-w-full min-w-0 overflow-hidden">
      <h3 className="font-bold text-protender-blue p-4 border-b border-gray-100">KI-Chat zur Ausschreibung</h3>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => (
          <div key={m.id || Math.random()} className={m.role === 'user' ? 'flex justify-end' : 'flex gap-2'}>
            {m.role === 'assistant' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-protender-blue/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-protender-blue" />
              </div>
            )}
            <div className={'max-w-[85%] rounded-2xl px-4 py-2 ' + (m.role === 'user' ? 'bg-protender-blue text-white' : 'bg-gray-100 text-gray-900')}>
              <p className="text-sm whitespace-pre-wrap">{m.text}</p>
              {m.source && <p className="text-xs text-gray-500 mt-1">{m.source}</p>}
            </div>
            {m.role === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-protender-blue/20 flex items-center justify-center">
                <User className="w-4 h-4 text-protender-blue" />
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-protender-blue/10 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-protender-blue" />
            </div>
            <div className="bg-gray-100 rounded-2xl px-4 py-2"><span className="animate-pulse">...</span></div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="p-2 flex flex-wrap gap-1.5 border-t border-gray-100">
        {QUICK_CHIPS.map((chip) => (
          <button key={chip} type="button" onClick={() => send(chip)} className="text-xs px-2 py-1 rounded-lg bg-gray-100 hover:bg-protender-blue/10 text-gray-700 hover:text-protender-blue transition-colors">
            {chip}
          </button>
        ))}
      </div>
      <div className="p-4 border-t border-gray-100 flex gap-2 min-w-0">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send(input)} placeholder="Frage stellen…" className="flex-1 min-w-0 px-4 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-protender-blue/30 focus:border-protender-blue outline-none" />
        <button type="button" onClick={() => send(input)} className="p-2 rounded-xl bg-protender-blue text-white hover:bg-protender-blue-dark transition-colors focus:outline-none focus:ring-2 focus:ring-protender-blue/50" aria-label="Senden">
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
