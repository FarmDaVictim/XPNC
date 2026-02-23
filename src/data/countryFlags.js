/** Country name → flag emoji for common countries */
export const COUNTRY_FLAGS = {
  Kenya: '🇰🇪',
  Nigeria: '🇳🇬',
  Zambia: '🇿🇲',
  Ghana: '🇬🇭',
  Rwanda: '🇷🇼',
  Philippines: '🇵🇭',
  India: '🇮🇳',
  Japan: '🇯🇵',
  Vietnam: '🇻🇳',
  Indonesia: '🇮🇩',
  Germany: '🇩🇪',
  France: '🇫🇷',
  UK: '🇬🇧',
  Spain: '🇪🇸',
  Italy: '🇮🇹',
  USA: '🇺🇸',
  Canada: '🇨🇦',
  Mexico: '🇲🇽',
  Brazil: '🇧🇷',
  Peru: '🇵🇪',
  Chile: '🇨🇱',
  Colombia: '🇨🇴',
  Australia: '🇦🇺',
  'New Zealand': '🇳🇿',
  Fiji: '🇫🇯',
  '': '🌐',
}

export function getCountryFlag(country) {
  if (!country) return '🌐'
  return COUNTRY_FLAGS[country] ?? '🌐'
}
