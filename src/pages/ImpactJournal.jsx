/**
 * Impact Journal — quest history feed
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../hooks/useUser'
import { getSubmissionsByUserId } from '../lib/submissions'
import { getCountryFlag } from '../data/countryFlags'

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

function getBorderGlow(score) {
  const s = score ?? 0
  if (s >= 400) return 'var(--color-neon-cyan)'
  if (s >= 200) return 'var(--color-neon-magenta)'
  return 'var(--color-neon-orange)'
}

export default function ImpactJournal() {
  const navigate = useNavigate()
  const { user: supabaseUser, authenticated, login } = useUser()
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (supabaseUser?.id) {
      getSubmissionsByUserId(supabaseUser.id).then(setSubmissions).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [supabaseUser?.id])

  const pending = submissions.filter((s) => s.status === 'pending')
  const history = submissions.filter((s) => s.status !== 'pending').sort((a, b) => {
    const da = new Date(a.activity_date || a.created_at || 0).getTime()
    const db = new Date(b.activity_date || b.created_at || 0).getTime()
    return db - da
  })

  if (!authenticated) {
    return (
      <div className="flex-1 p-6 sm:p-8 overflow-auto page-enter flex items-center justify-center">
        <div className="text-center">
          <p className="font-[var(--font-body)] text-lg text-[var(--color-app-text-muted)] mb-4">Log in to view your impact journal</p>
          <button onClick={login} className="px-6 py-3 rounded-lg border-2 border-[var(--color-neon-cyan)] bg-[var(--color-neon-cyan)]/10 text-[var(--color-neon-cyan)] font-[var(--font-body)] font-medium hover:bg-[var(--color-neon-cyan)]/20 transition-all">
            Log in
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 sm:p-8 overflow-auto page-enter">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-[var(--font-pixel)] text-[10px] text-[var(--color-neon-cyan)] uppercase tracking-widest mb-2">Impact Journal</h1>
          <h2 className="font-[var(--font-body)] text-2xl md:text-3xl text-[var(--color-app-text)]">Your volunteer history</h2>
        </div>

        {pending.length > 0 && (
          <div className="mb-8 p-5 rounded-xl glass-card" style={{ borderLeft: '4px solid var(--color-neon-amber)' }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block px-3 py-1 rounded-lg font-[var(--font-pixel)] text-[9px] bg-[var(--color-neon-amber)]/20 text-[var(--color-neon-amber)] uppercase animate-pulse">
                Awaiting Review ({pending.length})
              </span>
            </div>
            <p className="font-[var(--font-body)] text-base text-[var(--color-app-text)]">Your impact is being verified. Tokens will be airdropped once approved.</p>
            <div className="mt-3 space-y-2">
              {pending.map((sub) => {
                const loc = sub.locations
                return (
                  <div key={sub.id} className="p-3 rounded-lg bg-[var(--color-neon-amber)]/5 border border-[var(--color-neon-amber)]/20">
                    <p className="font-[var(--font-body)] text-sm text-[var(--color-app-text)]">{loc?.name ?? 'Mission'}</p>
                    <p className="font-[var(--font-body)] text-xs text-[var(--color-app-text-muted)]">{sub.activity_date ? new Date(sub.activity_date).toLocaleDateString() : ''} · {sub.hours_logged}h</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-xl p-6 skeleton-shimmer" style={{ minHeight: 160 }} />
            ))}
          </div>
        ) : history.length === 0 && pending.length === 0 ? (
          <div className="p-10 rounded-xl glass-card border border-dashed border-[var(--glass-border)] text-center">
            <p className="font-[var(--font-body)] text-lg text-[var(--color-app-text-muted)] mb-5">No submissions yet</p>
            <button onClick={() => navigate('/map')} className="px-6 py-3 rounded-lg border-2 border-[var(--color-neon-orange)]/50 bg-[var(--color-neon-orange)]/10 text-[var(--color-neon-orange)] font-[var(--font-body)] font-medium hover:bg-[var(--color-neon-orange)]/20 transition-all duration-200">
              Browse quests →
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {history.map((sub) => {
              const glow = getBorderGlow(sub.final_score)
              const loc = sub.locations
              const activityColor = ACTIVITY_COLORS[sub.activity_type || loc?.category] || ACTIVITY_COLORS.general
              return (
                <div
                  key={sub.id}
                  className="glass-card card-hover rounded-xl p-6 flex flex-col sm:flex-row gap-5"
                  style={{ border: '1px solid rgba(255,255,255,0.08)', borderLeft: `4px solid ${glow}`, boxShadow: `2px 0 20px ${glow}30` }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getCountryFlag(loc?.country)}</span>
                      <h4 className="font-[var(--font-body)] font-semibold text-lg text-[var(--color-app-text)]">{loc?.name ?? 'Mission'}</h4>
                    </div>
                    <p className="font-[var(--font-body)] text-sm text-[var(--color-app-text-muted)]">{sub.activity_date ? new Date(sub.activity_date).toLocaleDateString() : ''} · {sub.hours_logged}h</p>
                    <span className="inline-block mt-2 px-2.5 py-1 rounded font-[var(--font-pixel)] text-[8px]" style={{ background: `${activityColor}20`, color: activityColor, border: `1px solid ${activityColor}40` }}>
                      {sub.activity_type || loc?.category || 'volunteering'}
                    </span>
                    {sub.public_summary && (
                      <div className="mt-4 p-4 rounded-lg bg-white/[0.04] border border-white/5">
                        <p className="font-[var(--font-body)] text-base italic text-[var(--color-app-text)]">"{sub.public_summary}"</p>
                      </div>
                    )}
                    {sub.standout_detail && <p className="mt-2 font-[var(--font-body)] text-sm text-[var(--color-neon-green)]">Standout: {sub.standout_detail}</p>}
                  </div>
                  <div className="flex flex-row sm:flex-col items-start sm:items-end gap-4 shrink-0">
                    {sub.photo_url && (
                      <img src={sub.photo_url} alt="" className="w-20 h-20 object-cover rounded-lg border border-[var(--glass-border)]" />
                    )}
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-[var(--font-pixel)] text-2xl text-[var(--color-neon-cyan)]" style={{ textShadow: '0 0 15px rgba(0, 245, 255, 0.5)' }}>{sub.final_score ?? 0}</span>
                      <span className="font-[var(--font-body)] text-[var(--color-neon-gold)] font-semibold">{sub.token_airdrop_amount ?? 0} XPNC</span>
                      <span
                        className={`px-2 py-0.5 rounded font-[var(--font-pixel)] text-[8px] ${sub.status === 'approved' ? 'bg-[var(--color-neon-green)]/20 text-[var(--color-neon-green)]' : sub.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-[var(--color-neon-amber)]/20 text-[var(--color-neon-amber)]'}`}
                      >
                        {sub.status}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
