export default function Settings() {
  return (
    <div className="flex-1 p-6 sm:p-8 overflow-auto page-enter">
      <div className="max-w-xl mx-auto">
        <h1 className="font-[var(--font-pixel)] text-[10px] text-[var(--color-neon-cyan)] uppercase tracking-widest mb-2">
          Settings
        </h1>
        <h2 className="font-[var(--font-body)] text-2xl md:text-3xl text-[var(--color-app-text)] mb-8">
          Configure Your Experience
        </h2>

        <div className="space-y-5">
          <div className="glass-card card-hover rounded-xl p-5" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            <label className="font-[var(--font-pixel)] text-[8px] text-[var(--color-app-text-muted)] uppercase block mb-2">
              Display Name
            </label>
            <input
              type="text"
              placeholder="Enter your hero name"
              className="w-full px-4 py-3 rounded-lg border border-[var(--glass-border)] bg-black/20 text-[var(--color-app-text)] font-[var(--font-body)] placeholder-[var(--color-app-text-muted)] focus:outline-none focus:border-[var(--color-neon-cyan)]/50 transition-colors"
            />
          </div>

          <div className="glass-card card-hover rounded-xl p-5" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            <label className="font-[var(--font-pixel)] text-[8px] text-[var(--color-app-text-muted)] uppercase block mb-3">
              Notifications
            </label>
            <div className="flex items-center justify-between">
              <span className="font-[var(--font-body)] text-base text-[var(--color-app-text)]">
                Quest reminders
              </span>
              <input type="checkbox" className="w-5 h-5 accent-[var(--color-neon-cyan)]" defaultChecked />
            </div>
          </div>

          <div className="glass-card card-hover rounded-xl p-5" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            <label className="font-[var(--font-pixel)] text-[8px] text-[var(--color-app-text-muted)] uppercase block mb-3">
              Sound Effects
            </label>
            <div className="flex items-center justify-between">
              <span className="font-[var(--font-body)] text-base text-[var(--color-app-text)]">
                Enable game sounds
              </span>
              <input type="checkbox" className="w-5 h-5 accent-[var(--color-neon-cyan)]" defaultChecked />
            </div>
          </div>

          <button className="w-full py-4 rounded-xl border-2 border-[var(--color-neon-green)]/50 bg-[var(--color-neon-green)]/10 text-[var(--color-neon-green)] font-[var(--font-body)] font-medium text-lg hover:bg-[var(--color-neon-green)]/20 hover:shadow-[0_0_20px_rgba(34,197,94,0.15)] transition-all duration-200">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}
