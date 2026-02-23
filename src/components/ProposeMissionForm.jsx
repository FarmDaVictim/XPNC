/**
 * Path 2: Propose a new Mission Center — geocode address, category, description, etc.
 */
import { useState } from 'react'
import { geocodeAddress } from '../lib/geocode'
import { ACTIVITY_CATEGORIES } from '../data/bonuses'
import { supabase } from '../lib/supabase'

export default function ProposeMissionForm({ onSuccess, onCancel }) {
  const [name, setName] = useState('')
  const [nonprofitName, setNonprofitName] = useState('')
  const [locationText, setLocationText] = useState('')
  const [category, setCategory] = useState('community')
  const [description, setDescription] = useState('')
  const [website, setWebsite] = useState('')
  const [contact, setContact] = useState('')
  const [financialSupport, setFinancialSupport] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [geocoding, setGeocoding] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !nonprofitName.trim() || !locationText.trim() || !description.trim()) {
      setError('Fill in all required fields.')
      return
    }

    setError('')
    setGeocoding(true)

    const geo = await geocodeAddress(locationText)
    setGeocoding(false)

    if (!geo) {
      setError('Could not find that location. Try a more specific address (city, country).')
      return
    }

    setSubmitting(true)

    try {
      const { data, error: err } = await supabase
        .from('locations')
        .insert({
          name: name.trim(),
          nonprofit_name: nonprofitName.trim(),
          description: description.trim(),
          continent: geo.continent || 'TBD',
          country: geo.country || 'Unknown',
          city: geo.city || 'Unknown',
          lat: geo.lat,
          lng: geo.lng,
          category,
          website: website.trim() || null,
          contact: contact.trim() || null,
          financial_support_needed: financialSupport,
          approved: false,
          status: 'proposed',
        })
        .select()
        .single()

      if (err) throw err
      onSuccess?.(data)
    } catch (err) {
      setError(err?.message || 'Failed to submit. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
      <div>
        <label className="font-[var(--font-pixel)] text-[8px] text-[var(--color-neon-cyan)] uppercase tracking-wider">
          Mission / activity name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Beach Cleanup, Soup Kitchen"
          className="mt-1 w-full px-3 py-2 rounded border border-[var(--color-neon-cyan)]/60 bg-black/30 text-[var(--color-app-text)] font-[var(--font-pixel-alt)] placeholder:text-[var(--color-app-text-muted)]"
        />
      </div>

      <div>
        <label className="font-[var(--font-pixel)] text-[8px] text-[var(--color-neon-cyan)] uppercase tracking-wider">
          Nonprofit / community group name *
        </label>
        <input
          type="text"
          value={nonprofitName}
          onChange={(e) => setNonprofitName(e.target.value)}
          placeholder="e.g. Ocean Guardians"
          className="mt-1 w-full px-3 py-2 rounded border border-[var(--color-neon-cyan)]/60 bg-black/30 text-[var(--color-app-text)] font-[var(--font-pixel-alt)] placeholder:text-[var(--color-app-text-muted)]"
        />
      </div>

      <div>
        <label className="font-[var(--font-pixel)] text-[8px] text-[var(--color-neon-cyan)] uppercase tracking-wider">
          Location (city, country or full address) *
        </label>
        <input
          type="text"
          value={locationText}
          onChange={(e) => setLocationText(e.target.value)}
          placeholder="e.g. Sydney, Australia or 123 Main St, London"
          className="mt-1 w-full px-3 py-2 rounded border border-[var(--color-neon-cyan)]/60 bg-black/30 text-[var(--color-app-text)] font-[var(--font-pixel-alt)] placeholder:text-[var(--color-app-text-muted)]"
        />
        {geocoding && <p className="mt-1 text-[var(--color-neon-cyan)] text-xs">Resolving location…</p>}
      </div>

      <div>
        <label className="font-[var(--font-pixel)] text-[8px] text-[var(--color-neon-cyan)] uppercase tracking-wider">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1 w-full px-3 py-2 rounded border border-[var(--color-neon-cyan)]/60 bg-black/30 text-[var(--color-app-text)] font-[var(--font-pixel-alt)]"
        >
          {ACTIVITY_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="font-[var(--font-pixel)] text-[8px] text-[var(--color-neon-cyan)] uppercase tracking-wider">
          Description — what do volunteers do there? *
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the volunteer opportunity..."
          rows={3}
          className="mt-1 w-full px-3 py-2 rounded border border-[var(--color-neon-cyan)]/60 bg-black/30 text-[var(--color-app-text)] font-[var(--font-pixel-alt)] placeholder:text-[var(--color-app-text-muted)] resize-none"
        />
      </div>

      <div>
        <label className="font-[var(--font-pixel)] text-[8px] text-[var(--color-neon-cyan)] uppercase tracking-wider">
          Website or contact (optional)
        </label>
        <input
          type="text"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://... or email/phone"
          className="mt-1 w-full px-3 py-2 rounded border border-[var(--color-neon-cyan)]/60 bg-black/30 text-[var(--color-app-text)] font-[var(--font-pixel-alt)] placeholder:text-[var(--color-app-text-muted)]"
        />
      </div>

      <div>
        <label className="font-[var(--font-pixel)] text-[8px] text-[var(--color-neon-cyan)] uppercase tracking-wider">
          Contact info (optional)
        </label>
        <input
          type="text"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Email or phone for volunteers"
          className="mt-1 w-full px-3 py-2 rounded border border-[var(--color-neon-cyan)]/60 bg-black/30 text-[var(--color-app-text)] font-[var(--font-pixel-alt)] placeholder:text-[var(--color-app-text-muted)]"
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={financialSupport}
          onChange={(e) => setFinancialSupport(e.target.checked)}
          className="rounded border-[var(--color-neon-cyan)]"
        />
        <span className="font-[var(--font-pixel-alt)] text-sm text-[var(--color-app-text)]">
          Financial support needed
        </span>
      </label>

      {error && (
        <p className="text-red-400 font-[var(--font-pixel-alt)] text-sm">{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 py-2 px-4 rounded border-2 border-[var(--color-neon-magenta)] bg-[var(--color-neon-magenta)]/20 text-[var(--color-neon-magenta)] font-[var(--font-pixel-alt)] text-lg disabled:opacity-50 hover:bg-[var(--color-neon-magenta)]/30"
        >
          {submitting ? 'Submitting…' : 'Propose Mission Center'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded border border-[var(--color-app-panel-border)] text-[var(--color-app-text)]/70 font-[var(--font-pixel-alt)]">
          Cancel
        </button>
      </div>
    </form>
  )
}
