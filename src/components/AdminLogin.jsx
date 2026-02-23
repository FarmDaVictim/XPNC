/**
 * Admin login — password gate for /admin
 */
import { useState } from 'react'
import { setAdminAuthed } from '../lib/admin'

const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET || ''

export default function AdminLogin({ onSuccess }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!ADMIN_SECRET) {
      setError('VITE_ADMIN_SECRET not configured. Add it to .env')
      return
    }
    if (password === ADMIN_SECRET) {
      setAdminAuthed(true)
      onSuccess?.()
    } else {
      setError('Incorrect password')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4">
      <div
        className="w-full max-w-sm p-8 rounded-xl border-2 border-amber-400/50"
        style={{ boxShadow: '0 0 30px rgba(251, 191, 36, 0.15)' }}
      >
        <div className="text-center mb-6">
          <h1 className="font-[var(--font-pixel)] text-2xl text-amber-400 tracking-wider">
            XPNC
          </h1>
          <p className="font-[var(--font-pixel-alt)] text-[var(--color-app-text-muted)] text-sm mt-1">
            Admin Access
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-lg border-2 border-amber-400/40 bg-black/40 text-[var(--color-app-text)] font-[var(--font-pixel-alt)] placeholder:text-[var(--color-app-text-muted)] focus:border-amber-400 focus:outline-none"
            autoFocus
          />
          {error && (
            <p className="font-[var(--font-pixel-alt)] text-red-400 text-sm">{error}</p>
          )}
          <button
            type="submit"
            className="w-full py-3 rounded-lg border-2 border-amber-400 bg-amber-400/20 text-amber-400 font-[var(--font-pixel-alt)] text-lg hover:bg-amber-400/30 transition-all"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  )
}
