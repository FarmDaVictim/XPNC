/**
 * Submissions API — volunteer logs and AI scoring
 */
import { supabase } from './supabase'

/** Upload photo to Supabase Storage, return public URL. Requires 'submissions' bucket in Supabase. */
export async function uploadSubmissionPhoto(file, folderId = crypto.randomUUID()) {
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${folderId}/${Date.now()}.${ext}`

  const { data, error } = await supabase.storage.from('submissions').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) {
    console.error('Photo upload error:', error)
    return null
  }

  const { data: urlData } = supabase.storage.from('submissions').getPublicUrl(data.path)
  return urlData.publicUrl
}

/** Create submission and return it */
export async function createSubmission({ userId, locationId, hoursLogged, activityType, activityDate, photoUrl, reflection }) {
  const { data, error } = await supabase
    .from('submissions')
    .insert({
      user_id: userId,
      location_id: locationId,
      hours_logged: hoursLogged,
      volunteer_type: activityType,
      activity_type: activityType,
      activity_date: activityDate,
      photo_url: photoUrl,
      reflection,
      notes: reflection,
      status: 'pending',
      impact_points_awarded: 0,
    })
    .select()
    .single()

  if (error) {
    console.error('Submission create error:', error)
    throw new Error(error.message || 'Failed to create submission')
  }

  return data
}

/** Get submissions for a user, with location joined */
export async function getSubmissionsByUserId(userId) {
  if (!userId) return []
  const { data, error } = await supabase
    .from('submissions')
    .select(`
      id, hours_logged, activity_type, activity_date, reflection, status,
      final_score, token_airdrop_amount, public_summary, reasoning,
      authenticity_verdict, created_at, photo_url, bonuses_applied,
      locations (id, name, nonprofit_name, continent, country, category)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Submissions fetch error:', error)
    return []
  }
  return data ?? []
}

/** Update submission with full Impact Integrity Engine result */
export async function updateSubmissionScore(submissionId, score) {
  const payload = {
    impact_points_awarded: score.final_score ?? score.impact_points,
    score_reasoning: score.reasoning ?? score.score_reasoning,
    status: score.admin_recommendation === 'reject' ? 'rejected' : 'pending',
    authenticity_score: score.authenticity_score,
    depth_score: score.depth_score,
    learning_score: score.learning_score,
    effort_score: score.effort_score,
    bonuses_applied: score.bonuses_applied,
    final_score: score.final_score,
    authenticity_verdict: score.authenticity_verdict,
    reasoning: score.reasoning,
    standout_detail: score.standout_detail,
    red_flags: score.red_flags,
    token_airdrop_amount: score.token_airdrop_amount,
    public_summary: score.public_summary,
    total_bonuses_percent: score.total_bonuses_percent,
    admin_recommendation: score.admin_recommendation,
  }

  const { data, error } = await supabase
    .from('submissions')
    .update(payload)
    .eq('id', submissionId)
    .select()
    .single()

  if (error) {
    console.error('Submission update error:', error)
    return null
  }

  return data
}
