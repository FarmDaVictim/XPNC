/**
 * Quests list — card grid of all available quests (alternative to map)
 * Same locations as map, organized by continent/category
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllLocations } from '../lib/locations'
import { useUser } from '../hooks/useUser'

const CONTINENT_ORDER = ['Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania', 'Antarctica']

export default function QuestsList() {
  const navigate = useNavigate()
  const { authenticated, login } = useUser()
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('continent')

  useEffect(() => {
    getAllLocations().then((data) => {
      setLocations(data)
      setLoading(false)
    })
  }, [])

  const sorted = [...locations].sort((a, b) => {
    if (sortBy === 'continent') {
      const ai = CONTINENT_ORDER.indexOf(a.continent) || 99
      const bi = CONTINENT_ORDER.indexOf(b.continent) || 99
      if (ai !== bi) return ai - bi
      return (a.name || '').localeCompare(b.name || '')
    }
    if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '')
    if (sortBy === 'category') return (a.category || '').localeCompare(b.category || '')
    if (sortBy === 'impact') return (b.impact || 0) - (a.impact || 0)
    return 0
  })

  const handleLogHours = (location) => {
    if (!authenticated) {
      login?.()
      return
    }
    navigate(`/map?location=${location.id}&region=${encodeURIComponent(location.continent === 'North America' || location.continent === 'South America' ? 'Americas' : location.continent)}`)
  }

  const handleViewOnMap = (location) => {
    const region = location.continent === 'North America' || location.continent === 'South America' ? 'Americas' : location.continent
    navigate(`/map?location=${location.id}&region=${encodeURIComponent(region)}`)
  }

  return (
    <div className="flex-1 p-6 sm:p-8 overflow-auto page-enter">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="font-[var(--font-pixel)] text-[10px] text-[var(--color-neon-cyan)] uppercase tracking-widest">
              Available Quests
            </h1>
            <h2 className="font-[var(--font-body)] text-2xl md:text-3xl text-[var(--color-app-text)] mt-2">
              Volunteer opportunities worldwide
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-[var(--font-body)] text-sm text-[var(--color-app-text-muted)]">Sort by</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-sm text-[var(--color-app-text)] font-[var(--font-body)] transition-all hover:border-[var(--color-neon-cyan)]/30"
            >
              <option value="continent">Continent</option>
              <option value="name">Name</option>
              <option value="category">Category</option>
              <option value="impact">Impact</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass-card rounded-xl p-5 skeleton-shimmer" style={{ minHeight: 180 }}>
                <div className="h-4 bg-[var(--color-app-text-muted)]/20 rounded w-1/3 mb-4" />
                <div className="h-6 bg-[var(--color-app-text-muted)]/20 rounded w-2/3 mb-3" />
                <div className="h-4 bg-[var(--color-app-text-muted)]/20 rounded w-1/2 mb-6" />
                <div className="h-10 bg-[var(--color-app-text-muted)]/20 rounded w-full" />
              </div>
            ))}
          </div>
        ) : locations.length === 0 ? (
          <div className="p-12 rounded-xl glass-card border border-dashed border-[var(--glass-border)] text-center">
            <p className="font-[var(--font-body)] text-lg text-[var(--color-app-text-muted)]">
              No quests available. Run seed.sql in Supabase to load locations.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sorted.map((loc) => (
              <div
                key={loc.id}
                className="glass-card card-hover rounded-xl overflow-hidden flex flex-col"
                style={{
                  border: '1px solid rgba(255,255,255,0.08)',
                  minHeight: 220,
                }}
              >
                {/* Top: category + continent tags */}
                <div className="flex justify-between items-start p-4 pb-0">
                  <span
                    className="px-2.5 py-1 rounded text-[10px] font-[var(--font-pixel)] uppercase"
                    style={{
                      background: 'rgba(0, 245, 255, 0.08)',
                      color: 'var(--color-neon-cyan)',
                      border: '1px solid rgba(0, 245, 255, 0.2)',
                    }}
                  >
                    {loc.category || 'general'}
                  </span>
                  <span className="font-[var(--font-body)] text-xs text-[var(--color-app-text-muted)]">
                    {loc.continent}
                  </span>
                </div>

                {/* Middle: quest name, nonprofit, impact */}
                <div className="flex-1 p-4 pt-3">
                  <h3 className="font-[var(--font-body)] font-semibold text-lg text-[var(--color-app-text)] leading-tight">
                    {loc.name}
                  </h3>
                  <p className="font-[var(--font-body)] text-sm text-[var(--color-app-text-muted)] mt-1">
                    {loc.nonprofit}
                  </p>
                  <div className="mt-3">
                    <span
                      className="font-[var(--font-pixel)] text-2xl text-[var(--color-neon-green)]"
                      style={{ textShadow: '0 0 12px rgba(34, 197, 94, 0.5)' }}
                    >
                      ~{loc.impact ?? 0}
                    </span>
                    <span className="font-[var(--font-body)] text-xs text-[var(--color-app-text-muted)] ml-1">
                      impact
                    </span>
                  </div>
                  {loc.isProposed && (
                    <span className="inline-block mt-2 px-2 py-0.5 rounded text-[9px] font-[var(--font-pixel)] text-[var(--color-neon-amber)] bg-[var(--color-neon-amber)]/10 border border-[var(--color-neon-amber)]/30">
                      Pending
                    </span>
                  )}
                </div>

                {/* Bottom: Log Hours button */}
                <div className="p-4 pt-0 space-y-2">
                  <button
                    onClick={() => handleLogHours(loc)}
                    disabled={loc.isProposed}
                    className="w-full py-3 rounded-lg font-[var(--font-body)] font-medium text-[var(--color-neon-cyan)] border-2 border-[var(--color-neon-cyan)]/50 bg-[var(--color-neon-cyan)]/5 transition-all duration-200 hover:bg-[var(--color-neon-cyan)]/15 hover:shadow-[0_0_20px_rgba(0,245,255,0.15)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--color-neon-cyan)]/5"
                  >
                    Log hours
                  </button>
                  <button
                    onClick={() => handleViewOnMap(loc)}
                    className="w-full py-2 rounded-lg font-[var(--font-body)] text-sm text-[var(--color-app-text-muted)] hover:text-[var(--color-app-text)] transition-colors"
                  >
                    View on map →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="mt-6 font-[var(--font-body)] text-sm text-[var(--color-app-text-muted)]">
          Or explore the{' '}
          <button onClick={() => navigate('/map')} className="text-[var(--color-neon-cyan)] hover:underline">
            interactive map
          </button>{' '}
          to browse by region.
        </p>
      </div>
    </div>
  )
}
