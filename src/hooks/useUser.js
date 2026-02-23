/**
 * useUser — Combines Privy auth state with Supabase user data
 * Provides: ready, authenticated, login, logout, user (Supabase), walletAddress, username, impactPoints, level
 */
import { useEffect, useState, useCallback, useContext } from 'react'
import { PrivyBridgeContext } from '../components/PrivyProvider'
import { upsertUserFromPrivy, getUserByPrivyDid } from '../lib/users'

function getWalletAddressFromUser(user) {
  if (!user) return null
  if (user.wallet?.address) return user.wallet.address
  const wallet = user.linkedAccounts?.find((a) => a.type === 'wallet' && a.address)
  return wallet?.address ?? null
}

function getEmailFromUser(user) {
  if (!user) return null
  return user.email?.address ?? user.google?.email ?? null
}

function getDisplayNameFromUser(user) {
  if (!user) return null
  return user.google?.name ?? user.email?.address?.split('@')[0] ?? null
}

export function useUser() {
  const { ready, authenticated, user: privyUser, login, logout, wallets = [] } = useContext(PrivyBridgeContext)
  const [supabaseUser, setSupabaseUser] = useState(null)
  const [syncing, setSyncing] = useState(false)

  const walletAddress = privyUser
    ? getWalletAddressFromUser(privyUser) ?? wallets?.[0]?.address ?? null
    : null

  const syncUser = useCallback(async () => {
    if (!privyUser?.id || syncing) return

    setSyncing(true)
    const privyDid = privyUser.id
    const email = getEmailFromUser(privyUser)
    const walletAddr = getWalletAddressFromUser(privyUser) ?? wallets?.[0]?.address ?? null
    const username = getDisplayNameFromUser(privyUser) ?? email?.split('@')[0] ?? 'Volunteer'

    try {
      await upsertUserFromPrivy({
        privyDid,
        walletAddress: walletAddr,
        email,
        username,
      })

      const dbUser = await getUserByPrivyDid(privyDid)
      setSupabaseUser(dbUser)
    } catch (err) {
      console.error('User sync error:', err)
      const dbUser = await getUserByPrivyDid(privyDid)
      setSupabaseUser(dbUser)
    } finally {
      setSyncing(false)
    }
  }, [privyUser?.id, privyUser?.email, privyUser?.google, wallets])

  useEffect(() => {
    if (authenticated && privyUser) {
      syncUser()
    } else {
      setSupabaseUser(null)
    }
  }, [authenticated, privyUser?.id, syncUser])

  const username = supabaseUser?.username ?? getDisplayNameFromUser(privyUser) ?? 'Volunteer'

  return {
    ready,
    authenticated,
    login,
    logout,
    walletAddress,
    username,
    impactPoints: supabaseUser?.impact_points ?? 0,
    level: supabaseUser?.level ?? 1,
    avatarUrl: supabaseUser?.avatar_url ?? null,
    user: supabaseUser,
    privyUser,
    syncing,
  }
}
