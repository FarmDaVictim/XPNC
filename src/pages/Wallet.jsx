/**
 * Wallet — XPNC token wallet
 * Total balance, redeem options, wallet address, airdrop history
 */
import { useEffect, useState } from 'react'
import { useUser } from '../hooks/useUser'
import { getSubmissionsByUserId } from '../lib/submissions'

export default function Wallet() {
  const { user: supabaseUser, walletAddress, authenticated, login } = useUser()
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)

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
  const totalTokens = approved.reduce((sum, s) => sum + (s.token_airdrop_amount || 0), 0)
  const airdropHistory = approved
    .filter((s) => (s.token_airdrop_amount || 0) > 0)
    .sort((a, b) => new Date(b.activity_date || b.created_at || 0).getTime() - new Date(a.activity_date || a.created_at || 0).getTime())

  if (!authenticated) {
    return (
      <div className="flex-1 p-6 sm:p-8 overflow-auto page-enter flex items-center justify-center">
        <div className="text-center">
          <p className="font-[var(--font-body)] text-lg text-[var(--color-app-text-muted)] mb-4">
            Log in to view your wallet
          </p>
          <button
            onClick={login}
            className="px-6 py-3 rounded-lg border-2 border-[var(--color-neon-cyan)] bg-[var(--color-neon-cyan)]/10 text-[var(--color-neon-cyan)] font-[var(--font-body)] font-medium hover:bg-[var(--color-neon-cyan)]/20 transition-all"
          >
            Log in
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 sm:p-8 overflow-auto page-enter">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="font-[var(--font-pixel)] text-[10px] text-[var(--color-neon-gold)] uppercase tracking-widest mb-2">
            Wallet
          </h1>
          <h2 className="font-[var(--font-body)] text-2xl md:text-3xl text-[var(--color-app-text)]">
            XPNC Token Wallet
          </h2>
        </div>

        {/* Main balance card */}
        <div
          className="glass-card card-hover p-8 rounded-2xl mb-8"
          style={{
            border: '1px solid rgba(251, 191, 36, 0.25)',
            boxShadow: '0 0 40px rgba(251, 191, 36, 0.12)',
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🪙</span>
            <span className="font-[var(--font-pixel)] text-[9px] text-[var(--color-neon-gold)] uppercase">Balance</span>
          </div>
          <p className="font-[var(--font-body)] text-4xl font-bold text-[var(--color-neon-gold)]">
            {loading ? '…' : totalTokens} XPNC
          </p>
          <p className="font-[var(--font-body)] text-sm text-[var(--color-app-text-muted)] font-mono mt-3 truncate">
            {walletAddress ? `${walletAddress.slice(0, 10)}...${walletAddress.slice(-8)}` : 'Connect wallet in Settings to claim tokens'}
          </p>
          <p className="font-[var(--font-body)] text-xs text-[var(--color-app-text-muted)] mt-4">
            Token smart contract deployment coming soon — your balance is recorded on-chain.
          </p>
        </div>

        {/* Redeem section — placeholder UI */}
        <section className="mb-8">
          <h3 className="font-[var(--font-pixel)] text-[9px] text-[var(--color-app-text-muted)] uppercase tracking-wider mb-4">
            Redeem tokens
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              className="glass-card card-hover p-5 rounded-xl opacity-80"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <span className="text-2xl block mb-2">📱</span>
              <p className="font-[var(--font-body)] font-medium text-[var(--color-app-text)]">Airtime</p>
              <p className="font-[var(--font-body)] text-xs text-[var(--color-app-text-muted)] mt-1">Coming soon</p>
            </div>
            <div
              className="glass-card card-hover p-5 rounded-xl opacity-80"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <span className="text-2xl block mb-2">🎫</span>
              <p className="font-[var(--font-body)] font-medium text-[var(--color-app-text)]">Vouchers</p>
              <p className="font-[var(--font-body)] text-xs text-[var(--color-app-text-muted)] mt-1">Coming soon</p>
            </div>
            <div
              className="glass-card card-hover p-5 rounded-xl opacity-80"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <span className="text-2xl block mb-2">💳</span>
              <p className="font-[var(--font-body)] font-medium text-[var(--color-app-text)]">eWallet</p>
              <p className="font-[var(--font-body)] text-xs text-[var(--color-app-text-muted)] mt-1">Coming soon</p>
            </div>
          </div>
        </section>

        {/* Airdrop history */}
        <section>
          <h3 className="font-[var(--font-pixel)] text-[9px] text-[var(--color-app-text-muted)] uppercase tracking-wider mb-4">
            Airdrop history
          </h3>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card rounded-lg p-4 skeleton-shimmer" />
              ))}
            </div>
          ) : airdropHistory.length === 0 ? (
            <div className="glass-card rounded-xl p-6 border border-dashed border-[var(--glass-border)] text-center">
              <p className="font-[var(--font-body)] text-[var(--color-app-text-muted)]">
                No airdrops yet. Complete quests and get approved to earn XPNC.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {airdropHistory.map((sub) => {
                const loc = sub.locations
                return (
                  <div
                    key={sub.id}
                    className="glass-card card-hover p-4 rounded-xl flex items-center justify-between"
                    style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <div>
                      <p className="font-[var(--font-body)] text-sm text-[var(--color-app-text)]">
                        {loc?.name ?? 'Mission'}
                      </p>
                      <p className="font-[var(--font-body)] text-xs text-[var(--color-app-text-muted)]">
                        {sub.activity_date ? new Date(sub.activity_date).toLocaleDateString() : ''}
                      </p>
                    </div>
                    <span className="font-[var(--font-body)] font-semibold text-[var(--color-neon-gold)]">
                      +{sub.token_airdrop_amount ?? 0} XPNC
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
