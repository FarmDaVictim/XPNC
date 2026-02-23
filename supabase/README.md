# XPNC Supabase Setup

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a project
2. Get your **Project URL** and **anon public key** from Project Settings → API

## 2. Run the schema

In Supabase Dashboard → **SQL Editor**, run in order:

1. `migrations/001_initial_schema.sql` — creates tables (users, locations, submissions, badges)
2. `migrations/002_add_privy_support.sql` — adds privy_did, email, updated_at for auth
3. `seed.sql` — inserts mock location data

## 3. Configure environment

Copy `.env.example` to `.env` and fill in your values:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_PRIVY_APP_ID=your-privy-app-id
```

Restart the dev server after changing env vars.
