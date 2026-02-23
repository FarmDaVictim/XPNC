/**
 * Users API - sync Privy users to Supabase
 */
import { supabase } from './supabase'

/**
 * Upsert user from Privy data into Supabase
 * Creates or updates the users row
 */
export async function upsertUserFromPrivy({ privyDid, walletAddress, email, username: displayName }) {
  const username = displayName || email?.split('@')[0] || walletAddress?.slice(0, 8) + '...' || 'Volunteer'

  const { data, error } = await supabase
    .from('users')
    .upsert(
      {
        privy_did: privyDid,
        wallet_address: walletAddress || null,
        email: email || null,
        username,
      },
      { onConflict: 'privy_did' }
    )
    .select()
    .single()

  if (error) {
    console.error('Supabase user upsert error:', error)
    return null
  }

  return data
}

/**
 * Fetch user from Supabase by privy_did
 */
export async function getUserByPrivyDid(privyDid) {
  if (!privyDid) return null

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('privy_did', privyDid)
    .single()

  if (error) return null
  return data
}
