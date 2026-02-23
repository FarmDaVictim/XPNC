/**
 * Mock volunteer locations per continent
 * Structure ready for future database integration
 */
export const LOCATIONS_BY_CONTINENT = [
  {
    continent: 'Africa',
    locations: [
      { id: 1, name: 'Teach English', nonprofit: 'Education for All Kenya', lat: -1.2921, lng: 36.8219, impact: 50 },
      { id: 2, name: 'Community Health Clinic', nonprofit: 'Health First Nigeria', lat: 6.5244, lng: 3.3792, impact: 120 },
      { id: 3, name: 'Water Well Project', nonprofit: 'Clean Water Africa', lat: -15.3767, lng: 28.1927, impact: 200 },
      { id: 4, name: 'Youth Coding Camp', nonprofit: 'TechBridge Ghana', lat: 5.6037, lng: -0.1870, impact: 35 },
      { id: 5, name: 'Reforestation Initiative', nonprofit: 'Green Earth Rwanda', lat: -1.9403, lng: 29.8739, impact: 80 },
    ],
  },
  {
    continent: 'Asia',
    locations: [
      { id: 6, name: 'Disaster Relief Training', nonprofit: 'Asia Resilience Org', lat: 14.5995, lng: 120.9842, impact: 90 },
      { id: 7, name: 'Rural School Support', nonprofit: 'EduIndia Foundation', lat: 28.6139, lng: 77.2090, impact: 75 },
      { id: 8, name: 'Elder Care Program', nonprofit: 'Silver Lining Japan', lat: 35.6762, lng: 139.6503, impact: 45 },
      { id: 9, name: 'Sustainable Farming Workshop', nonprofit: 'Green Vietnam', lat: 21.0285, lng: 105.8542, impact: 110 },
      { id: 10, name: 'Digital Literacy Class', nonprofit: 'Tech4All Indonesia', lat: -6.2088, lng: 106.8456, impact: 60 },
    ],
  },
  {
    continent: 'Europe',
    locations: [
      { id: 11, name: 'Refugee Integration Support', nonprofit: 'Welcome Europe', lat: 52.5200, lng: 13.4050, impact: 85 },
      { id: 12, name: 'Urban Garden Project', nonprofit: 'Green Paris Collective', lat: 48.8566, lng: 2.3522, impact: 40 },
      { id: 13, name: 'Youth Mentorship', nonprofit: 'Rise Up London', lat: 51.5074, lng: -0.1278, impact: 65 },
      { id: 14, name: 'Food Bank Distribution', nonprofit: 'Share the Meal Spain', lat: 40.4168, lng: -3.7038, impact: 130 },
      { id: 15, name: 'Elder Companion Program', nonprofit: 'Silver Friends Italy', lat: 41.9028, lng: 12.4964, impact: 55 },
    ],
  },
  {
    continent: 'North America',
    locations: [
      { id: 16, name: 'Soup Kitchen Volunteer', nonprofit: 'Hearts of America', lat: 40.7128, lng: -74.0060, impact: 100 },
      { id: 17, name: 'Habitat for Housing', nonprofit: 'Build Together USA', lat: 33.7490, lng: -84.3880, impact: 70 },
      { id: 18, name: 'Beach Cleanup', nonprofit: 'Ocean Guardians', lat: 34.0195, lng: -118.4912, impact: 95 },
      { id: 19, name: 'Tutoring at Community Center', nonprofit: 'Learn Together Canada', lat: 43.6532, lng: -79.3832, impact: 50 },
      { id: 20, name: 'Animal Shelter Support', nonprofit: 'Paw Rescue Mexico', lat: 19.4326, lng: -99.1332, impact: 40 },
    ],
  },
  {
    continent: 'South America',
    locations: [
      { id: 21, name: 'Amazon Reforestation', nonprofit: 'Pulmón Verde', lat: -3.1190, lng: -60.0217, impact: 180 },
      { id: 22, name: 'Medical Outreach', nonprofit: 'HealthBridge Brasil', lat: -23.5505, lng: -46.6333, impact: 90 },
      { id: 23, name: 'School Build Project', nonprofit: 'EduPeru', lat: -12.0464, lng: -77.0428, impact: 75 },
      { id: 24, name: 'Indigenous Rights Support', nonprofit: 'Voz Nativa', lat: -33.4489, lng: -70.6693, impact: 60 },
      { id: 25, name: 'Microfinance Training', nonprofit: 'Empower Colombia', lat: 4.7110, lng: -74.0721, impact: 85 },
    ],
  },
  {
    continent: 'Oceania',
    locations: [
      { id: 26, name: 'Coral Reef Restoration', nonprofit: 'Ocean Care Australia', lat: -33.8688, lng: 151.2093, impact: 120 },
      { id: 27, name: 'Indigenous Education', nonprofit: 'First Nations Learning', lat: -36.8485, lng: 174.7633, impact: 55 },
      { id: 28, name: 'Disaster Prep Workshop', nonprofit: 'Pacific Ready', lat: -8.4095, lng: 115.1889, impact: 70 },
      { id: 29, name: 'Wildlife Sanctuary', nonprofit: 'Kiwi Conservation', lat: -41.2866, lng: 174.7756, impact: 45 },
      { id: 30, name: 'Youth Sports Program', nonprofit: 'Play Fiji', lat: -17.7134, lng: 178.0650, impact: 35 },
    ],
  },
  {
    continent: 'Antarctica',
    locations: [
      { id: 31, name: 'Research Station Support', nonprofit: 'Polar Research Institute', lat: -77.8467, lng: 166.6681, impact: 25 },
    ],
  },
]

/** Get locations for a continent or region (Americas = North + South America) */
export function getLocationsByContinent(continent) {
  if (!continent) return []
  const name = continent.toLowerCase()
  if (name === 'americas') {
    const na = LOCATIONS_BY_CONTINENT.find((c) => c.continent === 'North America')
    const sa = LOCATIONS_BY_CONTINENT.find((c) => c.continent === 'South America')
    return [...(na?.locations ?? []), ...(sa?.locations ?? [])]
  }
  const found = LOCATIONS_BY_CONTINENT.find(
    (c) => c.continent.toLowerCase() === name
  )
  return found?.locations ?? []
}

/** Get single location by id */
export function getLocationById(id) {
  for (const { locations } of LOCATIONS_BY_CONTINENT) {
    const loc = locations.find((l) => l.id === Number(id))
    if (loc) return loc
  }
  return null
}
