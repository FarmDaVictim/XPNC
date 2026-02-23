/**
 * ContinentMap — Full-screen OpenStreetMap with region buttons and glowing pins
 * Fetches locations from Supabase (falls back to mock if unavailable)
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, useMap, Marker, Popup, Tooltip, ZoomControl } from 'react-leaflet'
import L from 'leaflet'
import { getLocationsByContinent } from '../lib/locations'
import { getBoundsForContinent, REGIONS } from '../data/continentBounds'
import { useTheme } from '../context/ThemeContext'
import 'leaflet/dist/leaflet.css'

const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const DARK_TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const TILE_OPTIONS = {
  maxZoom: 19,
}
const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
const DARK_ATTRIBUTION = `${OSM_ATTRIBUTION} &copy; <a href="https://carto.com/attributions">CARTO</a>`

function createGlowIcon() {
  return L.divIcon({
    html: `
      <div class="pin-wrapper">
        <div class="pin-glow"></div>
        <div class="pin-core"></div>
      </div>
    `,
    className: 'glow-pin',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  })
}

function MapBounds({ region }) {
  const map = useMap()
  const bounds = getBoundsForContinent(region)
  useEffect(() => {
    if (bounds && region) {
      map.fitBounds([bounds[0], bounds[1]], { padding: [80, 80], maxZoom: 6 })
    }
  }, [map, region, bounds])
  return null
}

function createDimmedIcon() {
  return L.divIcon({
    html: `
      <div class="pin-wrapper pin-pending">
        <div class="pin-glow"></div>
        <div class="pin-core"></div>
      </div>
    `,
    className: 'glow-pin glow-pin-pending',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  })
}

export default function ContinentMap({ selectedRegion = 'Africa', onRegionChange, onLocationClick, onBackToGlobe, onProposeMission }) {
  const navigate = useNavigate()
  const showBackToGlobe = onBackToGlobe != null
  const { theme } = useTheme()
  const region = selectedRegion
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getLocationsByContinent(region).then((data) => {
      if (!cancelled) {
        setLocations(data ?? [])
        setLoading(false)
      }
    }).catch(() => {
      if (!cancelled) {
        setLocations([])
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [region])

  const isDark = theme === 'dark'
  const tileUrl = isDark ? DARK_TILE_URL : OSM_TILE_URL
  const tileAttribution = isDark ? DARK_ATTRIBUTION : OSM_ATTRIBUTION
  const bounds = getBoundsForContinent(region)
  const center = bounds ? [
    (bounds[0][0] + bounds[1][0]) / 2,
    (bounds[0][1] + bounds[1][1]) / 2,
  ] : [20, 0]

  return (
    <div className="absolute inset-0 w-full h-full flex flex-col bg-[var(--color-app-bg)]">
      {/* Top bar: Back to Globe (left) + Region buttons (center) — no overlap */}
      <div className="absolute top-4 left-0 right-0 z-[1000] flex items-center justify-between gap-4 px-4">
        {showBackToGlobe ? (
          <button
            onClick={onBackToGlobe}
            className="shrink-0 px-4 py-2 rounded border-2 border-[var(--color-neon-cyan)] bg-[var(--color-neon-cyan)]/10 text-[var(--color-neon-cyan)] font-[var(--font-pixel-alt)] text-lg hover:bg-[var(--color-neon-cyan)]/20 transition-all"
            style={{ boxShadow: '0 0 12px rgba(0, 245, 255, 0.3)' }}
          >
            ← Back to Globe
          </button>
        ) : (
          <button
            onClick={() => navigate('/')}
            className="shrink-0 px-4 py-2 rounded border border-[var(--color-neon-cyan)]/50 text-[var(--color-neon-cyan)] font-[var(--font-body)] text-sm hover:bg-[var(--color-neon-cyan)]/10 transition-all"
          >
            ← Home
          </button>
        )}
        <div className="flex gap-2 flex-wrap justify-center flex-1 min-w-0">
          {REGIONS.map((r) => (
            <RegionButton
              key={r}
              label={r}
              active={r === region}
              onClick={() => onRegionChange?.(r)}
            />
          ))}
        </div>
        <div className="w-[140px] shrink-0" aria-hidden />
      </div>

      {/* Map */}
      <div className="flex-1 min-h-0 relative mt-14">
        <MapContainer
          center={center}
          zoom={3}
          className="w-full h-full continent-map"
          style={{ background: 'var(--color-app-bg)' }}
          zoomControl={false}
        >
          <ZoomControl position="bottomright" />
          <TileLayer url={tileUrl} attribution={tileAttribution} {...TILE_OPTIONS} />
          <MapBounds region={region} />

          {loading && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[500] px-4 py-2 rounded bg-[var(--color-app-panel)]/90 border border-[var(--color-neon-cyan)] text-[var(--color-neon-cyan)] font-[var(--font-pixel-alt)] text-sm">
              Loading locations…
            </div>
          )}
          {locations.map((loc) => (
            <Marker
              key={loc.id}
              position={[loc.lat, loc.lng]}
              icon={loc.isProposed ? createDimmedIcon() : createGlowIcon()}
              eventHandlers={{ click: () => onLocationClick?.(loc) }}
            >
              <Tooltip direction="top" permanent={false}>
                {loc.isProposed ? (
                  <>
                    <span className="font-[var(--font-pixel-alt)] text-[var(--color-neon-orange)]">Pending Review</span>
                    <br />
                    <span className="text-[var(--color-app-text)]/70 text-xs">{loc.name}</span>
                  </>
                ) : (
                  <>
                    <span className="font-[var(--font-pixel-alt)]">{loc.nonprofit}</span>
                    <br />
                    <span className="text-[var(--color-app-text)]/70 text-xs">{loc.name}</span>
                  </>
                )}
              </Tooltip>
              <Popup>
                <div className="font-[var(--font-pixel-alt)] text-sm">
                  <p className="font-bold text-[var(--color-neon-cyan)]">{loc.name}</p>
                  <p className="text-[var(--color-app-text)]/80">{loc.nonprofit}</p>
                  {loc.isProposed ? (
                    <p className="text-[var(--color-neon-orange)] text-xs">Pending Review</p>
                  ) : (
                    <p className="text-[var(--color-neon-green)] text-xs">Impact: {loc.impact} lives</p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Propose Mission Center floating button */}
      {onProposeMission && (
        <button
          onClick={onProposeMission}
          className="absolute bottom-4 right-4 z-[500] px-4 py-2 rounded border-2 border-[var(--color-neon-magenta)] bg-[var(--color-neon-magenta)]/20 text-[var(--color-neon-magenta)] font-[var(--font-pixel-alt)] text-base hover:bg-[var(--color-neon-magenta)]/30 transition-all flex items-center gap-2"
          style={{ boxShadow: '0 0 15px rgba(255, 0, 255, 0.3)' }}
        >
          + Propose Mission Center
        </button>
      )}

      {/* Corner accents */}
      <div className="absolute bottom-4 right-20 w-12 h-12 border-r-2 border-b-2 border-[var(--color-neon-cyan)] opacity-40 pointer-events-none" />
    </div>
  )
}

function RegionButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded border font-[var(--font-pixel-alt)] text-sm transition-all ${
        active
          ? 'border-[var(--color-neon-cyan)] bg-[var(--color-neon-cyan)]/20 text-[var(--color-neon-cyan)]'
          : 'border-[var(--color-app-panel-border)] bg-[var(--color-app-panel)]/50 text-[var(--color-app-text)]/80 hover:border-[var(--color-neon-cyan)]/60 hover:bg-[var(--color-neon-cyan)]/10'
      }`}
    >
      {label}
    </button>
  )
}
