/**
 * Approximate bounds [southwest, northeast] for Leaflet fitBounds
 * Format: [[swLat, swLng], [neLat, neLng]]
 * Regions: Africa, Asia, Europe, Americas (NA+SA), Oceania
 */
export const REGIONS = ['Africa', 'Asia', 'Europe', 'Americas', 'Oceania']

export const CONTINENT_BOUNDS = {
  Africa: [[-34.8, -18.0], [37.5, 51.2]],
  Asia: [[-11.0, 26.0], [78.0, 180.0]],
  Europe: [[35.0, -25.0], [71.0, 60.0]],
  Americas: [[-55.0, -170.0], [72.0, -34.0]],
  Oceania: [[-50.0, 110.0], [0.0, 180.0]],
  'North America': [[14.5, -170.0], [72.0, -52.0]],
  'South America': [[-55.0, -82.0], [12.0, -34.0]],
  Antarctica: [[-90.0, -180.0], [-60.0, 180.0]],
}

export function getBoundsForContinent(continent) {
  return CONTINENT_BOUNDS[continent] ?? [[-30, -60], [50, 120]]
}
