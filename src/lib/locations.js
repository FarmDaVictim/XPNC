/**
 * Locations API - fetches from Supabase
 * Falls back to mock data if Supabase is not configured or fetch fails
 */
import { supabase } from './supabase'
import { getLocationsByContinent as getMockLocations } from '../data/locations'

/** Map Supabase row to app shape (nonprofit_name → nonprofit, etc.) */
function mapLocation(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    nonprofit: row.nonprofit_name,
    nonprofit_name: row.nonprofit_name,
    description: row.description,
    continent: row.continent,
    country: row.country,
    city: row.city,
    lat: row.lat,
    lng: row.lng,
    category: row.category,
    impact: row.impact ?? 0,
    approved: row.approved,
    created_at: row.created_at,
  }
}

/**
 * Get locations for a region/continent (approved + proposed)
 * Proposed locations have isProposed: true for dimmed display
 */
export async function getLocationsByContinent(region) {
  if (!region) return []

  const isAmericas = region.toLowerCase() === 'americas'

  // Try full query (approved + proposed) — requires status column from migration 003
  let query = supabase
    .from('locations')
    .select('*')
    .or('approved.eq.true,status.eq.proposed')

  if (isAmericas) {
    query = query.in('continent', ['North America', 'South America'])
  } else {
    query = query.eq('continent', region)
  }

  let { data, error } = await query

  // Fallback: simpler query when status column doesn't exist yet — just approved locations
  if (error) {
    query = supabase.from('locations').select('*').eq('approved', true)
    if (isAmericas) {
      query = query.in('continent', ['North America', 'South America'])
    } else {
      query = query.eq('continent', region)
    }
    const fallback = await query
    data = fallback.data
    error = fallback.error
  }

  if (error) {
    console.warn('Supabase locations fetch failed, using mock data:', error.message)
    const mock = getMockLocations(region)
    return mock.map((m) => ({ ...m, isProposed: false }))
  }

  return (data ?? []).map((row) => ({
    ...mapLocation(row),
    isProposed: row.status === 'proposed' || (row.approved === false && !row.status),
  }))
}

/**
 * Get all locations (all regions) for quest list/table view
 */
export async function getAllLocations() {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .or('approved.eq.true,status.eq.proposed')
    .order('continent')
    .order('name')

  if (error) {
    const fallback = await supabase.from('locations').select('*').eq('approved', true).order('continent').order('name')
    if (fallback.error) {
      console.warn('Supabase locations fetch failed:', error.message)
      return []
    }
    return (fallback.data ?? []).map((row) => ({
      ...mapLocation(row),
      isProposed: false,
    }))
  }

  return (data ?? []).map((row) => ({
    ...mapLocation(row),
    isProposed: row.status === 'proposed' || (row.approved === false && !row.status),
  }))
}

/**
 * Get a single location by id
 */
export async function getLocationById(id) {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Supabase location fetch error:', error)
    return null
  }

  return mapLocation(data)
}
