# Supabase Setup — One Source of Truth

## You only need 2 SQL scripts (not 6)

The **saved queries** in Supabase SQL Editor are just shortcuts. They don’t run automatically. You can delete all of them and use these two instead.

---

## Step 1: Run the full setup script

1. Supabase Dashboard → **SQL Editor**
2. Click **New query**
3. Copy the contents of **`supabase/SUPABASE_ONE_TIME_SETUP.sql`**
4. Paste and click **Run**
5. Confirm it completes without errors

This adds all columns and fixes RLS policies (including the “violates row-level security” error).

---

## Step 2: Run the seed script

1. Same SQL Editor, **New query**
2. Copy the contents of **`supabase/seed.sql`**
3. Paste and click **Run**

This fills the `locations` table so the map shows pins with valid UUIDs.

---

## Cleaning up saved queries (optional)

- Supabase → SQL Editor → **PRIVATE** section  
- You can delete the 6 old queries  
- Create one new query named “XPNC Full Setup” and paste `SUPABASE_ONE_TIME_SETUP.sql`  
- Create another named “XPNC Seed” and paste `seed.sql`  

Use these two whenever you need to reset or repair the database.

---

## What each script does

| Script                  | Purpose                                                      |
|-------------------------|--------------------------------------------------------------|
| `SUPABASE_ONE_TIME_SETUP.sql` | Columns + RLS policies for submissions, users, locations  |
| `seed.sql`              | Inserts 31 volunteer locations (map pins)                    |

---

## If you’re setting up a brand‑new project

Run these in order:

1. **`migrations/001_initial_schema.sql`** — creates tables
2. **`SUPABASE_ONE_TIME_SETUP.sql`** — adds extra columns + RLS
3. **`seed.sql`** — inserts locations
