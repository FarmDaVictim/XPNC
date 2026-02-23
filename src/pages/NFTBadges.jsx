import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../hooks/useUser'
import { getSubmissionsByUserId } from '../lib/submissions'
import { getBadgesByUserId, checkAndAwardBadges } from '../lib/badges'
import { BADGES } from '../data/badges'

export default function NFTBadges() {
  const navigate = useNavigate()
  const { user: supabaseUser, authenticated, login } = useUser()
  const [submissions, setSubmissions] = useState([])
  const [earnedBadges, setEarnedBadges] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (supabaseUser?.id) {
      Promise.all([getSubmissionsByUserId(supabaseUser.id), getBadgesByUserId(supabaseUser.id)]).then(([subs, badges]) => {
        setSubmissions(subs)
        checkAndAwardBadges(supabaseUser.id, subs).then(setEarnedBadges).catch(() => setEarnedBadges(badges)).finally(() => setLoading(false))
      }).catch(() => setLoading(false))
    } else setLoading(false)
  }, [supabaseUser?.id])

  const earnedIds = new Set(earnedBadges.map((b) => b.badge_name))
  const earned = BADGES.filter((b) => earnedIds.has(b.id))
  const locked = BADGES.filter((b) => !earnedIds.has(b.id))

  if (!authenticated) {
    return (
      <div className="flex-1 p-6 sm:p-8 overflow-auto page-enter flex items-center justify-center">
        <div className="text-center">
          <p className="font-[var(--font-body)] text-lg text-[var(--color-app-text-muted)] mb-4">Log in to view your badges</p>
          <button onClick={login} className="px-6 py-3 rounded-lg border-2 border-[var(--color-neon-cyan)] bg-[var(--color-neon-cyan)]/10 text-[var(--color-neon-cyan)] font-[var(--font-body)] font-medium">Log in</button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 sm:p-8 overflow-auto page-enter">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-[var(--font-pixel)] text-[10px] text-[var(--color-neon-magenta)] uppercase tracking-widest mb-2">NFT Badges</h1>
          <h2 className="font-[var(--font-body)] text-2xl md:text-3xl text-[var(--color-app-text)]">Achievement Gallery</h2>
          <p className="mt-2 font-[var(--font-body)] text-[var(--color-app-text-muted)]">{loading ? '…' : `${earned.length} of ${BADGES.length} badges earned`}</p>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass-card rounded-xl p-6 skeleton-shimmer" style={{ minHeight: 140 }} />
            ))}
          </div>
        ) : (
          <>
            <section className="mb-12">
              <h3 className="font-[var(--font-pixel)] text-[9px] text-[var(--color-neon-magenta)] uppercase tracking-wider mb-4">Earned</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                {earned.map((b) => (
                  <div key={b.id} className="glass-card card-hover rounded-xl p-5 text-center" style={{ border: '1px solid rgba(168,85,247,0.3)', boxShadow: '0 0 30px rgba(168,85,247,0.2)' }}>
                    <span className="text-4xl block mb-3">{b.icon}</span>
                    <p className="font-[var(--font-pixel)] text-[9px] uppercase text-[var(--color-app-text)]">{b.name}</p>
                    <p className="font-[var(--font-body)] text-xs text-[var(--color-neon-magenta)] mt-2">Earned</p>
                  </div>
                ))}
              </div>
              {earned.length === 0 && <p className="font-[var(--font-body)] text-[var(--color-app-text-muted)] py-8">Complete quests to earn your first badge.</p>}
            </section>
            <section>
              <h3 className="font-[var(--font-pixel)] text-[9px] text-[var(--color-app-text-muted)] uppercase tracking-wider mb-4">Locked</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {locked.map((b) => {
                  const hint = b.unlockHint(submissions)
                  return (
                    <div key={b.id} className="glass-card rounded-xl p-4 text-center opacity-70" style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.25)', filter: 'saturate(0.6)' }}>
                      <span className="text-3xl block mb-2">🔒</span>
                      <p className="font-[var(--font-pixel)] text-[8px] uppercase text-[var(--color-app-text-muted)]">{b.name}</p>
                      {hint && <p className="font-[var(--font-body)] text-[9px] text-[var(--color-app-text-muted)] mt-2 line-clamp-2">{hint}</p>}
                    </div>
                  )
                })}
              </div>
            </section>
          </>
        )}
        <div className="mt-10">
          <button onClick={() => navigate('/quests')} className="px-5 py-2.5 rounded-lg border border-[var(--color-neon-cyan)]/50 text-[var(--color-neon-cyan)] font-[var(--font-body)] text-sm hover:bg-[var(--color-neon-cyan)]/10">Browse quests to earn more →</button>
        </div>
      </div>
    </div>
  )
}
