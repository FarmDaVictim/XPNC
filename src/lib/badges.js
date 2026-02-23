/**
 * Badges API — fetch, award, check and award
 */
import { supabase } from './supabase'
import { BADGES } from '../data/badges'

/** Get badges earned by user */
export async function getBadgesByUserId(userId) {
  if (!userId) return []
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false })

  if (error) {
    console.error('Badges fetch error:', error)
    return []
  }
  return data ?? []
}

/** Award a badge to user */
export async function awardBadge(userId, badgeId, badgeName, badgeDescription = '') {
  const { error } = await supabase.from('badges').insert({
    user_id: userId,
    badge_name: badgeId,
    badge_description: badgeDescription,
  })

  if (error) {
    console.error('Badge award error:', error)
    return false
  }
  return true
}

/**
 * Check submission + badge history and award any newly earned badges
 */
export async function checkAndAwardBadges(userId, submissions) {
  if (!userId) return []

  const earned = await getBadgesByUserId(userId)
  const earnedSet = new Set(earned.map((b) => b.badge_name))
  const toAward = []

  for (const badge of BADGES) {
    if (earnedSet.has(badge.id)) continue
    if (badge.check(submissions, earnedSet)) {
      toAward.push(badge)
      earnedSet.add(badge.id)
    }
  }

  for (const badge of toAward) {
    await awardBadge(userId, badge.id, badge.name, badge.name)
  }

  return toAward.length > 0 ? await getBadgesByUserId(userId) : earned
}
