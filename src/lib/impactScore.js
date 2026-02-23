/**
 * Impact Integrity Engine — xAI-powered authentic impact scoring
 * Detects genuine human impact vs token farming
 */
import { getActiveBonusForDate } from '../data/bonuses'

const XAI_API_URL = 'https://api.x.ai/v1/chat/completions'
const DEFAULT_MODEL = 'grok-4-fast-reasoning' // grok-2-latest deprecated; use grok-4-fast-reasoning or grok-3-mini

const SYSTEM_PROMPT = `You are the Impact Integrity Engine for XPNC, a global platform for gamified volunteering and tokenized altruism. You are not a rubber stamp. You are a detector of authentic human impact versus token farming.

CORE DIRECTIVE:
Answer one question: Did this person genuinely show up, put their heart in, learn something, and create measurable positive impact?

Do NOT reward: token farmers using flowery language, generic descriptions like 'I helped people', submissions with zero evidence of learning, self-congratulatory writing with no humility, or overly polished language that sounds AI-generated.

DO reward: specific unprompted details (names, conversations, what someone said that stuck with them), vulnerability and admission of difficulty, authentic stories they could not have fabricated, sensory details about the environment (what they saw, heard, smelled), recognition of structural problems they encountered, and clear evidence their perspective shifted.

SCORING DIMENSIONS (0-500 total):

1. Authenticity of Reflection (0-200 pts, 40% weight)
Red flags: clichéd phrases like 'made a difference' or 'changed lives', no specific examples, overly polished corporate language, zero humility, self-congratulatory tone.
Green flags: names of people they met, what someone said that broke their heart or made them laugh, admission they weren't sure if they helped, sensory environment details, recognition of their own ignorance or bias, how the work challenged their assumptions.

2. Depth of Impact (0-150 pts, 30% weight)
Consider: did they help one person deeply or many shallowly? Was work direct care or structural? Is this skill rare in this location? Is the need acute — hunger, loneliness, healthcare gaps?
Baselines: teaching a class 3 hours = 60-100 pts. One-on-one with isolated elderly person 1 hour = 80-120 pts. Relationship building always scores higher than transactional help. Underserved regions get higher multipliers. Activity addressing acute suffering scores higher than general volunteering.

3. Evidence of Learning and Growth (0-100 pts, 20% weight)
Did their perspective shift? What surprised them? What challenged their assumptions? What will they do differently? Submissions showing zero learning score low here regardless of hours.

4. Effort and Presence (0-50 pts, 10% weight)
Did they go beyond minimum? Show ongoing commitment? Take initiative or adapt on the ground? Come back more than once?

BONUS MULTIPLIERS (max +75% total, only apply with clear evidence from the reflection):
- Underserved Region +20%: rural Africa, conflict zones, indigenous communities, areas with few volunteers
- Awareness Month +15%: check the active bonuses passed in the request and apply if category matches
- Structural Impact +25%: policy advocacy, training other volunteers, creating lasting resources not just direct aid
- Relationship Depth +20%: genuine ongoing relationship built, not transactional one-time help
- Rare Critical Need +25%: specialized skill that is rare in that specific location such as medical expertise, language tutoring, crisis counseling

IMPORTANT GUARDRAILS:
- If genuinely unsure, mark admin_recommendation as 'review' not 'approve' — better to let a human decide
- Context matters more than hours: 30 minutes with a suicidal person outweighs 8 hours of data entry
- A perfectly written reflection with zero specificity is a red flag, not a green one
- Reward genuine effort and honest uncertainty — someone who tried hard and admits they don't know if it worked is more valuable than someone who claims they changed everything
- The volunteer should read your reasoning and think 'yeah, that's fair' — be specific, not vague

TOKEN AIRDROP FORMULA (applied only after admin approval):
0-100 pts = 10 tokens
100-200 pts = 25 tokens
200-300 pts = 50 tokens
300-400 pts = 100 tokens
400-500 pts = 250 tokens

RETURN ONLY THIS EXACT JSON, no markdown, no explanation outside it:
{
  "impact_score": <0-500 integer before bonuses>,
  "authenticity_score": <0-200>,
  "depth_score": <0-150>,
  "learning_score": <0-100>,
  "effort_score": <0-50>,
  "bonuses_applied": [{"bonus_name": "string", "reason": "specific evidence from their reflection", "points_added": <integer>}],
  "total_bonuses_percent": <0-75>,
  "final_score": <0-500 integer after bonuses applied>,
  "authenticity_verdict": "genuine | questionable | suspicious",
  "reasoning": "2-3 sentences being specific about what convinced you or concerned you — name exact details from their submission",
  "standout_detail": "a specific quote or moment from their reflection that stood out most",
  "red_flags": ["list any concerns here"] or [],
  "admin_recommendation": "approve | review | reject",
  "token_airdrop_amount": <integer calculated from final_score using formula above>,
  "public_summary": "1 warm sentence explaining their score simply and directly to the volunteer"
}`

function buildUserMessage(submission) {
  const {
    activityType,
    hoursLogged,
    locationName,
    locationCountry,
    locationContinent,
    activityDate,
    reflection,
    photoSubmitted,
  } = submission

  const date = activityDate || new Date().toISOString().slice(0, 10)
  const bonus = getActiveBonusForDate(date)
  const activeBonuses = bonus
    ? `${bonus.month}: ${bonus.multiplierNote} (categories: ${bonus.categories.join(', ')})`
    : 'None this month'

  return `Volunteer Submission:
- Activity Type: ${activityType || 'volunteering'}
- Hours: ${hoursLogged}
- Location: ${locationName || 'Community location'}${locationCountry ? `, ${locationCountry}` : ''}
- Date: ${date}
- Photo submitted: ${photoSubmitted ? 'yes' : 'no'}
- Written Reflection: "${reflection || ''}"
- Active Bonus Months This Month: ${activeBonuses}
- Region/Continent: ${locationContinent || 'Unknown'}

Score this submission. Return only valid JSON.`
}

export async function scoreImpact(submission) {
  const apiKey = import.meta.env.VITE_XAI_API_KEY

  if (!apiKey) {
    console.warn('XPNC: VITE_XAI_API_KEY not set. Using fallback score.')
    const hrs = submission.hoursLogged || 1
    return createFallbackScore(hrs, 'no_key')
  }

  const userMessage = buildUserMessage(submission)

  const TIMEOUT_MS = 90_000

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

    const res = await fetch(XAI_API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: import.meta.env.VITE_XAI_MODEL || DEFAULT_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.3,
      }),
    })

    clearTimeout(timeoutId)

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`xAI API error: ${res.status} ${err}`)
    }

    const data = await res.json()
    const content = data?.choices?.[0]?.message?.content?.trim()

    if (!content) throw new Error('Empty response from xAI')

    const raw = content.replace(/```json\n?|\n?```/g, '').trim()
    const parsed = JSON.parse(raw)

    return normalizeScore(parsed)
  } catch (err) {
    console.error('Impact scoring error:', err)
    const reason = err.name === 'AbortError' ? 'timeout' : 'api_failed'
    if (reason === 'timeout') {
      console.warn('xAI scoring timed out after 90s — using fallback score')
    }
    return createFallbackScore(submission.hoursLogged || 1, reason, err)
  }
}

function normalizeScore(p) {
  const finalScore = Math.max(0, Math.min(500, p.final_score ?? p.impact_score ?? 100))
  const tokenAmount = scoreToTokens(finalScore)

  return {
    impact_score: Math.max(0, Math.min(500, p.impact_score ?? 100)),
    authenticity_score: Math.max(0, Math.min(200, p.authenticity_score ?? 80)),
    depth_score: Math.max(0, Math.min(150, p.depth_score ?? 60)),
    learning_score: Math.max(0, Math.min(100, p.learning_score ?? 40)),
    effort_score: Math.max(0, Math.min(50, p.effort_score ?? 20)),
    bonuses_applied: Array.isArray(p.bonuses_applied) ? p.bonuses_applied : [],
    total_bonuses_percent: Math.max(0, Math.min(75, p.total_bonuses_percent ?? 0)),
    final_score: finalScore,
    authenticity_verdict: ['genuine', 'questionable', 'suspicious'].includes(p.authenticity_verdict)
      ? p.authenticity_verdict
      : 'genuine',
    reasoning: p.reasoning || 'Impact recognized.',
    standout_detail: p.standout_detail || '',
    red_flags: Array.isArray(p.red_flags) ? p.red_flags : [],
    admin_recommendation: ['approve', 'review', 'reject'].includes(p.admin_recommendation)
      ? p.admin_recommendation
      : 'approve',
    token_airdrop_amount: p.token_airdrop_amount ?? tokenAmount,
    public_summary: p.public_summary || 'Your volunteer impact has been scored.',
    impact_points: finalScore,
    score_reasoning: p.reasoning || p.public_summary,
  }
}

function scoreToTokens(score) {
  if (score >= 400) return 250
  if (score >= 300) return 100
  if (score >= 200) return 50
  if (score >= 100) return 25
  return 10
}

function createFallbackScore(hours, reason = 'no_key', err) {
  const base = Math.min(50 + hours * 20, 200)
  const messages = {
    no_key: {
      reasoning: 'AI scoring skipped — add VITE_XAI_API_KEY to .env and restart the app for full impact analysis.',
      public_summary: 'Your volunteer impact has been recorded. Add xAI API key for AI-powered scoring.',
    },
    timeout: {
      reasoning: 'AI scoring timed out — the xAI API did not respond in time. Your submission was scored using hours-based fallback.',
      public_summary: 'Your impact has been recorded. AI scoring was unavailable (timeout).',
    },
    api_failed: {
      reasoning: `AI scoring unavailable — xAI API request failed. ${err?.message || 'Check console for details.'} Using hours-based fallback.`,
      public_summary: 'Your impact has been recorded. AI scoring was temporarily unavailable.',
    },
  }
  const m = messages[reason] || messages.no_key
  return {
    impact_score: base,
    authenticity_score: Math.min(base * 0.4, 200),
    depth_score: Math.min(base * 0.3, 150),
    learning_score: Math.min(base * 0.2, 100),
    effort_score: Math.min(base * 0.1, 50),
    bonuses_applied: [],
    total_bonuses_percent: 0,
    final_score: base,
    authenticity_verdict: 'genuine',
    reasoning: m.reasoning,
    standout_detail: '',
    red_flags: [],
    admin_recommendation: 'approve',
    token_airdrop_amount: scoreToTokens(base),
    public_summary: m.public_summary,
    impact_points: base,
    score_reasoning: m.reasoning,
  }
}
