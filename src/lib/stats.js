/**
 * Landing stats — total missions, volunteers, countries from Supabase
 * Returns null if query fails or all zeros
 */
import { supabase } from './supabase'

export async function getLandingStats() {
  try {
    const { data: approved, error: err1 } = await supabase
      .from('submissions')
      .select('id, user_id, location_id', { count: 'exact' })
      .eq('status', 'approved')

    if (err1 || !approved?.length) return null

    const missions = approved.length
    const volunteerIds = new Set(approved.map((s) => s.user_id).filter(Boolean))

    const locationIds = [...new Set(approved.map((s) => s.location_id).filter(Boolean))]
    let countries = 0
    if (locationIds.length > 0) {
      const { data: locs } = await supabase
        .from('locations')
        .select('country')
        .in('id', locationIds)
      const countrySet = new Set(locs?.map((l) => l.country).filter(Boolean) ?? [])
      countries = countrySet.size
    }

    const volunteers = volunteerIds.size
    if (missions === 0 && volunteers === 0 && countries === 0) return null

    return { missions, volunteers, countries }
  } catch {
    return null
  }
}
