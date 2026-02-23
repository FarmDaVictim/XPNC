/**
 * Quest modal — supports quest preview, volunteer submission form, and score reveal
 */
import { createPortal } from 'react-dom'
import VolunteerSubmissionForm from './VolunteerSubmissionForm'
import ScoreReveal from './ScoreReveal'

export default function QuestModal({
  isOpen,
  onClose,
  quest,
  mode,
  selectedLocation,
  isLoggedIn,
  onLoginRequest,
  onAcceptQuest,
  onSubmitVolunteer,
  submissionScore,
  onScoreRevealClose,
}) {
  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  const handleAcceptOrLogin = () => {
    if (!isLoggedIn) {
      onLoginRequest?.()
      return
    }
    if (!selectedLocation) {
      return
    }
    onAcceptQuest?.(quest)
  }

  // Score reveal takes over when we have a score
  if (mode === 'score' && submissionScore) {
    return (
      <ScoreReveal
        isOpen
        score={submissionScore}
        onClose={() => {
          onScoreRevealClose?.()
          onClose()
        }}
      />
    )
  }

  // Submission form
  if (mode === 'submit' && selectedLocation) {
    const content = (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={handleBackdropClick}>
        <div
          className="w-full max-w-md bg-[var(--color-panel-bg)] border-2 border-[var(--color-neon-cyan)] rounded-lg overflow-hidden quest-modal-in max-h-[90vh] overflow-y-auto"
          style={{ boxShadow: '0 0 20px rgba(0, 245, 255, 0.3)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b border-[var(--color-panel-border)]">
            <span className="font-[var(--font-pixel)] text-[8px] text-[var(--color-neon-cyan)] uppercase">Log your volunteer hours</span>
            <h2 className="font-[var(--font-pixel-alt)] text-xl text-[var(--color-app-text)] mt-1">
              {selectedLocation.name}
            </h2>
            <p className="text-[var(--color-app-text-muted)] text-sm mt-0.5">{selectedLocation.nonprofit}</p>
          </div>
          <div className="p-4">
            <VolunteerSubmissionForm
              location={selectedLocation}
              onSubmit={onSubmitVolunteer}
              onCancel={onClose}
            />
          </div>
        </div>
      </div>
    )
    return createPortal(content, document.body)
  }

  // Quest preview
  const content = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-md bg-[var(--color-panel-bg)] border-2 border-[var(--color-neon-orange)] rounded-lg overflow-hidden quest-modal-in"
        style={{ boxShadow: '0 0 20px var(--color-neon-orange), inset 0 0 20px rgba(255, 107, 53, 0.05)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-[var(--color-panel-border)] bg-[var(--color-neon-orange)]/10">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-[var(--font-pixel)] text-[8px] text-[var(--color-neon-orange)] uppercase tracking-wider">
                Quest
              </span>
              <h2 className="font-[var(--font-pixel-alt)] text-2xl text-[var(--color-app-text)] mt-1">
                {quest?.title || 'Sample Quest'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center border border-[var(--color-app-panel-border)] rounded text-[var(--color-app-text)]/70 hover:text-[var(--color-app-text)] hover:border-[var(--color-neon-orange)] transition-colors"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <p className="font-[var(--font-pixel-alt)] text-lg text-[var(--color-app-text)]/80">
            {quest?.description || 'Complete this volunteer mission to earn XP and level up. Your actions make a real impact!'}
          </p>

          {quest?.rewards && (
            <div className="flex gap-3">
              <span className="px-2 py-1 rounded border border-[var(--color-neon-green)] text-[var(--color-neon-green)] font-[var(--font-pixel)] text-[8px]">
                +{quest.rewards.xp} XP
              </span>
              {quest.rewards.badge && (
                <span className="px-2 py-1 rounded border border-[var(--color-neon-magenta)] text-[var(--color-neon-magenta)] font-[var(--font-pixel)] text-[8px]">
                  {quest.rewards.badge}
                </span>
              )}
            </div>
          )}

          {!selectedLocation && (
            <p className="font-[var(--font-pixel-alt)] text-sm text-[var(--color-app-text-muted)]">
              Select a pin on the map to log your volunteer hours at that location.
            </p>
          )}
          {selectedLocation?.isProposed && (
            <p className="font-[var(--font-pixel-alt)] text-sm text-[var(--color-neon-orange)]">
              This location is pending review. Log hours after it's approved.
            </p>
          )}

          <div className="flex gap-3 pt-2">
            {!isLoggedIn && (
              <p className="text-sm text-[var(--color-app-text-muted)] mb-2">
                Sign in to log your impact and earn tokens.
              </p>
            )}
            <button
              onClick={handleAcceptOrLogin}
              disabled={(!selectedLocation || selectedLocation?.isProposed) && isLoggedIn}
              className="flex-1 py-2 px-4 rounded border-2 border-[var(--color-neon-green)] bg-[var(--color-neon-green)]/20 text-[var(--color-neon-green)] font-[var(--font-pixel-alt)] text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-neon-green)]/30 transition-colors"
              style={{ boxShadow: '0 0 10px rgba(57, 255, 20, 0.3)' }}
            >
              {!isLoggedIn
                ? 'Sign in to log hours'
                : !selectedLocation
                  ? 'Select a pin first'
                  : selectedLocation?.isProposed
                    ? 'Pending approval'
                    : 'Log volunteer hours'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded border border-[var(--color-app-panel-border)] text-[var(--color-app-text)]/70 font-[var(--font-pixel-alt)] hover:text-[var(--color-app-text)] hover:border-[var(--color-app-panel-border)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(content, document.body)
}
