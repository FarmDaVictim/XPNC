/**
 * Privy auth provider — email, Google, wallet (MetaMask, Coinbase, WalletConnect)
 * Falls back to stub when VITE_PRIVY_APP_ID is not set
 */
import { createContext, useContext } from 'react'
import { PrivyProvider as Privy, usePrivy, useWallets } from '@privy-io/react-auth'

const appId = import.meta.env.VITE_PRIVY_APP_ID

export const PrivyBridgeContext = createContext({
  ready: true,
  authenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
  wallets: [],
})

function PrivyBridge({ children }) {
  const privy = usePrivy()
  const { wallets } = useWallets()
  return (
    <PrivyBridgeContext.Provider value={{ ...privy, wallets }}>
      {children}
    </PrivyBridgeContext.Provider>
  )
}

function AuthFallback({ children }) {
  return (
    <PrivyBridgeContext.Provider value={{
      ready: true,
      authenticated: false,
      user: null,
      login: () => console.warn('Add VITE_PRIVY_APP_ID to .env to enable login'),
      logout: () => {},
      wallets: [],
    }}>
      {children}
    </PrivyBridgeContext.Provider>
  )
}

export default function PrivyProviderWrapper({ children }) {
  if (!appId || !appId.trim()) {
    console.warn('XPNC: Missing VITE_PRIVY_APP_ID. Add it to .env to enable auth.')
    return <AuthFallback>{children}</AuthFallback>
  }

  return (
    <Privy
      appId={appId}
      config={{
        loginMethods: ['email', 'google', 'wallet'],
        appearance: {
          theme: 'dark',
          accentColor: '#00f5ff',
          walletList: ['metamask', 'coinbase_wallet', 'wallet_connect_qr'],
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      <PrivyBridge>{children}</PrivyBridge>
    </Privy>
  )
}
