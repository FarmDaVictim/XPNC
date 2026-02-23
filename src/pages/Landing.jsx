/**
 * Landing Page — cinematic globe, CTA, live activity toasts
 * Authenticated users are redirected to /map
 */
import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Globe3D from '../components/Globe3D'
import { useUser } from '../hooks/useUser'
import { getLandingStats } from '../lib/stats'

function StarField() {
  const stars = useMemo(() => Array.from({ length: 240 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 0.6 + Math.random() * 1.2,
    opacity: 0.6 + Math.random() * 0.4,
    delay: Math.random() * 4,
  })), [])
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white star-dot"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

const VOLUNTEER_PULSE_POINTS = [
  { lat: -1.3, lng: 36.8 },
  { lat: 14.6, lng: 121.0 },
  { lat: -4.0, lng: 21.8 },
  { lat: -15.8, lng: -47.9 },
  { lat: 6.5, lng: 3.4 },
  { lat: 19.1, lng: 72.9 },
  { lat: -33.9, lng: 18.4 },
  { lat: -6.2, lng: 106.8 },
]

const ACTIVITY_TOASTS = [
  'Maria in Philippines just logged 3hrs teaching • +180 XP',
  'New Mission Center proposed in Nairobi, Kenya 🌍',
  'Carlos in Colombia completed Water Aid quest • +240 XP',
  'Aisha in Nigeria earned the Rare Soul badge 💎',
  'James in Indonesia scored 420pts on Digital Literacy • +250 tokens',
  'New volunteer joined from 🇿🇲 Zambia',
]

export default function Landing() {
  const navigate = useNavigate()
  const { ready, authenticated, username, login } = useUser()
  const [toastIndex, setToastIndex] = useState(0)
  const [toastVisible, setToastVisible] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (ready && authenticated) {
      navigate('/map', { replace: true })
    }
  }, [ready, authenticated, navigate])

  useEffect(() => {
    getLandingStats().then((s) => {
      if (s && (s.missions > 0 || s.volunteers > 0 || s.countries > 0)) setStats(s)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    setToastVisible(true)
    const interval = setInterval(() => {
      setToastVisible(false)
      setTimeout(() => {
        setToastIndex((i) => (i + 1) % ACTIVITY_TOASTS.length)
        setToastVisible(true)
      }, 2000)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleEnterMissionHub = () => {
    if (authenticated) {
      setIsTransitioning(true)
      setTimeout(() => navigate('/map'), 400)
    } else {
      login?.()
    }
  }

  if (ready && authenticated) return null

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: '#050508' }}>
      {/* Star field */}
      <StarField />

      {/* Top nav */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4">
        <h1 className="font-[var(--font-pixel)] text-lg text-[var(--color-neon-cyan)] tracking-widest" style={{ textShadow: '0 0 20px rgba(0, 245, 255, 0.3)' }}>
          XPNC
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/map')}
            className="px-4 py-2 rounded-lg border border-[var(--glass-border)] text-[var(--color-app-text-muted)] font-[var(--font-body)] text-sm hover:text-[var(--color-app-text)] hover:border-[var(--color-neon-cyan)]/30 transition-all"
          >
            Explore Map
          </button>
          {authenticated ? (
            <>
              <span className="font-[var(--font-body)] text-sm text-[var(--color-app-text)] truncate max-w-[120px]">{username}</span>
              <button
                onClick={handleEnterMissionHub}
                className="px-4 py-2 rounded-lg border-2 border-[var(--color-neon-cyan)]/50 bg-[var(--color-neon-cyan)]/10 text-[var(--color-neon-cyan)] font-[var(--font-body)] font-medium hover:bg-[var(--color-neon-cyan)]/20 hover:shadow-[0_0_20px_rgba(0,245,255,0.2)] transition-all"
              >
                Enter Hub
              </button>
            </>
          ) : (
            <button
              onClick={login}
              className="px-4 py-2 rounded-lg border-2 border-[var(--color-neon-cyan)]/50 bg-[var(--color-neon-cyan)]/10 text-[var(--color-neon-cyan)] font-[var(--font-body)] font-medium hover:bg-[var(--color-neon-cyan)]/20 transition-all"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Main: text left, globe right */}
      <div className="relative flex-1 flex flex-col md:flex-row min-h-0">
        <div className="w-full md:w-1/3 md:min-w-[280px] flex flex-col justify-center px-6 md:pl-12 md:pr-4 py-8 md:py-0 z-10">
          <h2 className="font-[var(--font-pixel)] text-xl md:text-2xl lg:text-3xl text-white leading-tight">
            A Mission to Tokenize Altruism.
          </h2>
          <p className="mt-2 font-[var(--font-body)] text-sm md:text-base text-[var(--color-neon-cyan)]/80 italic max-w-sm">
            Every act of good deserves a record. We put it on chain.
          </p>
          <p className="mt-4 font-[var(--font-body)] text-base text-[var(--color-app-text-muted)] max-w-sm">
            Log your volunteer impact around the world. Earn tokens. Build the circular economy of good.
          </p>
          {stats && (
            <p className="mt-6 font-[var(--font-body)] text-sm text-[var(--color-app-text-muted)]">
              {stats.missions} missions logged · {stats.volunteers} volunteers · {stats.countries} countries
            </p>
          )}
          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={handleEnterMissionHub}
              className="px-6 py-4 rounded-lg border-2 border-[var(--color-neon-cyan)] bg-[var(--color-neon-cyan)]/10 text-[var(--color-neon-cyan)] font-[var(--font-body)] font-semibold text-lg hover:bg-[var(--color-neon-cyan)]/20 hover:shadow-[0_0_30px_rgba(0,245,255,0.25)] transition-all"
              style={{ boxShadow: '0 0 20px rgba(0, 245, 255, 0.15)' }}
            >
              Enter Mission Hub
            </button>
            <a
              href="#"
              className="px-6 py-3 rounded-lg border border-[var(--glass-border)] text-[var(--color-app-text-muted)] font-[var(--font-body)] text-sm hover:text-[var(--color-app-text)] hover:border-[var(--color-app-text-muted)]/40 transition-all text-center"
            >
              Read the Vision →
            </a>
          </div>
        </div>

        <div className="flex-1 relative flex items-center justify-center min-h-[50vh] md:min-h-[60vh] px-4">
          <div className="globe-glow-bg absolute inset-0 pointer-events-none" />
          <div className="w-full h-[50vh] md:h-[60vh] max-w-4xl [&>div]:!bg-transparent relative">
            <Globe3D theme="dark" interactive={false} pulsePoints={VOLUNTEER_PULSE_POINTS} />
          </div>
        </div>
      </div>

      {/* Live activity toasts */}
      <div className="absolute bottom-6 left-6 z-20 w-80 max-w-[calc(100vw-3rem)]">
        {toastVisible && (
          <div
            className="pl-3 py-2.5 rounded-lg border-l-4 border-[var(--color-neon-cyan)] bg-black/70 backdrop-blur-md animate-toast-in"
            style={{ borderLeftColor: 'rgba(0, 245, 255, 0.8)' }}
          >
            <p className="font-[var(--font-body)] text-xs text-[var(--color-app-text)]/90">
              {ACTIVITY_TOASTS[toastIndex]}
            </p>
          </div>
        )}
      </div>

      {/* Fade to black overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 z-[100] bg-black animate-fade-to-black pointer-events-none" />
      )}

      <style>{`
        .star-dot { animation: starTwinkle 3s ease-in-out infinite; }
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        @keyframes toast-in {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-toast-in { animation: toast-in 0.4s ease-out; }
        @keyframes fade-to-black {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-to-black { animation: fade-to-black 0.4s ease-out forwards; }
        .globe-glow-bg {
          background: radial-gradient(ellipse 80% 80% at 50% 50%, rgba(88, 28, 135, 0.15) 0%, rgba(30, 58, 138, 0.08) 40%, transparent 70%);
          animation: globeGlowPulse 12s ease-in-out infinite;
        }
        @keyframes globeGlowPulse {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
      `}</style>
    </div>
  )
}
