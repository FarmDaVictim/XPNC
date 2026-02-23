/**
 * Path 1: Volunteer at established location — hours, activity type, date, photo, reflection (min 50 words)
 */
import { useState } from 'react'
import { ACTIVITY_CATEGORIES } from '../data/bonuses'

const MIN_WORDS = 50

export default function VolunteerSubmissionForm({ location, onSubmit, onCancel }) {
  const [hours, setHours] = useState(1)
  const [activityType, setActivityType] = useState('community')
  const [activityDate, setActivityDate] = useState(new Date().toISOString().slice(0, 10))
  const [photoFile, setPhotoFile] = useState(null)
  const [reflection, setReflection] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const wordCount = reflection.trim().split(/\s+/).filter(Boolean).length
  const isValid = wordCount >= MIN_WORDS && hours > 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isValid || submitting) return

    setError('')
    setSubmitting(true)

    try {
      await onSubmit({
        location,
        hoursLogged: hours,
        activityType,
        activityDate,
        photoFile,
        reflection,
      })
    } catch (err) {
      setError(err?.message || 'Submission failed. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="font-[var(--font-pixel)] text-[8px] text-[var(--color-neon-cyan)] uppercase tracking-wider">
          Hours spent
        </label>
        <input
          type="number"
          min={1}
          max={999}
          value={hours}
          onChange={(e) => setHours(Number(e.target.value))}
          className="mt-1 w-full px-3 py-2 rounded border border-[var(--color-neon-cyan)]/60 bg-black/30 text-[var(--color-app-text)] font-[var(--font-pixel-alt)]"
        />
      </div>

      <div>
        <label className="font-[var(--font-pixel)] text-[8px] text-[var(--color-neon-cyan)] uppercase tracking-wider">
          Activity type
        </label>
        <select
          value={activityType}
          onChange={(e) => setActivityType(e.target.value)}
          className="mt-1 w-full px-3 py-2 rounded border border-[var(--color-neon-cyan)]/60 bg-black/30 text-[var(--color-app-text)] font-[var(--font-pixel-alt)]"
        >
          {ACTIVITY_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="font-[var(--font-pixel)] text-[8px] text-[var(--color-neon-cyan)] uppercase tracking-wider">
          Date
        </label>
        <input
          type="date"
          value={activityDate}
          onChange={(e) => setActivityDate(e.target.value)}
          className="mt-1 w-full px-3 py-2 rounded border border-[var(--color-neon-cyan)]/60 bg-black/30 text-[var(--color-app-text)] font-[var(--font-pixel-alt)]"
        />
      </div>

      <div>
        <label className="font-[var(--font-pixel)] text-[8px] text-[var(--color-neon-cyan)] uppercase tracking-wider">
          Photo proof (optional)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
          className="mt-1 w-full px-3 py-2 rounded border border-[var(--color-neon-cyan)]/60 bg-black/30 text-[var(--color-app-text)] font-[var(--font-pixel-alt)] file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[var(--color-neon-cyan)]/20 file:text-[var(--color-neon-cyan)]"
        />
      </div>

      <div>
        <label className="font-[var(--font-pixel)] text-[8px] text-[var(--color-neon-cyan)] uppercase tracking-wider">
          Reflection (min {MIN_WORDS} words) — what did you do and what impact did you feel?
        </label>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="Describe your volunteering experience: what you did, who you helped, and the impact you felt..."
          rows={5}
          className="mt-1 w-full px-3 py-2 rounded border border-[var(--color-neon-cyan)]/60 bg-black/30 text-[var(--color-app-text)] font-[var(--font-pixel-alt)] placeholder:text-[var(--color-app-text-muted)] resize-none"
        />
        <p className={`mt-1 font-[var(--font-pixel)] text-[8px] ${wordCount >= MIN_WORDS ? 'text-[var(--color-neon-green)]' : 'text-[var(--color-neon-orange)]'}`}>
          {wordCount} / {MIN_WORDS} words
        </p>
      </div>

      {error && (
        <p className="text-red-400 font-[var(--font-pixel-alt)] text-sm">{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={!isValid || submitting}
          className="flex-1 py-2 px-4 rounded border-2 border-[var(--color-neon-green)] bg-[var(--color-neon-green)]/20 text-[var(--color-neon-green)] font-[var(--font-pixel-alt)] text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-neon-green)]/30 transition-colors"
          style={{ boxShadow: '0 0 10px rgba(57, 255, 20, 0.3)' }}
        >
          {submitting ? 'Submitting & AI scoring… (30–60 sec)' : 'Submit for AI scoring'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded border border-[var(--color-app-panel-border)] text-[var(--color-app-text)]/70 font-[var(--font-pixel-alt)] hover:text-[var(--color-app-text)]"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
