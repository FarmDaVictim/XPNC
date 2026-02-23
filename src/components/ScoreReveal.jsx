/**
 * Impact Integrity Engine — compact single-view report
 * Designed to fit on one screen without scrolling
 */
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'

function useCountUp(end, duration = 1500, startOn = false) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!startOn || end === 0) return
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const t = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - t, 2)
      setValue(Math.round(eased * end))
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [end, duration, startOn])
  return value
}

function MiniBar({ label, value, max }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="min-w-0">
      <div className="flex justify-between font-[var(--font-pixel)] text-[8px] text-[var(--color-neon-cyan)] uppercase mb-0.5">
        <span className="truncate">{label}</span>
        <span className="shrink-0 ml-1">{value}/{max}</span>
      </div>
      <div className="h-1.5 rounded-full bg-black/50 border border-[var(--color-neon-cyan)]/20 overflow-hidden">
        <div
          className="h-full bg-[var(--color-neon-cyan)] rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, boxShadow: '0 0 6px rgba(0, 245, 255, 0.4)' }}
        />
      </div>
    </div>
  )
}

export default function ScoreReveal({ isOpen, score, onClose }) {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)
  const [scoreLanded, setScoreLanded] = useState(false)

  const countUp = useCountUp(score?.final_score ?? 0, 1500, visible)

  useEffect(() => {
    if (isOpen && score) {
      setVisible(false)
      setStep(0)
      setScoreLanded(false)
      const t = setTimeout(() => { setVisible(true); setStep(1) }, 150)
      return () => clearTimeout(t)
    }
  }, [isOpen, score?.final_score])

  useEffect(() => {
    if (visible && countUp === (score?.final_score ?? 0) && (score?.final_score ?? 0) > 0) {
      setScoreLanded(true)
    }
  }, [visible, countUp, score?.final_score])

  if (!isOpen) return null

  const s = score || {}
  const verdict = s.authenticity_verdict || 'genuine'
  const verdictStyle = {
    genuine: 'border-[#00f5ff] text-[#00f5ff]',
    questionable: 'border-amber-400 text-amber-400',
    suspicious: 'border-red-400 text-red-400',
  }
  const bonuses = Array.isArray(s.bonuses_applied) ? s.bonuses_applied : []
  const redFlags = Array.isArray(s.red_flags) ? s.red_flags : []

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.92)', animation: 'impactFadeIn 0.3s ease-out' }}
    >
      <div
        className="w-full max-w-[95vw] sm:max-w-6xl max-h-[92vh] rounded-xl overflow-auto glass-card"
        style={{
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 0 60px rgba(0, 245, 255, 0.15), 0 0 100px rgba(168, 85, 247, 0.08)',
          animation: visible ? 'impactScaleIn 0.4s ease-out' : 'none',
        }}
      >
        <div className="p-5 sm:p-6">
          {/* Row 1: Score | Verdict | Tokens — larger score, glow burst when landed */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <div className="flex items-baseline gap-2">
              <span className="font-[var(--font-pixel)] text-[9px] text-[var(--color-neon-green)] uppercase">Report</span>
              <span
                className={`font-[var(--font-pixel)] text-6xl sm:text-7xl md:text-8xl text-[var(--color-neon-green)] transition-all duration-500 ${
                  scoreLanded ? 'score-glow-burst' : ''
                }`}
                style={{
                  textShadow: '0 0 30px rgba(57, 255, 20, 0.6), 0 0 60px rgba(57, 255, 20, 0.3)',
                }}
              >
                {countUp}
              </span>
              <span className="font-[var(--font-body)] text-xl text-[var(--color-app-text-muted)]">/500</span>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded border-2 font-[var(--font-pixel)] text-[9px] uppercase ${verdictStyle[verdict]}`}>
                {verdict}
              </span>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-neon-gold)]/10 border border-[var(--color-neon-gold)]/30">
                <span className="text-xl">🪙</span>
                <span className="font-[var(--font-body)] text-xl font-bold text-[var(--color-neon-gold)]">
                  {s.token_airdrop_amount ?? 0} XPNC
                </span>
              </div>
            </div>
          </div>

          {/* Row 2: 4 score bars in a grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
            <MiniBar label="Authenticity" value={s.authenticity_score ?? 0} max={200} />
            <MiniBar label="Depth" value={s.depth_score ?? 0} max={150} />
            <MiniBar label="Learning" value={s.learning_score ?? 0} max={100} />
            <MiniBar label="Effort" value={s.effort_score ?? 0} max={50} />
          </div>

          {/* Row 3: Assessment + Standout side by side; Bonuses */}
          <div className="grid lg:grid-cols-2 gap-4 mb-5">
            {s.reasoning && (
              <div className="min-w-0">
                <span className="font-[var(--font-pixel)] text-[8px] text-[var(--color-neon-cyan)] uppercase">Assessment</span>
                <p className="mt-1 px-3 py-2 rounded border-l-2 border-[var(--color-neon-cyan)] bg-black/20 text-[var(--color-app-text)] font-[var(--font-body)] text-sm leading-snug">
                  "{s.reasoning}"
                </p>
              </div>
            )}
            {s.standout_detail && (
              <div className="min-w-0">
                <span className="font-[var(--font-pixel)] text-[8px] text-[var(--color-neon-green)] uppercase">Standout</span>
                <p className="mt-1 px-3 py-2 rounded border border-[var(--color-neon-green)]/30 bg-[var(--color-neon-green)]/5 text-[var(--color-app-text)] font-[var(--font-body)] text-sm leading-snug">
                  "{s.standout_detail}"
                </p>
              </div>
            )}
          </div>
          {bonuses.length > 0 && (
            <div className="mb-5">
              <span className="font-[var(--font-pixel)] text-[8px] text-[var(--color-neon-magenta)] uppercase">Bonuses</span>
              <div className="mt-1 flex flex-wrap gap-2">
                {bonuses.map((b, i) => (
                  <div key={i} className="px-2 py-1.5 rounded glass-card border border-[var(--color-neon-magenta)]/40">
                    <span className="font-[var(--font-body)] text-xs text-[var(--color-neon-magenta)]">+{b.points_added} {b.bonus_name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Row 4: Red flags inline + Public summary */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            {redFlags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {redFlags.map((f, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 text-xs font-[var(--font-body)]">
                    • {f}
                  </span>
                ))}
              </div>
            )}
            {s.public_summary && (
              <p className="font-[var(--font-body)] text-base sm:text-lg text-[var(--color-app-text)] flex-1 min-w-0">
                {s.public_summary}
              </p>
            )}
          </div>

          {/* Row 5: CTA */}
          <div className="flex gap-3">
            <button
              onClick={() => { onClose?.(); navigate('/dashboard?from=score') }}
              className="flex-1 py-3 rounded-lg border-2 border-[var(--color-neon-cyan)] bg-[var(--color-neon-cyan)]/10 text-[var(--color-neon-cyan)] font-[var(--font-body)] font-medium text-lg hover:bg-[var(--color-neon-cyan)]/20 hover:shadow-[0_0_20px_rgba(0,245,255,0.2)] transition-all duration-200"
            >
              View dashboard
            </button>
            <button
              onClick={onClose}
              className="px-5 py-3 rounded-lg border border-[var(--glass-border)] text-[var(--color-app-text-muted)] font-[var(--font-body)] hover:text-[var(--color-app-text)] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes impactFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes impactScaleIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
        .score-glow-burst {
          animation: scoreGlowBurst 0.6s ease-out;
        }
        @keyframes scoreGlowBurst {
          0% { filter: brightness(1); transform: scale(1); }
          30% { filter: brightness(1.4); transform: scale(1.05); }
          100% { filter: brightness(1); transform: scale(1); }
        }
      `}</style>
    </div>
  )

  return createPortal(content, document.body)
}
