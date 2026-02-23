/**
 * Globe3D — Interactive 3D globe with continent outlines and click detection
 * Uses manual raycasting (capture phase) so clicks work before OrbitControls.
 */
import { useRef, useState, useEffect, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import ThreeGlobe from 'three-globe'
import { getContinentFromISO } from '../data/continentMap'

const COUNTRIES_GEOJSON_URL = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson'
const NEON_CYAN = '#00f5ff'
const GLOBE_DARK_URL = 'https://unpkg.com/three-globe/example/img/earth-dark.jpg'
const GLOBE_LIGHT_URL = 'https://unpkg.com/three-globe/example/img/earth-day.jpg'

function GlobeRotation({ globeRef, isPaused }) {
  useFrame((_, delta) => {
    if (globeRef?.current && !isPaused) {
      globeRef.current.rotation.y += delta * 0.15
    }
  })
  return null
}

/** Pulsing points at volunteer locations — heartbeat animation */
function GlobePulsePoints({ globeRef, pulsePoints }) {
  const timeRef = useRef(0)
  useFrame((_, delta) => {
    timeRef.current += delta
    if (!globeRef?.current?.pointsData || !pulsePoints?.length) return
    const t = timeRef.current
    const pulse = 0.15 + 0.08 * Math.sin(t * 2.2)
    const data = pulsePoints.map((p, i) => ({
      ...p,
      pointAltitude: pulse + (i % 3) * 0.02,
      pointRadius: 0.6 + 0.2 * Math.sin(t * 2.2 + i * 0.5),
    }))
    globeRef.current.pointsData(data)
  })
  return null
}

function getContinentFromHit(object) {
  let obj = object
  while (obj && !obj.__data) obj = obj.parent
  if (obj?.__data) {
    const feature = obj.__data?.data || obj.__data
    const isoA2 = feature?.properties?.ISO_A2 || feature?.properties?.iso_a2
    return getContinentFromISO(isoA2)
  }
  return null
}

/** Manual click handler — runs in capture phase before OrbitControls */
function GlobeClickHandler({ globeRef, onContinentClick }) {
  const { camera, gl } = useThree()
  const raycaster = useRef(new THREE.Raycaster())
  const mouse = useRef(new THREE.Vector2())
  const pendingClick = useRef(null)

  useEffect(() => {
    const canvas = gl.domElement

    const handlePointerDown = (e) => {
      if (!globeRef?.current) return
      const rect = canvas.getBoundingClientRect()
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.current.setFromCamera(mouse.current, camera)
      const intersects = raycaster.current.intersectObject(globeRef.current, true)
      for (const hit of intersects) {
        const continent = getContinentFromHit(hit.object)
        if (continent) {
          e.preventDefault()
          e.stopPropagation()
          pendingClick.current = continent
          return
        }
      }
      pendingClick.current = null
    }

    const handlePointerUp = () => {
      if (pendingClick.current) {
        onContinentClick?.(pendingClick.current)
        pendingClick.current = null
      }
    }

    canvas.addEventListener('pointerdown', handlePointerDown, { capture: true })
    window.addEventListener('pointerup', handlePointerUp)
    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown, { capture: true })
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [camera, gl, globeRef, onContinentClick])

  return null
}

export default function Globe3D({ onContinentClick, theme = 'dark', className = '', interactive = true, pulsePoints }) {
  const globeRef = useRef(null)
  const globeInstanceRef = useRef(null)
  const [globeReady, setGlobeReady] = useState(false)
  const [isPointerOver, setIsPointerOver] = useState(false)
  const [isOverClickable, setIsOverClickable] = useState(false)
  const isDark = theme === 'dark'

  const handleContinentClick = useCallback(
    (continent) => {
      onContinentClick?.(continent)
    },
    [onContinentClick]
  )

  useEffect(() => {
    let mounted = true
    let globe
    const impactRings = []
    const impactPoints = []
    let pulseInterval
    const pointLifetime = 2400

    const spawnImpactPulse = () => {
      if (!globe?.ringsData) return
      const lat = (Math.random() - 0.5) * 160
      const lng = (Math.random() - 0.5) * 360
      const id = Date.now()
      impactRings.push({ lat, lng, id })
      if (impactRings.length > 12) impactRings.shift()
      globe.ringsData([...impactRings])

      impactPoints.push({ lat, lng, id, spawn: id })
      if (impactPoints.length > 12) impactPoints.shift()
      globe.pointsData([...impactPoints])

      setTimeout(() => {
        const idx = impactPoints.findIndex((p) => p.id === id)
        if (idx >= 0) {
          impactPoints.splice(idx, 1)
          if (globe) globe.pointsData([...impactPoints])
        }
      }, pointLifetime)
    }

    fetch(COUNTRIES_GEOJSON_URL)
      .then((res) => res.json())
      .then((geojson) => {
        if (!mounted) return

        const countries = geojson.features.filter((f) => f.properties?.ISO_A2 !== 'AQ')

        globe = new ThreeGlobe({ waitForGlobeReady: true })
          .globeImageUrl(GLOBE_DARK_URL)
          .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
          .polygonsData(countries)
          .polygonCapColor(() => 'rgba(0, 20, 40, 0.7)')
          .polygonSideColor(() => 'rgba(0, 30, 60, 0.3)')
          .polygonStrokeColor(() => NEON_CYAN)
          .polygonAltitude(0.001)
          .ringsData([])
          .ringColor(() => 'rgba(200, 255, 255, 0.7)')
          .ringMaxRadius(2.2)
          .ringPropagationSpeed(1.2)
          .ringRepeatPeriod(0)
          .pointsData([])
          .pointColor(() => 'rgba(220, 255, 255, 0.85)')
          .pointAltitude(0)
          .pointRadius(0.5)

        globeRef.current = globe
        globeInstanceRef.current = globe
        setGlobeReady(true)
        if (!pulsePoints?.length) {
          pulseInterval = setInterval(spawnImpactPulse, 2200)
        } else {
          const pts = pulsePoints.map((p, i) => ({
            ...p,
            pointAltitude: 0.1,
            pointRadius: 0.6,
            pointColor: 'rgba(0, 245, 255, 0.9)',
          }))
          globe.pointColor(() => 'rgba(0, 245, 255, 0.9)')
          globe.pointAltitude(() => 0.1)
          globe.pointsData(pts)
        }
      })
      .catch((err) => console.error('Failed to load globe data:', err))

    return () => {
      mounted = false
      if (pulseInterval) clearInterval(pulseInterval)
      globeRef.current = null
      globeInstanceRef.current = null
    }
  }, [pulsePoints])

  useEffect(() => {
    const globe = globeInstanceRef.current
    if (!globe || !globeReady) return
    globe.globeImageUrl(isDark ? GLOBE_DARK_URL : GLOBE_LIGHT_URL)
    globe.polygonCapColor(() => (isDark ? 'rgba(0, 20, 40, 0.7)' : 'rgba(200, 220, 255, 0.35)'))
    globe.polygonSideColor(() => (isDark ? 'rgba(0, 30, 60, 0.3)' : 'rgba(180, 200, 255, 0.25)'))
    globe.ringColor(() => (isDark ? 'rgba(200, 255, 255, 0.7)' : 'rgba(0, 120, 160, 0.6)'))
    globe.pointColor(() => (isDark ? 'rgba(220, 255, 255, 0.85)' : 'rgba(0, 100, 140, 0.75)'))
  }, [theme, globeReady, isDark])

  return (
    <div
      className={`absolute inset-0 w-full h-full min-h-0 overflow-hidden bg-[var(--color-app-bg)] ${className}`}
      aria-label="3D Globe View"
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 245, 255, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 245, 255, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <Canvas
        camera={{ position: [0, 0, 250], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
        style={{ cursor: interactive ? (isOverClickable ? 'pointer' : 'grab') : 'default' }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[2, 2, 4]} intensity={1.5} />

        {/* Hover glow — atmosphere (raycast disabled so it doesn't block country clicks) */}
        {globeReady && (
          <mesh
            ref={(el) => {
              if (el) el.raycast = () => {}
            }}
          >
            <sphereGeometry args={[101.5, 32, 32]} />
            <meshBasicMaterial
              color={NEON_CYAN}
              transparent
              opacity={isPointerOver ? 0.12 : 0.04}
            />
          </mesh>
        )}

        {globeReady && globeRef.current && (
          <>
            <GlobeRotation globeRef={globeRef} isPaused={interactive && isPointerOver} />
            {pulsePoints?.length > 0 && <GlobePulsePoints globeRef={globeRef} pulsePoints={pulsePoints} />}
            {interactive && <GlobeClickHandler globeRef={globeRef} onContinentClick={handleContinentClick} />}
            <group
              {...(interactive
                ? {
                    onPointerOver: (e) => {
                      setIsPointerOver(true)
                      const continent = getContinentFromHit(e.object)
                      setIsOverClickable(!!continent)
                    },
                    onPointerMove: (e) => {
                      const continent = getContinentFromHit(e.object)
                      setIsOverClickable(!!continent)
                    },
                    onPointerOut: () => {
                      setIsPointerOver(false)
                      setIsOverClickable(false)
                    },
                  }
                : {})}
            >
              <primitive object={globeRef.current} />
            </group>
            {interactive && (
              <OrbitControls
                enableRotate={true}
                enableZoom={true}
                enablePan={false}
                minDistance={120}
                maxDistance={400}
                rotateSpeed={1.2}
                enableDamping
                dampingFactor={0.05}
              />
            )}
          </>
        )}
      </Canvas>

      {/* Corner accents */}
      <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-[var(--color-neon-cyan)] opacity-50 pointer-events-none" />
      <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-[var(--color-neon-cyan)] opacity-50 pointer-events-none" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-[var(--color-neon-cyan)] opacity-50 pointer-events-none" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-[var(--color-neon-cyan)] opacity-50 pointer-events-none" />
    </div>
  )
}
