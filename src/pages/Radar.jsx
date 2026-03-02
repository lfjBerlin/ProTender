import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, RotateCcw, Loader2 } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import SearchBar from '../components/SearchBar'
import FilterChips from '../components/FilterChips'
import FilterDrawer from '../components/FilterDrawer'
import TenderCard from '../components/TenderCard'
import SkeletonTenderCard from '../components/SkeletonTenderCard'
import Toggle from '../components/Toggle'
import Select from '../components/Select'
import { fetchTenders, REGIONS, TRADES, VOLUME_PRESETS, DEADLINE_PRESETS } from '../lib/radarService'
import { getProfile } from '../lib/store'

function parseQueryFromUrl(searchParams) {
  const q = searchParams.get('q') || ''
  const locations = searchParams.get('locations')?.split(',').filter(Boolean) || []
  const trades = searchParams.get('trades')?.split(',').filter(Boolean) || []
  const volumeLabel = searchParams.get('volume') || ''
  const deadlineLabel = searchParams.get('deadline') || ''
  const sustainabilityOnly = searchParams.get('sustainability') === '1'
  const minScore = searchParams.get('minScore') ? parseInt(searchParams.get('minScore'), 10) : null
  const sortBy = searchParams.get('sortBy') || 'relevance'
  const sortDir = searchParams.get('sortDir') || 'desc'

  const volumePreset = VOLUME_PRESETS.find((p) => p.label === volumeLabel) || null
  const deadlinePreset = DEADLINE_PRESETS.find((p) => p.label === deadlineLabel) || null

  return {
    q,
    locations,
    trades,
    volumePreset,
    deadlinePreset,
    sustainabilityOnly,
    minScore,
    sortBy,
    sortDir,
  }
}

function buildRadarQuery(state) {
  return {
    q: state.q,
    cpv: [],
    locations: [...state.locations],
    trades: [...state.trades],
    volumeMin: state.volumePreset?.min ?? undefined,
    volumeMax: state.volumePreset?.max ?? undefined,
    deadlineMaxDays: state.deadlinePreset?.days ?? undefined,
    sustainabilityOnly: state.sustainabilityOnly,
    minScore: state.minScore ?? undefined,
    sortBy: state.sortBy,
    sortDir: state.sortDir,
  }
}

function getAppliedFilters(state) {
  const applied = []
  state.locations.forEach((l) => applied.push({ key: `loc-${l}`, label: l }))
  state.trades.forEach((t) => applied.push({ key: `trade-${t}`, label: t }))
  if (state.volumePreset) applied.push({ key: 'vol', label: state.volumePreset.label })
  if (state.deadlinePreset) applied.push({ key: 'dead', label: state.deadlinePreset.label })
  if (state.sustainabilityOnly) applied.push({ key: 'sust', label: 'Nachhaltigkeit' })
  if (state.minScore) applied.push({ key: 'minScore', label: `Score ≥${state.minScore}` })
  return applied
}

export default function Radar() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [state, setState] = useState(() => {
    const fromUrl = parseQueryFromUrl(searchParams)
    const profile = getProfile() || {}
    if (fromUrl.locations.length || fromUrl.trades.length) return fromUrl
    return {
      ...fromUrl,
      locations: profile.region || [],
      trades: profile.gewerke || [],
    }
  })

  const [searchInput, setSearchInput] = useState(state.q)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [avgScore, setAvgScore] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [, setFeedbackVersion] = useState(0)
  const reqRef = useRef(0)

  const updateState = useCallback((updater) => {
    setState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
      return next
    })
  }, [])

  const query = useMemo(
    () => buildRadarQuery(state),
    [
      state.q,
      state.locations.join(','),
      state.trades.join(','),
      state.volumePreset?.label ?? '',
      state.deadlinePreset?.label ?? '',
      state.sustainabilityOnly,
      state.minScore ?? '',
      state.sortBy,
      state.sortDir,
    ]
  )

  useEffect(() => {
    const params = new URLSearchParams()
    if (state.q) params.set('q', state.q)
    if (state.locations.length) params.set('locations', state.locations.join(','))
    if (state.trades.length) params.set('trades', state.trades.join(','))
    if (state.volumePreset) params.set('volume', state.volumePreset.label)
    if (state.deadlinePreset) params.set('deadline', state.deadlinePreset.label)
    if (state.sustainabilityOnly) params.set('sustainability', '1')
    if (state.minScore) params.set('minScore', String(state.minScore))
    if (state.sortBy !== 'relevance') params.set('sortBy', state.sortBy)
    if (state.sortDir !== 'desc') params.set('sortDir', state.sortDir)
    setSearchParams(params, { replace: true })
  }, [state, setSearchParams])

  useEffect(() => {
    const reqId = ++reqRef.current
    const hasItems = items.length > 0
    setIsLoading(!hasItems)
    setIsRefreshing(hasItems)

    const timer = setTimeout(() => {
      const profile = getProfile()
      const res = fetchTenders(query, profile)
      if (reqRef.current !== reqId) return
      setItems(res.items)
      setTotal(res.total)
      setAvgScore(res.avgScore)
      setIsLoading(false)
      setIsRefreshing(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const t = setTimeout(() => {
      updateState((s) => ({ ...s, q: searchInput }))
    }, 280)
    return () => clearTimeout(t)
  }, [searchInput, updateState])

  const removeFilter = useCallback(
    (key) => {
      if (key.startsWith('loc-')) {
        const loc = key.replace('loc-', '')
        updateState((s) => ({ ...s, locations: s.locations.filter((x) => x !== loc) }))
      } else if (key.startsWith('trade-')) {
        const trade = key.replace('trade-', '')
        updateState((s) => ({ ...s, trades: s.trades.filter((x) => x !== trade) }))
      } else if (key === 'vol') {
        updateState((s) => ({ ...s, volumePreset: null }))
      } else if (key === 'dead') {
        updateState((s) => ({ ...s, deadlinePreset: null }))
      } else if (key === 'sust') {
        updateState((s) => ({ ...s, sustainabilityOnly: false }))
      } else if (key === 'minScore') {
        updateState((s) => ({ ...s, minScore: null }))
      }
    },
    [updateState]
  )

  const clearAllFilters = useCallback(() => {
    setSearchInput('')
    updateState({
      q: '',
      locations: [],
      trades: [],
      volumePreset: null,
      deadlinePreset: null,
      sustainabilityOnly: false,
      minScore: null,
      sortBy: 'relevance',
      sortDir: 'desc',
    })
  }, [updateState])

  const applied = useMemo(() => getAppliedFilters(state), [state])
  const topRegionName = useMemo(() => {
    if (!items.length) return '–'
    const acc = {}
    items.forEach((t) => {
      acc[t.location] = (acc[t.location] || 0) + 1
    })
    return Object.keys(acc).sort((a, b) => acc[b] - acc[a])[0] || '–'
  }, [items])

  const showSkeleton = isLoading && items.length === 0
  const showEmpty = !isLoading && items.length === 0
  const showList = !showSkeleton && (items.length > 0 || isRefreshing)

  return (
    <div className="min-h-screen flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-b from-white to-blue-50/80">
        <Topbar />

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <SearchBar value={searchInput} onChange={setSearchInput} />
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/80 hover:bg-white border border-gray-200/80 text-protender-blue font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-protender-blue/30 lg:hidden shadow-sm"
                >
                  <Filter className="w-5 h-5" />
                  Filter
                </button>
                <Select
                  value={state.sortBy}
                  onChange={(v) =>
                    updateState((s) => ({
                      ...s,
                      sortBy: v,
                      sortDir: v === 'deadline' ? 'asc' : 'desc',
                    }))
                  }
                  options={[
                    { value: 'relevance', label: 'Relevanz (Score)' },
                    { value: 'deadline', label: 'Frist (bald zuerst)' },
                    { value: 'volume', label: 'Volumen (hoch zuerst)' },
                  ]}
                />
              </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex flex-wrap gap-2">
                {REGIONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() =>
                      updateState((s) => ({
                        ...s,
                        locations: s.locations.includes(r)
                          ? s.locations.filter((x) => x !== r)
                          : [...s.locations, r],
                      }))
                    }
                    className={`hidden lg:inline-flex px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                      state.locations.includes(r)
                        ? 'bg-protender-blue text-white border-protender-blue'
                        : 'bg-white/70 text-protender-blue border-gray-200/80 hover:bg-white hover:border-protender-blue/30'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {TRADES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() =>
                      updateState((s) => ({
                        ...s,
                        trades: s.trades.includes(t)
                          ? s.trades.filter((x) => x !== t)
                          : [...s.trades, t],
                      }))
                    }
                    className={`hidden lg:inline-flex px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                      state.trades.includes(t)
                        ? 'bg-protender-blue text-white border-protender-blue'
                        : 'bg-white/70 text-protender-blue border-gray-200/80 hover:bg-white hover:border-protender-blue/30'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="hidden lg:flex items-center gap-2">
                <Toggle
                  id="minScore"
                  checked={!!state.minScore}
                  onChange={(v) => updateState((s) => ({ ...s, minScore: v ? 80 : null }))}
                  label="KI-Matches >80"
                />
              </div>
            </div>

            <FilterChips applied={applied} onRemove={removeFilter} onClearAll={clearAllFilters} />

            <div className="flex flex-wrap items-center gap-4 py-2">
              {isRefreshing && (
                <span className="inline-flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Aktualisierung…
                </span>
              )}
              <span className="text-gray-700 font-medium">
                {total} {total === 1 ? 'Match' : 'Matches'}
              </span>
              {total > 0 && <span className="text-gray-600 text-sm">Ø Score: {avgScore}</span>}
              {topRegionName && topRegionName !== '–' && (
                <span className="text-gray-600 text-sm">Top-Region: {topRegionName}</span>
              )}
            </div>

            {showSkeleton && (
              <div className="space-y-4 animate-fade-in">
                {[1, 2, 3, 4].map((i) => (
                  <SkeletonTenderCard key={`skeleton-${i}`} />
                ))}
              </div>
            )}

            {showEmpty && (
              <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm p-12 text-center shadow-sm">
                <p className="text-gray-600 mb-4">
                  Keine passenden Ausschreibungen gefunden. Passen Sie Ihre Filter an.
                </p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-protender-yellow text-protender-blue font-semibold hover:bg-protender-yellow-hover transition-colors focus:outline-none focus:ring-2 focus:ring-protender-blue/50 shadow-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Filter zurücksetzen
                </button>
              </div>
            )}

            {showList && items.length > 0 && (
              <div className="space-y-4 animate-fade-in">
                {items.map((tender) => (
                  <TenderCard
                    key={tender.id}
                    tender={tender}
                    onFeedbackChange={() => setFeedbackVersion((v) => v + 1)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        locations={state.locations}
        trades={state.trades}
        volumePreset={state.volumePreset}
        deadlinePreset={state.deadlinePreset}
        sustainabilityOnly={state.sustainabilityOnly}
        onLocationsChange={(v) => updateState((s) => ({ ...s, locations: v }))}
        onTradesChange={(v) => updateState((s) => ({ ...s, trades: v }))}
        onVolumePresetChange={(v) => updateState((s) => ({ ...s, volumePreset: v }))}
        onDeadlinePresetChange={(v) => updateState((s) => ({ ...s, deadlinePreset: v }))}
        onSustainabilityChange={(v) => updateState((s) => ({ ...s, sustainabilityOnly: v }))}
        onMinScoreChange={(v) => updateState((s) => ({ ...s, minScore: v ? 80 : null }))}
        minScoreEnabled={!!state.minScore}
        regionOptions={REGIONS}
        tradeOptions={TRADES}
        volumeOptions={VOLUME_PRESETS}
        deadlineOptions={DEADLINE_PRESETS}
      />
    </div>
  )
}
