/**
 * OpenStreetMap Nominatim geocoding
 * Resolves address text to lat/lng + country/continent
 */
import { ISO_TO_CONTINENT, ISO_A2_TO_CONTINENT } from '../data/continentMap'

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'

export async function geocodeAddress(address) {
  if (!address?.trim()) return null

  const params = new URLSearchParams({
    q: address.trim(),
    format: 'json',
    limit: '1',
    addressdetails: '1',
  })

  const res = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: { 'Accept-Language': 'en' },
  })

  if (!res.ok) return null

  const data = await res.json()
  const first = data?.[0]

  if (!first) return null

  const countryCode = first.address?.country_code?.toUpperCase()
  const continentCode = countryCode ? ISO_A2_TO_CONTINENT[countryCode] : null
  const continent = continentCode ? ISO_TO_CONTINENT[continentCode] : 'TBD'

  return {
    lat: parseFloat(first.lat),
    lng: parseFloat(first.lon),
    displayName: first.display_name,
    country: first.address?.country || 'Unknown',
    city: first.address?.city || first.address?.town || first.address?.village || first.address?.county || 'Unknown',
    continent,
  }
}
