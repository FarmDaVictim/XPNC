# XPNC — Tokenized Volunteering Platform

A gamified platform for logging volunteer impact worldwide. Earn tokens, unlock badges, and build the circular economy of good.

## Features

- **Landing Page** — Cinematic globe, star field, live activity toasts
- **Interactive Map** — Browse mission centers by continent, glowing pins
- **Quest System** — Log volunteer hours, AI-powered impact scoring (xAI)
- **NFT Badges** — Achievement gallery (First Step, Global Citizen, etc.)
- **Impact Journal** — Submission history with scores and tokens
- **Wallet** — XPNC token balance, airdrop history
- **Admin Panel** — Approve/reject submissions and proposed locations
- **Auth** — Privy (email, Google, wallet)

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd xpnc
npm install
```

### 2. Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anon (public) key |
| `VITE_PRIVY_APP_ID` | Yes | Privy App ID from [dashboard.privy.io](https://dashboard.privy.io) |
| `VITE_XAI_API_KEY` | No* | xAI API key from [console.x.ai](https://console.x.ai) — enables AI scoring |
| `VITE_ADMIN_SECRET` | No* | Password for `/admin` panel — set for admin access |

\* Without xAI key: submissions use a fallback score. Without admin secret: admin panel is inaccessible.

### 3. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run these in order:

   - **`supabase/migrations/001_initial_schema.sql`** — creates tables
   - **`supabase/SUPABASE_ONE_TIME_SETUP.sql`** — adds columns + RLS policies
   - **`supabase/seed.sql`** — inserts volunteer locations (map pins)

3. Create a **Storage** bucket named `submissions` (public) for photo uploads
4. Copy your project URL and anon key to `.env`:
   - Supabase Dashboard → Project Settings → API

See `supabase/SUPABASE_SETUP_README.md` for details.

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 5. Deploy to Vercel

1. Push your repo to GitHub
2. Connect the repo at [vercel.com](https://vercel.com)
3. Add environment variables in Vercel Dashboard → Settings → Environment Variables (same names as `.env`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, etc.)
4. Deploy

The project includes `vercel.json` for SPA routing (React Router).

---

## Project Structure

```
xpnc/
├── src/
│   ├── components/     # Globe3D, Sidebar, QuestModal, ScoreReveal, etc.
│   ├── pages/          # Landing, MapView, Dashboard, QuestsList, etc.
│   ├── lib/            # Supabase, submissions, impactScore, stats
│   ├── data/           # Badges, bonuses, country flags, continent bounds
│   └── hooks/          # useUser
├── supabase/
│   ├── SUPABASE_ONE_TIME_SETUP.sql
│   ├── seed.sql
│   └── migrations/
└── vercel.json
```

## Routes

| Path | Description |
|------|-------------|
| `/` | Landing page (redirects to `/map` if logged in) |
| `/map` | Interactive map with pins |
| `/quests` | Quest list (card grid) |
| `/dashboard` | Hero profile, stats (auth required) |
| `/badges` | NFT Badges gallery (auth required) |
| `/journal` | Impact journal (auth required) |
| `/wallet` | Token wallet (auth required) |
| `/settings` | Settings |
| `/admin` | Admin panel (requires secret key) |

## Self-Test Checklist

After deployment, verify:

- [ ] Landing page loads with spinning globe and star field
- [ ] Sign in via Privy opens correctly
- [ ] After login, redirect to `/map` works
- [ ] Map shows continent buttons and glowing pins
- [ ] Clicking a pin opens quest modal
- [ ] Submitting volunteer hours triggers xAI scoring
- [ ] Score reveal displays correctly
- [ ] Dashboard shows hero profile and stats
- [ ] Badges page shows earned and locked badges
- [ ] Impact Journal shows submission history
- [ ] Wallet page shows token balance
- [ ] Propose Mission Center form submits correctly
- [ ] Admin panel at `/admin` is accessible with secret key
- [ ] Logout works and redirects to landing page

## License

Private — All rights reserved.
