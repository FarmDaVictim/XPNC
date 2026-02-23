import { NavLink } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useUser } from '../hooks/useUser'

const NAV_PUBLIC = [
  { to: '/map', label: 'Map', icon: '◉' },
  { to: '/quests', label: 'Quests', icon: '📋' },
]

const NAV_AUTH = [
  { to: '/dashboard', label: 'Dashboard', icon: '⚔' },
  { to: '/map', label: 'Map', icon: '◉' },
  { to: '/quests', label: 'Quests', icon: '📋' },
  { to: '/badges', label: 'NFT Badges', icon: '🏅' },
  { to: '/journal', label: 'Impact Journal', icon: '📖' },
  { to: '/wallet', label: 'Wallet', icon: '🪙' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
]

export default function Sidebar() {
  const { theme, toggleTheme } = useTheme()
  const { ready, authenticated, login, logout, username, impactPoints, level } = useUser()

  return (
    <aside
      className="w-60 min-h-screen flex flex-col transition-colors duration-300"
      style={{
        background: 'rgba(255,255,255,0.02)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo — larger, cyan glow */}
      <div className="p-5 border-b border-[var(--glass-border)]">
        <h1
          className="font-[var(--font-pixel)] text-lg text-[var(--color-neon-cyan)] tracking-widest"
          style={{ textShadow: '0 0 20px rgba(0, 245, 255, 0.3)' }}
        >
          XPNC
        </h1>
        <p className="font-[var(--font-body)] text-xs text-[var(--color-app-text-muted)] mt-1.5">
          Volunteer Quest Hub
        </p>
      </div>

      {/* Navigation — glow underline on active, no full border */}
      <nav className="flex-1 p-4 space-y-0.5">
        {(authenticated ? NAV_AUTH : NAV_PUBLIC).map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to !== '/map'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg font-[var(--font-body)] text-[15px] transition-all duration-200
              ${isActive
                ? 'text-[var(--color-neon-cyan)] sidebar-nav-active'
                : 'text-[var(--color-app-text-muted)] hover:text-[var(--color-app-text)] sidebar-nav-inactive'
              }`
            }
          >
            <span className="text-xl">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Theme toggle */}
      <div className="p-4 border-t border-[var(--glass-border)]">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-[var(--glass-border)] text-[var(--color-app-text-muted)] font-[var(--font-body)] text-sm hover:text-[var(--color-app-text)] hover:border-[var(--color-neon-cyan)]/30 transition-all duration-200"
        >
          {theme === 'dark' ? '☀' : '☽'} {theme === 'dark' ? 'Light' : 'Dark'} mode
        </button>
      </div>

      {/* User — glass card */}
      <div className="p-4 border-t border-[var(--glass-border)]">
        {ready && (
          !authenticated ? (
            <button
              onClick={login}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-lg border-2 border-[var(--color-neon-cyan)]/40 bg-[var(--color-neon-cyan)]/5 text-[var(--color-neon-cyan)] font-[var(--font-body)] font-medium transition-all duration-200 hover:bg-[var(--color-neon-cyan)]/10 hover:shadow-[0_0_20px_rgba(0,245,255,0.15)]"
            >
              Log in
            </button>
          ) : (
            <div
              className="p-4 rounded-xl glass-card"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-[var(--font-pixel)] text-[var(--color-neon-cyan)]"
                  style={{
                    background: 'rgba(0, 245, 255, 0.1)',
                    border: '1px solid rgba(0, 245, 255, 0.2)',
                  }}
                >
                  {(username || 'H').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-[var(--font-body)] font-medium text-[var(--color-app-text)] truncate">
                    {username}
                  </p>
                  <p className="font-[var(--font-pixel)] text-[8px] text-[var(--color-app-text-muted)]">
                    LVL {level}
                  </p>
                </div>
              </div>
              <div className="p-2 rounded-lg bg-[var(--color-neon-green)]/10 border border-[var(--color-neon-green)]/20">
                <p className="font-[var(--font-pixel)] text-[8px] text-[var(--color-neon-green)] uppercase">XP</p>
                <p className="font-[var(--font-body)] text-lg font-semibold text-[var(--color-app-text)]">
                  {impactPoints?.toLocaleString() ?? 0}
                </p>
              </div>
              <button
                onClick={logout}
                className="w-full mt-3 px-3 py-1.5 rounded-lg text-[var(--color-app-text-muted)] font-[var(--font-body)] text-xs hover:text-[var(--color-app-text)] transition-colors"
              >
                Log out
              </button>
            </div>
          )
        )}
      </div>
    </aside>
  )
}
