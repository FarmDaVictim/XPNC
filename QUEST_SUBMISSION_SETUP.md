# Quest Submission Flow — Setup

## 1. Run Supabase setup (fixes RLS, missing columns, invalid uuid)

In Supabase → **SQL Editor**, run:

1. **`supabase/SUPABASE_ONE_TIME_SETUP.sql`** — columns + RLS policies (fixes "violates row-level security")
2. **`supabase/seed.sql`** — populates locations (fixes "invalid uuid 3")

See **`supabase/SUPABASE_SETUP_README.md`** for details and how to clean up saved queries.

Migration 003 adds:
- `reflection`, `score_reasoning`, `activity_date`, `activity_type` to submissions
- `status`, `website`, `contact`, `financial_support_needed` to locations
- RLS policies for inserts/updates

## 2. Create Storage bucket (for photo proof)

1. Supabase Dashboard → **Storage**
2. **New bucket** → name: `submissions`
3. **Public** (or configure RLS for your needs)

## 3. Add xAI API key (optional, for AI scoring)

1. Get an API key from [console.x.ai](https://console.x.ai)
2. Add to `.env`:
   ```
   VITE_XAI_API_KEY=your-xai-api-key
   ```

Without it, submissions use a fallback formula (no AI).

## 4. Admin (optional)

Add `VITE_ADMIN_SECRET` to `.env` (no default — you must set a password).

Navigate directly to `/admin` (no link in the app). Enter the password to access the control panel — approve/reject submissions and proposed Mission Centers.

---

## Flow summary

**Path 1 — Volunteer at location:** Click pin → Log volunteer hours → Submit form (hours, activity type, date, photo, 50+ word reflection) → AI scores → Score reveal

**Path 2 — Propose Mission Center:** Click "Propose Mission Center" on map → Fill form (geocoded address, category, description) → Saved as `status: proposed` → Shows as dimmed orange pin → Admin approves at `/admin`

**Bonus system:** `src/data/bonuses.js` defines awareness months (e.g. October: mental health). Matching submissions get a score multiplier from the AI.
