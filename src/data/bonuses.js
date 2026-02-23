/**
 * Bonus multiplier config — awareness months and categories
 * When a submission matches an active bonus, xAI is prompted to factor it in
 *
 * Format: { month: number (1-12), categories: string[], multiplierNote: string }
 */
export const BONUSES = [
  { month: 1, categories: ['community', 'education'], multiplierNote: 'New Year — Community & Education focus' },
  { month: 2, categories: ['health', 'community'], multiplierNote: 'Black History Month — Health & Community impact' },
  { month: 3, categories: ['women', 'environment'], multiplierNote: 'Women\'s History — Empowerment & Environment' },
  { month: 4, categories: ['environment', 'education'], multiplierNote: 'Earth Month — Environment & Climate' },
  { month: 5, categories: ['mental health', 'elderly', 'community'], multiplierNote: 'Mental Health Awareness — Elder care & Community' },
  { month: 6, categories: ['environment', 'community'], multiplierNote: 'Pride — Community & Inclusion' },
  { month: 7, categories: ['education', 'youth'], multiplierNote: 'Youth & Education focus' },
  { month: 8, categories: ['community', 'education'], multiplierNote: 'Back to School — Education impact' },
  { month: 9, categories: ['food', 'hunger', 'community'], multiplierNote: 'Hunger Action Month — Food security' },
  { month: 10, categories: ['mental health', 'health'], multiplierNote: 'Mental Health Awareness Month' },
  { month: 11, categories: ['hunger', 'food', 'community'], multiplierNote: 'November — Hunger & Food security focus' },
  { month: 12, categories: ['community', 'food', 'elderly'], multiplierNote: 'Holiday season — Community warmth' },
]

export const ACTIVITY_CATEGORIES = [
  'education',
  'food',
  'health',
  'mental health',
  'environment',
  'community',
  'animals',
  'elderly',
  'youth',
  'emergency',
  'science',
  'general',
]

/** Get active bonus for a given date */
export function getActiveBonusForDate(date) {
  const d = date instanceof Date ? date : new Date(date)
  const month = d.getMonth() + 1
  const bonus = BONUSES.find((b) => b.month === month)
  return bonus || null
}

/** Check if a category matches the current month's bonus */
export function categoryMatchesBonus(category, date = new Date()) {
  const bonus = getActiveBonusForDate(date)
  if (!bonus) return false
  const cat = (category || '').toLowerCase().replace(/\s+/g, ' ')
  return bonus.categories.some((c) => cat.includes(c.toLowerCase()))
}
