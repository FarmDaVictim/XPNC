/**
 * Badge definitions — earned by completing impact milestones
 */

export const LEVEL_TITLES = {
  1: 'Spark',
  2: 'Seeker',
  3: 'Helper',
  4: 'Impact Wanderer',
  5: 'Change Maker',
  6: 'World Builder',
  7: 'Altruist',
  8: 'Legend',
  9: 'Guardian',
  10: 'Eternal',
}

/** XP required to reach each level (cumulative). Level N needs XP_THRESHOLDS[N] */
export const XP_THRESHOLDS = [0, 100, 300, 600, 900, 1500, 2500, 4000, 6500, 10000, 15000]

export function getLevelFromXP(xp) {
  let level = 1
  for (let i = XP_THRESHOLDS.length - 1; i >= 1; i--) {
    if (xp >= XP_THRESHOLDS[i]) {
      level = i
      break
    }
  }
  return Math.min(level, 10)
}

export function getXPProgress(xp) {
  const level = getLevelFromXP(xp)
  const current = XP_THRESHOLDS[level]
  const next = XP_THRESHOLDS[level + 1] ?? null
  const isMax = level >= 10
  const needed = next ? next - current : 0
  const progress = isMax ? needed : Math.min(Math.max(0, xp - current), needed || 1)
  return { level, current, next, progress, needed: needed || 1, isMax }
}

/** Badge definitions: id, name, icon (emoji), check(submissions, earnedBadges) => boolean, unlockHint(progress) */
export const BADGES = [
  {
    id: 'first_step',
    name: 'First Step',
    icon: '👣',
    check: (subs, earned) => earned.has('first_step') || subs.filter((s) => s.status === 'approved').length >= 1,
    unlockHint: (subs) => (subs.filter((s) => s.status === 'approved').length >= 1 ? null : 'Complete your first volunteer submission'),
  },
  {
    id: 'global_citizen',
    name: 'Global Citizen',
    icon: '🌍',
    check: (subs, earned) => {
      const countries = new Set(subs.filter((s) => s.status === 'approved').map((s) => s.locations?.country).filter(Boolean))
      return countries.size >= 3
    },
    unlockHint: (subs) => {
      const countries = new Set(subs.filter((s) => s.status === 'approved').map((s) => s.locations?.country).filter(Boolean))
      const need = 3 - countries.size
      return need > 0 ? `Volunteer in ${need} more countr${need === 1 ? 'y' : 'ies'}` : null
    },
  },
  {
    id: 'marathon_heart',
    name: 'Marathon Heart',
    icon: '❤️',
    check: (subs) => subs.filter((s) => s.status === 'approved').reduce((sum, s) => sum + (s.hours_logged || 0), 0) >= 50,
    unlockHint: (subs) => {
      const hours = subs.filter((s) => s.status === 'approved').reduce((sum, s) => sum + (s.hours_logged || 0), 0)
      const need = 50 - hours
      return need > 0 ? `${need} more hours to go` : null
    },
  },
  {
    id: 'continent_hopper',
    name: 'Continent Hopper',
    icon: '✈️',
    check: (subs) => {
      const continents = new Set(subs.filter((s) => s.status === 'approved').map((s) => s.locations?.continent).filter(Boolean))
      return continents.size >= 3
    },
    unlockHint: (subs) => {
      const continents = new Set(subs.filter((s) => s.status === 'approved').map((s) => s.locations?.continent).filter(Boolean))
      const need = 3 - continents.size
      return need > 0 ? `Volunteer on ${need} more continent${need === 1 ? '' : 's'}` : null
    },
  },
  {
    id: 'mentor',
    name: 'Mentor',
    icon: '📖',
    check: (subs) => subs.filter((s) => s.status === 'approved' && (s.activity_type === 'education' || s.locations?.category === 'education')).length >= 5,
    unlockHint: (subs) => {
      const count = subs.filter((s) => s.status === 'approved' && (s.activity_type === 'education' || s.locations?.category === 'education')).length
      const need = 5 - count
      return need > 0 ? `${need} more education submissions` : null
    },
  },
  {
    id: 'hunger_fighter',
    name: 'Hunger Fighter',
    icon: '🌾',
    check: (subs) => subs.filter((s) => s.status === 'approved' && (s.activity_type === 'food' || s.locations?.category === 'food')).length >= 3,
    unlockHint: (subs) => {
      const count = subs.filter((s) => s.status === 'approved' && (s.activity_type === 'food' || s.locations?.category === 'food')).length
      const need = 3 - count
      return need > 0 ? `${need} more food distribution submissions` : null
    },
  },
  {
    id: 'rare_soul',
    name: 'Rare Soul',
    icon: '💎',
    check: (subs) => subs.some((s) => {
      const bonuses = s.bonuses_applied || []
      return bonuses.some((b) => (b.bonus_name || '').toLowerCase().includes('rare') || (b.bonus_name || '').toLowerCase().includes('critical'))
    }),
    unlockHint: () => 'Earn a Rare Critical Need bonus on a submission',
  },
  {
    id: 'consistent',
    name: 'Consistent',
    icon: '📅',
    check: (subs) => {
      const months = [...new Set(subs.filter((s) => s.status === 'approved').map((s) => {
        const d = s.activity_date || s.created_at
        return d ? new Date(d).toISOString().slice(0, 7) : null
      }).filter(Boolean))].sort()
      for (let i = 0; i <= months.length - 3; i++) {
        const [y1, m1] = months[i].split('-').map(Number)
        const [y2, m2] = months[i + 1].split('-').map(Number)
        const [y3, m3] = months[i + 2].split('-').map(Number)
        const seq1 = (y2 - y1) * 12 + (m2 - m1) === 1
        const seq2 = (y3 - y2) * 12 + (m3 - m2) === 1
        if (seq1 && seq2) return true
      }
      return false
    },
    unlockHint: () => 'Submit in 3 consecutive months',
  },
  {
    id: 'deep_impact',
    name: 'Deep Impact',
    icon: '⚡',
    check: (subs) => subs.some((s) => (s.final_score ?? 0) >= 400),
    unlockHint: (subs) => {
      const max = Math.max(...subs.map((s) => s.final_score ?? 0), 0)
      const need = 400 - max
      return need > 0 ? `Score ${need} more points on a submission` : null
    },
  },
]
