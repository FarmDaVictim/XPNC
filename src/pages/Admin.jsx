/**
 * Admin control panel — submission review, approved, proposed centers
 * Amber/white utilitarian aesthetic
 */
import { useEffect, useState } from 'react'
import AdminLogin from '../components/AdminLogin'
import {
  getAdminAuthed,
  setAdminAuthed,
  getAdminSubmissions,
  getAdminStats,
  getProposedLocations,
  approveSubmission,
  rejectSubmission,
  flagSubmission,
  approveLocation,
  rejectLocation,
} from '../lib/admin'

const VERDICT_STYLE = {
  genuine: 'border-[#00f5ff] text-[#00f5ff]',
  questionable: 'border-amber-400 text-amber-400',
  suspicious: 'border-red-400 text-red-400',
}

const REC_STYLE = {
  approve: 'border-[var(--color-neon-green)] text-[var(--color-neon-green)]',
  review: 'border-amber-400 text-amber-400',
  reject: 'border-red-400 text-red-400',
}

function SubmissionCard({ sub, onApprove, onReject, onFlag, condensed = false }) {
  const [rejectModal, setRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const user = sub.user || sub.users
  const loc = sub.locations
  const username = user?.username ?? 'Volunteer'
  const wallet = user?.wallet_address
  const verdict = sub.authenticity_verdict || 'genuine'
  const rec = sub.admin_recommendation || 'approve'
  const bonuses = Array.isArray(sub.bonuses_applied) ? sub.bonuses_applied : []
  const redFlags = Array.isArray(sub.red_flags) ? sub.red_flags : []

  const handleReject = () => {
    onReject(sub.id, rejectReason)
    setRejectModal(false)
    setRejectReason('')
  }

  return (
    <div
      className={`rounded-lg border-2 border-amber-400/30 bg-black/30 ${condensed ? 'p-3' : 'p-5'}`}
    >
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="font-[var(--font-pixel-alt)] text-lg text-white">{username}</span>
            {wallet && (
              <span className="font-mono text-xs text-[var(--color-app-text-muted)]">
                {wallet.slice(0, 6)}...{wallet.slice(-4)}
              </span>
            )}
          </div>
          <p className="font-[var(--font-pixel-alt)] text-amber-100">
            {loc?.name ?? 'Mission'} · {loc?.country ?? ''}
          </p>
          <p className="text-[var(--color-app-text-muted)] text-sm">
            {sub.activity_date ? new Date(sub.activity_date).toLocaleDateString() : ''} · {sub.hours_logged}h · {sub.activity_type || loc?.category}
          </p>
          {sub.photo_url && (
            <a
              href={sub.photo_url}
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-2"
            >
              <img
                src={sub.photo_url}
                alt="Proof"
                className="w-20 h-20 object-cover rounded border border-amber-400/40 hover:border-amber-400"
              />
            </a>
          )}
          {!condensed && sub.reflection && (
            <div className="mt-3 p-3 rounded bg-black/20 border-l-2 border-amber-400/50">
              <p className="font-[var(--font-pixel)] text-[8px] text-amber-400/80 uppercase mb-1">Reflection</p>
              <p className="font-[var(--font-pixel-alt)] text-sm text-[var(--color-app-text)] whitespace-pre-wrap">
                {sub.reflection}
              </p>
            </div>
          )}
        </div>
        <div className="lg:w-64 shrink-0 space-y-2">
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-0.5 rounded font-[var(--font-pixel)] text-[8px] bg-amber-400/20 text-amber-400">
              {sub.final_score ?? 0} pts
            </span>
            <span className={`px-2 py-0.5 rounded border font-[var(--font-pixel)] text-[8px] ${VERDICT_STYLE[verdict] || VERDICT_STYLE.genuine}`}>
              {verdict}
            </span>
            <span className={`px-2 py-0.5 rounded border font-[var(--font-pixel)] text-[8px] ${REC_STYLE[rec] || REC_STYLE.approve}`}>
              {rec}
            </span>
          </div>
          {!condensed && (
            <>
              <div className="text-xs text-[var(--color-app-text-muted)]">
                Auth {sub.authenticity_score ?? 0} · Depth {sub.depth_score ?? 0} · Learn {sub.learning_score ?? 0} · Effort {sub.effort_score ?? 0}
              </div>
              {sub.reasoning && (
                <blockquote className="text-sm italic text-amber-100 border-l-2 border-amber-400/50 pl-2">
                  "{sub.reasoning}"
                </blockquote>
              )}
              {sub.standout_detail && (
                <p className="text-sm text-amber-200">→ {sub.standout_detail}</p>
              )}
              {redFlags.length > 0 && (
                <ul className="text-amber-400/90 text-xs">
                  {redFlags.map((f, i) => (
                    <li key={i}>• {f}</li>
                  ))}
                </ul>
              )}
              {bonuses.length > 0 && (
                <div className="text-xs">
                  {bonuses.map((b, i) => (
                    <p key={i}>+{b.points_added} {b.bonus_name}: {b.reason}</p>
                  ))}
                </div>
              )}
            </>
          )}
          <p className="font-[var(--font-pixel-alt)] text-amber-400">
            {sub.token_airdrop_amount ?? 0} XPNC pending
          </p>
          {sub.status === 'pending' && (
            <div className="flex gap-2">
              <button
                onClick={() => onApprove(sub.id)}
                className="px-3 py-1.5 rounded border-2 border-[var(--color-neon-green)] bg-[var(--color-neon-green)]/10 text-[var(--color-neon-green)] font-[var(--font-pixel-alt)] text-sm hover:bg-[var(--color-neon-green)]/20"
              >
                Approve
              </button>
              <button
                onClick={() => setRejectModal(true)}
                className="px-3 py-1.5 rounded border border-red-400/60 text-red-400 font-[var(--font-pixel-alt)] text-sm hover:bg-red-400/10"
              >
                Reject
              </button>
              <button
                onClick={() => onFlag(sub.id)}
                className="px-3 py-1.5 rounded border border-amber-400/60 text-amber-400 font-[var(--font-pixel-alt)] text-sm hover:bg-amber-400/10"
              >
                Flag
              </button>
            </div>
          )}
        </div>
      </div>

      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="max-w-md w-full p-6 rounded-lg border-2 border-red-400/50 bg-[#0a0a0f]">
            <h3 className="font-[var(--font-pixel)] text-[10px] text-red-400 uppercase mb-2">Reject submission</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason (optional)"
              className="w-full px-3 py-2 rounded border border-[var(--color-panel-border)] bg-black/30 text-[var(--color-app-text)] font-[var(--font-pixel-alt)] mb-4"
              rows={2}
            />
            <div className="flex gap-2">
              <button
                onClick={handleReject}
                className="px-4 py-2 rounded border-2 border-red-400 bg-red-400/20 text-red-400 font-[var(--font-pixel-alt)] hover:bg-red-400/30"
              >
                Reject
              </button>
              <button
                onClick={() => { setRejectModal(false); setRejectReason('') }}
                className="px-4 py-2 rounded border border-[var(--color-panel-border)] text-[var(--color-app-text-muted)] font-[var(--font-pixel-alt)]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [tab, setTab] = useState('pending')
  const [stats, setStats] = useState(null)
  const [pending, setPending] = useState([])
  const [approved, setApproved] = useState([])
  const [proposed, setProposed] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    setError('')
    Promise.all([
      getAdminStats(),
      getAdminSubmissions('pending'),
      getAdminSubmissions('approved'),
      getProposedLocations(),
    ])
      .then(([s, p, a, loc]) => {
        setStats(s)
        setPending(p)
        setApproved(a)
        setProposed(loc)
      })
      .catch((err) => setError(err?.message || 'Failed to load'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    setAuthed(getAdminAuthed())
  }, [])

  useEffect(() => {
    if (authed) load()
  }, [authed])

  const handleApprove = async (id) => {
    const { error: err } = await approveSubmission(id)
    if (err) setError(err)
    else load()
  }

  const handleReject = async (id, reason) => {
    const { error: err } = await rejectSubmission(id, reason)
    if (err) setError(err)
    else load()
  }

  const handleFlag = async (id) => {
    const { error: err } = await flagSubmission(id)
    if (err) setError(err)
    else load()
  }

  const handleApproveLoc = async (id) => {
    const { error: err } = await approveLocation(id)
    if (err) setError(err)
    else load()
  }

  const handleRejectLoc = async (id) => {
    const { error: err } = await rejectLocation(id)
    if (err) setError(err)
    else load()
  }

  const handleLogout = () => {
    setAdminAuthed(false)
    setAuthed(false)
  }

  if (!authed) {
    return (
      <AdminLogin
        onSuccess={() => setAuthed(true)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[var(--color-app-text)]">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-[var(--font-pixel)] text-amber-400 text-xl tracking-wider">XPNC Admin</h1>
            <p className="font-[var(--font-pixel-alt)] text-[var(--color-app-text-muted)] text-sm">Control Panel</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded border border-amber-400/50 text-amber-400/80 font-[var(--font-pixel-alt)] text-sm hover:bg-amber-400/10"
          >
            Log out
          </button>
        </div>

        {error && (
          <p className="text-red-400 font-[var(--font-pixel-alt)] text-sm mb-4">{error}</p>
        )}

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-8">
            <div className="p-3 rounded-lg border border-amber-400/30 bg-black/20">
              <p className="font-[var(--font-pixel)] text-[8px] text-amber-400/80 uppercase">Volunteers</p>
              <p className="font-[var(--font-pixel-alt)] text-xl text-white">{stats.totalVolunteers}</p>
            </div>
            <div className="p-3 rounded-lg border border-amber-400/30 bg-black/20">
              <p className="font-[var(--font-pixel)] text-[8px] text-amber-400/80 uppercase">Submissions</p>
              <p className="font-[var(--font-pixel-alt)] text-xl text-white">{stats.totalSubmissions}</p>
            </div>
            <div className="p-3 rounded-lg border border-amber-400/30 bg-black/20">
              <p className="font-[var(--font-pixel)] text-[8px] text-amber-400/80 uppercase">Approved</p>
              <p className="font-[var(--font-pixel-alt)] text-xl text-white">{stats.totalApproved}</p>
            </div>
            <div className="p-3 rounded-lg border border-amber-400/30 bg-black/20">
              <p className="font-[var(--font-pixel)] text-[8px] text-amber-400/80 uppercase">Tokens</p>
              <p className="font-[var(--font-pixel-alt)] text-xl text-amber-400">{stats.totalTokensDistributed}</p>
            </div>
            <div className="p-3 rounded-lg border border-amber-400/30 bg-black/20">
              <p className="font-[var(--font-pixel)] text-[8px] text-amber-400/80 uppercase">Hours</p>
              <p className="font-[var(--font-pixel-alt)] text-xl text-white">{stats.totalHoursLogged}</p>
            </div>
            <div className="p-3 rounded-lg border border-amber-400/30 bg-black/20">
              <p className="font-[var(--font-pixel)] text-[8px] text-amber-400/80 uppercase">Top Country</p>
              <p className="font-[var(--font-pixel-alt)] text-lg text-white truncate">{stats.mostActiveCountry}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-amber-400/30">
          {['pending', 'approved', 'mission-centers'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 font-[var(--font-pixel)] text-[9px] uppercase border-b-2 -mb-[2px] transition-colors ${
                tab === t ? 'border-amber-400 text-amber-400' : 'border-transparent text-[var(--color-app-text-muted)] hover:text-amber-400/70'
              }`}
            >
              {t === 'pending' && `Pending (${pending.length})`}
              {t === 'approved' && `Approved (${approved.length})`}
              {t === 'mission-centers' && `Mission Centers (${proposed.length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="font-[var(--font-pixel-alt)] text-amber-400/80">Loading…</p>
        ) : tab === 'pending' ? (
          <div className="space-y-4">
            {pending.filter((s) => !s.flagged).length === 0 && pending.filter((s) => s.flagged).length === 0 ? (
              <p className="font-[var(--font-pixel-alt)] text-[var(--color-app-text-muted)]">No pending submissions.</p>
            ) : (
              <>
                {pending.filter((s) => s.flagged).map((s) => (
                  <div key={s.id} className="relative">
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded font-[var(--font-pixel)] text-[8px] bg-amber-400/30 text-amber-400">
                      FLAGGED
                    </span>
                    <SubmissionCard
                      sub={s}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      onFlag={handleFlag}
                    />
                  </div>
                ))}
                {pending.filter((s) => !s.flagged).map((s) => (
                  <SubmissionCard
                    key={s.id}
                    sub={s}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onFlag={handleFlag}
                  />
                ))}
              </>
            )}
          </div>
        ) : tab === 'approved' ? (
          <div className="space-y-3">
            {stats && (
              <p className="font-[var(--font-pixel-alt)] text-amber-400 mb-4">
                Total tokens distributed: <span className="font-[var(--font-pixel)]">{stats.totalTokensDistributed}</span> XPNC
              </p>
            )}
            {approved.length === 0 ? (
              <p className="font-[var(--font-pixel-alt)] text-[var(--color-app-text-muted)]">No approved submissions.</p>
            ) : (
              approved.map((s) => (
                <SubmissionCard key={s.id} sub={s} condensed onApprove={() => {}} onReject={() => {}} onFlag={() => {}} />
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {proposed.length === 0 ? (
              <p className="font-[var(--font-pixel-alt)] text-[var(--color-app-text-muted)]">No proposed locations.</p>
            ) : (
              proposed.map((loc) => (
                <div
                  key={loc.id}
                  className="p-5 rounded-lg border-2 border-amber-400/30 bg-black/30"
                >
                  <h3 className="font-[var(--font-pixel-alt)] text-xl text-amber-100">{loc.name}</h3>
                  <p className="text-[var(--color-app-text-muted)] text-sm">{loc.nonprofit_name}</p>
                  <p className="text-amber-200/80 text-sm mt-1">
                    {loc.city}, {loc.country} · {loc.category}
                  </p>
                  {loc.lat != null && loc.lng != null && (
                    <div className="mt-2 w-full h-24 rounded border border-amber-400/30 overflow-hidden">
                      <iframe
                        title="Map"
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${loc.lng - 0.01}%2C${loc.lat - 0.01}%2C${loc.lng + 0.01}%2C${loc.lat + 0.01}&layer=mapnik&marker=${loc.lat}%2C${loc.lng}`}
                        className="w-full h-full pointer-events-none"
                      />
                    </div>
                  )}
                  <p className="text-sm text-[var(--color-app-text)] mt-2">{loc.description}</p>
                  {loc.website && (
                    <a href={loc.website} target="_blank" rel="noreferrer" className="text-amber-400 text-sm block mt-1">
                      {loc.website}
                    </a>
                  )}
                  {loc.financial_support_needed && (
                    <span className="inline-block mt-2 px-2 py-0.5 rounded border border-amber-400/50 text-amber-400 text-xs">
                      Financial support requested
                    </span>
                  )}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleApproveLoc(loc.id)}
                      className="px-4 py-2 rounded border-2 border-[var(--color-neon-green)] bg-[var(--color-neon-green)]/10 text-[var(--color-neon-green)] font-[var(--font-pixel-alt)] hover:bg-[var(--color-neon-green)]/20"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectLoc(loc.id)}
                      className="px-4 py-2 rounded border border-red-400/60 text-red-400 font-[var(--font-pixel-alt)] hover:bg-red-400/10"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
