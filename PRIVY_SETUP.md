# Privy Auth Setup

## 1. Install dependencies

```bash
npm install
```

## 2. Create a Privy app

1. Go to [dashboard.privy.io](https://dashboard.privy.io)
2. Create an app (or use existing)
3. Enable login methods: **Email**, **Google**, **Wallet**
4. Copy your **App ID**

## 3. Add App ID to `.env`

```
VITE_PRIVY_APP_ID=your-app-id-here
```

## 4. Run the Supabase migration

In Supabase SQL Editor, run `supabase/migrations/002_add_privy_support.sql` to add `privy_did`, `email`, and `updated_at` to the users table.

## 5. Restart dev server

```bash
npm run dev
```

---

**Login methods:** Email (magic link), Google OAuth, MetaMask, Coinbase Wallet, WalletConnect

**Flow:** Users can browse the globe and map without logging in. When they click "Accept Quest", they're prompted to log in. After first login, a row is created in Supabase `users` with their Privy DID and wallet/email.
