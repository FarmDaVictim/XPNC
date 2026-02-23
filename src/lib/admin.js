/**
 * Admin API — submissions, stats, locations for admin panel
 */
import { supabase } from './supabase'
import { checkAndAwardBadges } from './badges'
import { getSubmissionsByUserId } from './submissions'

const ADMIN_KEY = 'xpnc_admin_authed'

export function getAdminAuthed() {
  try {
    return sessionStorage.getItem(ADMIN_KEY) === 'true'
  } catch {
    return false
  }
}

export function setAdminAuthed(authed) {
  try {
    sessionStorage.setItem(ADMIN_KEY, authed ? 'true' : 'false')
  } catch {}
}

/** Get all submissions with user + location, for admin */
export async function getAdminSubmissions(statusFilter = null) {
  let query = supabase
    .from('submissions')
    .select(`
      *,
      user:users (id, username, wallet_address),
      locations (id, name, nonprofit_name, continent, country, city, lat, lng, category, description, website, contact, financial_support_needed)
    `)
    .order('created_at', { ascending: false })

  if (statusFilter) {
    query = query.eq('status', statusFilter)
  }
  const { data, error } = await query
  if (error) {
    console.error('Admin submissions fetch error:', error)
    return []
  }
  return data ?? []
}

/** Get platform stats */
export async function getAdminStats() {
  const [usersRes, submissionsRes, approvedRes] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('submissions').select('id', { count: 'exact', head: true }),
    supabase.from('submissions').select('id, hours_logged, token_airdrop_amount, locations(country)').eq('status', 'approved'),
  ])

  const approved = approvedRes.data ?? []
  const totalTokens = approved.reduce((sum, s) => sum + (s.token_airdrop_amount || 0), 0)
  const totalHours = approved.reduce((sum, s) => sum + (s.hours_logged || 0), 0)
  const countries = approved.map((s) => s.locations?.country).filter(Boolean)
  const countByCountry = {}
  countries.forEach((c) => { countByCountry[c] = (countByCountry[c] || 0) + 1 })
  const mostActive = countries.length
    ? Object.entries(countByCountry).sort((a, b) => b[1] - a[1])[0]?.[0]
    : null

  return {
    totalVolunteers: usersRes.count ?? 0,
    totalSubmissions: submissionsRes.count ?? 0,
    totalApproved: approved.length,
    totalTokensDistributed: totalTokens,
    totalHoursLogged: totalHours,
    mostActiveCountry: mostActive ?? '—',
  }
}

/** Get proposed locations (status=proposed or approved=false) */
export async function getProposedLocations() {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('status', 'proposed')
    .order('created_at', { ascending: false })

  if (error) {
    const fallback = await supabase.from('locations').select('*').eq('approved', false).order('created_at', { ascending: false })
    if (fallback.error) {
      console.error('Proposed locations fetch error:', error)
      return []
    }
    return fallback.data ?? []
  }
  return data ?? []
}

/** Approve submission: status, impact_points, tokens_earned, badges */
export async function approveSubmission(submissionId) {
  const { data: sub, error: subErr } = await supabase
    .from('submissions')
    .select('*, users(id), locations(*)')
    .eq('id', submissionId)
    .single()

  if (subErr || !sub) return { error: subErr?.message || 'Submission not found' }

  const userId = sub.user_id
  const tokenAmount = sub.token_airdrop_amount || 0
  const pointsToAdd = sub.final_score ?? sub.impact_points_awarded ?? 0

  const { data: user } = await supabase.from('users').select('impact_points, tokens_earned').eq('id', userId).single()
  const newPoints = (user?.impact_points ?? 0) + pointsToAdd
  const newTokens = (user?.tokens_earned ?? 0) + tokenAmount

  await supabase.from('users').update({
    impact_points: newPoints,
    tokens_earned: newTokens,
  }).eq('id', userId)

  await supabase.from('submissions').update({ status: 'approved', flagged: false }).eq('id', submissionId)

  const userSubs = await getSubmissionsByUserId(userId)
  const withApproved = userSubs.map((s) =>
    s.id === submissionId ? { ...s, status: 'approved' } : s
  )
  await checkAndAwardBadges(userId, withApproved)

  return { ok: true }
}

/** Reject submission */
export async function rejectSubmission(submissionId, reason = null) {
  const { error } = await supabase
    .from('submissions')
    .update({ status: 'rejected', rejection_reason: reason })
    .eq('id', submissionId)

  return { error: error?.message }
}

/** Flag submission for review */
export async function flagSubmission(submissionId) {
  const { error } = await supabase
    .from('submissions')
    .update({ flagged: true })
    .eq('id', submissionId)

  return { error: error?.message }
}

/** Approve proposed location */
export async function approveLocation(locationId) {
  const { error } = await supabase
    .from('locations')
    .update({ approved: true, status: 'active' })
    .eq('id', locationId)

  return { error: error?.message }
}

/** Reject proposed location */
export async function rejectLocation(locationId) {
  const { error } = await supabase.from('locations').delete().eq('id', locationId)
  return { error: error?.message }
}
