/**
 * Dashboard — hero profile landing page
 * Hero, stats, recent submission only
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../hooks/useUser'
import { getSubmissionsByUserId } from '../lib/submissions'
import {
  LEVEL_TITLES,
  getLevelFromXP,
  getXPProgress,
} from '../data/badges'
import { getCountryFlag } from '../data/countryFlags'

function getBorderGlow(score) {
  const s = score ?? 0
  if (s >= 400) return 'var(--color-neon-cyan)'
  if (s >= 200) return 'var(--color-neon-magenta)'
  return 'var(--color-neon-orange)'
}

function useCountUp(end, duration = 1200, deps = []) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (end === 0) return
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const t = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - t, 2)
      setValue(Math.round(eased * end))
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [end, duration, ...deps])
  return value
}

const ACTIVITY_COLORS = {
  education: 'var(--color-neon-cyan)',
  health: 'var(--color-neon-magenta)',
  food: 'var(--color-neon-orange)',
  environment: 'var(--color-neon-green)',
  community: 'var(--color-neon-cyan)',
  emergency: 'var(--color-neon-orange)',
  animals: 'var(--color-neon-magenta)',
  science: 'var(--color-neon-cyan)',
  general: 'var(--color-app-text-muted)',
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user: supabaseUser, username, impactPoints, authenticated } = useUser()
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)

  const impactCount = useCountUp(impactPoints ?? 0, 1200, [impactPoints])

  useEffect(() => {
    if (supabaseUser?.id) {
      getSubmissionsByUserId(supabaseUser.id)
        .then(setSubmissions)
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [supabaseUser?.id])

  const approved = submissions.filter((s) => s.status === 'approved')
  const totalHours = approved.reduce((sum, s) => sum + (s.hours_logged || 0), 0)
  const countries = new Set(approved.map((s) => s.locations?.country).filter(Boolean))
  const totalTokens = approved.reduce((sum, s) => sum + (s.token_airdrop_amount || 0), 0)

  const level = getLevelFromXP(impactPoints ?? 0)
  const levelTitle = LEVEL_TITLES[level] ?? 'Hero'
  const xpProgress = getXPProgress(impactPoints ?? 0)

  const recentSubmission = [...submissions].sort((a, b) => {
    const da = new Date(a.activity_date || a.created_at || 0).getTime()
    const db = new Date(b.activity_date || b.created_at || 0).getTime()
    return db - da
  })[0]

  return (
    <div className="flex-1 p-6 sm:p-8 overflow-auto page-enter">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-[var(--font-pixel)] text-[10px] text-[var(--color-neon-cyan)] uppercase tracking-widest mb-5">
          Hero Profile
        </h1>

        {/* HERO */}
        <div className="relative flex flex-col md:flex-row md:items-start gap-6 mb-10 overflow-hidden">
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(0,245,255,0.08) 50%, rgba(168,85,247,0.1) 100%)',
              backgroundSize: '200% 200%',
              animation: 'heroGradient 8s ease-in-out infinite',
            }}
          />
          <div
            className="relative w-28 h-28 rounded-full flex items-center justify-center text-4xl font-[var(--font-pixel)] text-[var(--color-neon-cyan)] shrink-0"
            style={{
              border: '3px solid rgba(0, 245, 255, 0.5)',
              boxShadow: '0 0 30px rgba(0, 245, 255, 0.3), inset 0 0 20px rgba(0, 245, 255, 0.1)',
              background: 'rgba(0, 245, 255, 0.06)',
            }}
          >
            {(username || 'H').charAt(0).toUpperCase()}
          </div>
          <div className="relative flex-1 min-w-0">
            <h2 className="font-[var(--font-pixel)] text-2xl md:text-3xl text-[var(--color-app-text)]">
              {username || 'Hero'}
            </h2>
            <p className="font-[var(--font-body)] text-lg text-[var(--color-neon-cyan)] mt-1">
              LVL {level} — {levelTitle}
            </p>
            <div className="mt-4">
              <div className="flex justify-between font-[var(--font-body)] text-xs text-[var(--color-app-text-muted)] mb-1">
                <span>{xpProgress.progress} / {xpProgress.needed} XP</span>
                <span>{xpProgress.isMax ? 'MAX' : `to Level ${level + 1}`}</span>
              </div>
              <div className="h-3 rounded-full bg-black/40 border border-[var(--color-neon-cyan)]/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--color-neon-cyan)] transition-all duration-700"
                  style={{
                    width: `${xpProgress.isMax ? 100 : Math.min(100, (xpProgress.progress / xpProgress.needed) * 100)}%`,
                    boxShadow: '0 0 12px rgba(0, 245, 255, 0.5)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          {[
            { label: 'Impact Points', value: impactCount, color: 'var(--color-neon-green)', icon: '↑' },
            { label: 'Hours Logged', value: totalHours, color: 'var(--color-neon-cyan)' },
            { label: 'Countries', value: countries.size, color: 'var(--color-neon-magenta)' },
            { label: 'Quests Done', value: approved.length, color: 'var(--color-neon-orange)' },
            { label: 'XPNC Tokens', value: totalTokens, color: 'var(--color-neon-gold)', sub: 'More coming soon' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass-card card-hover rounded-xl p-5 relative overflow-hidden"
              style={{
                border: '1px solid rgba(255,255,255,0.08)',
                borderTop: `4px solid ${stat.color}`,
              }}
            >
              <p className="font-[var(--font-pixel)] text-[9px] uppercase mb-1" style={{ color: stat.color }}>
                {stat.label}
              </p>
              <p className="font-[var(--font-body)] text-xl font-semibold text-[var(--color-app-text)] flex items-center gap-1">
                {stat.value}
                {stat.icon && <span style={{ color: stat.color }}>{stat.icon}</span>}
              </p>
              {stat.sub && (
                <p className="font-[var(--font-body)] text-[10px] text-[var(--color-app-text-muted)] mt-1">{stat.sub}</p>
              )}
            </div>
          ))}
        </div>

        {/* RECENT SUBMISSION */}
        <section>
          <h3 className="font-[var(--font-pixel)] text-[10px] text-[var(--color-neon-cyan)] uppercase tracking-wider mb-4">
            Recent activity
          </h3>
          {loading ? (
            <div className="glass-card rounded-xl p-6 skeleton-shimmer" style={{ minHeight: 120 }} />
          ) : recentSubmission ? (
            <div
              className="glass-card card-hover rounded-xl p-5 flex flex-col sm:flex-row gap-4"
              style={{
                border: '1px solid rgba(255,255,255,0.08)',
                borderLeft: `4px solid ${getBorderGlow(recentSubmission.final_score)}`,
              }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getCountryFlag(recentSubmission.locations?.country)}</span>
                  <h4 className="font-[var(--font-body)] font-semibold text-[var(--color-app-text)]">
                    {recentSubmission.locations?.name ?? 'Mission'}
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded font-[var(--font-pixel)] text-[8px] ${
                      recentSubmission.status === 'approved' ? 'bg-[var(--color-neon-green)]/20 text-[var(--color-neon-green)]'
                      : recentSubmission.status === 'rejected' ? 'bg-red-500/20 text-red-400'
                      : 'bg-[var(--color-neon-amber)]/20 text-[var(--color-neon-amber)]'
                    }`}
                  >
                    {recentSubmission.status}
                  </span>
                </div>
                <p className="font-[var(--font-body)] text-sm text-[var(--color-app-text-muted)] mt-1">
                  {recentSubmission.activity_date ? new Date(recentSubmission.activity_date).toLocaleDateString() : ''} · {recentSubmission.hours_logged}h
                </p>
                {recentSubmission.public_summary && (
                  <p className="mt-2 font-[var(--font-body)] text-sm italic text-[var(--color-app-text)] line-clamp-2">
                    "{recentSubmission.public_summary}"
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {recentSubmission.photo_url && (
                  <img src={recentSubmission.photo_url} alt="" className="w-16 h-16 object-cover rounded-lg border border-[var(--glass-border)]" />
                )}
                <div className="text-right">
                  <span className="font-[var(--font-pixel)] text-xl text-[var(--color-neon-cyan)]">{recentSubmission.final_score ?? 0}</span>
                  <p className="font-[var(--font-body)] text-sm text-[var(--color-neon-gold)]">{recentSubmission.token_airdrop_amount ?? 0} XPNC</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-xl p-6 border border-dashed border-[var(--glass-border)] text-center">
              <p className="font-[var(--font-body)] text-[var(--color-app-text-muted)] mb-4">No submissions yet</p>
              <button
                onClick={() => navigate('/map')}
                className="px-5 py-2.5 rounded-lg border-2 border-[var(--color-neon-cyan)]/50 bg-[var(--color-neon-cyan)]/10 text-[var(--color-neon-cyan)] font-[var(--font-body)] font-medium hover:bg-[var(--color-neon-cyan)]/20"
              >
                Browse quests →
              </button>
            </div>
          )}
          {recentSubmission && (
            <button
              onClick={() => navigate('/journal')}
              className="mt-3 text-[var(--color-neon-cyan)] font-[var(--font-body)] text-sm hover:underline"
            >
              View full journal →
            </button>
          )}
        </section>
      </div>
      <style>{`
        @keyframes heroGradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  )
}
