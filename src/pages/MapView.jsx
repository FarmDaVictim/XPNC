/**
 * MapView — Leaflet map only (no globe)
 * Unauthenticated users can browse; Log Hours / Propose intercept with Privy
 */
import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import ContinentMap from '../components/ContinentMap'
import QuestModal from '../components/QuestModal'
import ProposeMissionForm from '../components/ProposeMissionForm'
import { useTheme } from '../context/ThemeContext'
import { useUser } from '../hooks/useUser'
import { createSubmission, updateSubmissionScore, uploadSubmissionPhoto } from '../lib/submissions'
import { scoreImpact } from '../lib/impactScore'
import { getLocationById } from '../lib/locations'

function toMapRegion(continent) {
  if (!continent) return 'Africa'
  if (continent === 'North America' || continent === 'South America') return 'Americas'
  const REGIONS = ['Africa', 'Asia', 'Europe', 'Americas', 'Oceania']
  return REGIONS.includes(continent) ? continent : 'Africa'
}

const sampleQuest = {
  title: 'Community Food Drive',
  description: 'Help organize and run a food drive at your local community center.',
  rewards: { xp: 150, badge: 'Feeding Hero' },
}

export default function MapView() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { theme } = useTheme()
  const { authenticated, login, user: supabaseUser } = useUser()
  const [selectedRegion, setSelectedRegion] = useState('Africa')
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [questModalMode, setQuestModalMode] = useState('quest')
  const [questModalOpen, setQuestModalOpen] = useState(false)
  const [proposeModalOpen, setProposeModalOpen] = useState(false)
  const [submissionScore, setSubmissionScore] = useState(null)
  const [scoring, setScoring] = useState(false)
  const pendingProposeRef = useRef(false)
  const prevAuthRef = useRef(authenticated)

  useEffect(() => {
    const locationId = searchParams.get('location')
    const region = searchParams.get('region')
    if (locationId && region) {
      getLocationById(locationId).then((loc) => {
        if (loc) {
          setSelectedRegion(region)
          setSelectedLocation({ ...loc, isProposed: false })
          setQuestModalMode('quest')
          setQuestModalOpen(true)
        }
      })
    }
  }, [searchParams])

  useEffect(() => {
    if (authenticated && !prevAuthRef.current && pendingProposeRef.current) {
      pendingProposeRef.current = false
      setProposeModalOpen(true)
    }
    prevAuthRef.current = authenticated
  }, [authenticated])

  const handleLocationClick = (location) => {
    setSelectedLocation(location)
    setQuestModalMode('quest')
    setQuestModalOpen(true)
  }

  const handleCloseQuestModal = () => {
    setQuestModalOpen(false)
    setSelectedLocation(null)
    setQuestModalMode('quest')
    setSubmissionScore(null)
  }

  const handleProposeMission = () => {
    if (!authenticated) {
      pendingProposeRef.current = true
      login?.()
      return
    }
    setProposeModalOpen(true)
  }

  const handleAcceptQuest = () => {
    if (selectedLocation && authenticated) {
      setQuestModalMode('submit')
    }
  }

  const handleSubmitVolunteer = async (payload) => {
    const { location, hoursLogged, activityType, activityDate, photoFile, reflection } = payload
    if (!supabaseUser?.id || !location?.id) throw new Error('Missing user or location')

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(String(location.id))) {
      throw new Error('Setup required: Run REPAIR_SCHEMA.sql and seed.sql in Supabase.')
    }

    setScoring(true)
    try {
      let photoUrl = null
      if (photoFile) {
        try {
          photoUrl = await uploadSubmissionPhoto(photoFile)
        } catch { /* ignore */ }
      }

      const submission = await createSubmission({
        userId: supabaseUser.id,
        locationId: location.id,
        hoursLogged,
        activityType,
        activityDate,
        photoUrl,
        reflection,
      })

      const score = await scoreImpact({
        activityType,
        hoursLogged,
        locationName: location.name,
        locationCountry: location.country,
        locationContinent: location.continent,
        locationCategory: location.category,
        activityDate,
        reflection,
        photoSubmitted: !!photoUrl,
      })

      await updateSubmissionScore(submission.id, score)
      setSubmissionScore(score)
      setQuestModalMode('score')
    } finally {
      setScoring(false)
    }
  }

  const buildQuestFromLocation = () => {
    if (selectedLocation) {
      return {
        title: selectedLocation.name,
        description: `Volunteer with ${selectedLocation.nonprofit}. Make a real impact — this opportunity reaches ~${selectedLocation.impact} people.`,
        rewards: { xp: Math.min(50 + selectedLocation.impact / 2, 200), badge: 'Quest Hero' },
      }
    }
    if (selectedRegion) {
      return {
        ...sampleQuest,
        title: `${sampleQuest.title} — ${selectedRegion}`,
        description: `${sampleQuest.description} Focus on opportunities in ${selectedRegion}.`,
      }
    }
    return sampleQuest
  }

  return (
    <div className="flex-1 min-h-0 relative overflow-hidden">
      <ContinentMap
        selectedRegion={selectedRegion}
        onRegionChange={setSelectedRegion}
        onLocationClick={handleLocationClick}
        onBackToGlobe={null}
        onProposeMission={handleProposeMission}
      />

      <QuestModal
        isOpen={questModalOpen}
        onClose={handleCloseQuestModal}
        quest={buildQuestFromLocation()}
        mode={questModalMode}
        selectedLocation={selectedLocation}
        isLoggedIn={authenticated}
        onLoginRequest={login}
        onAcceptQuest={handleAcceptQuest}
        onSubmitVolunteer={handleSubmitVolunteer}
        submissionScore={submissionScore}
        onScoreRevealClose={() => setSubmissionScore(null)}
      />

      {proposeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setProposeModalOpen(false)}>
          <div
            className="w-full max-w-md bg-[var(--color-panel-bg)] border-2 border-[var(--color-neon-magenta)] rounded-lg overflow-hidden max-h-[90vh] overflow-y-auto"
            style={{ boxShadow: '0 0 20px rgba(255, 0, 255, 0.3)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-[var(--color-panel-border)]">
              <span className="font-[var(--font-pixel)] text-[8px] text-[var(--color-neon-magenta)] uppercase">Propose Mission Center</span>
              <h2 className="font-[var(--font-pixel-alt)] text-xl text-[var(--color-app-text)] mt-1">
                Know a volunteer opportunity? Add it.
              </h2>
            </div>
            <div className="p-4">
              <ProposeMissionForm
                onSuccess={() => setProposeModalOpen(false)}
                onCancel={() => setProposeModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
