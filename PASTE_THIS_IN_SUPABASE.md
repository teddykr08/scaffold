# SQL Setup - Copy & Paste into Supabase

## Steps

1. Open Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Open `FINAL_SQL_FOR_SUPABASE.sql`
4. Copy all the SQL code
5. Paste into Supabase SQL Editor
6. Click the blue "Run" button
7. Wait for completion (should succeed in 2-5 seconds)

---

## What Gets Created

When a new user signs up, they automatically get:

**Study Tutor** - Subject, Grade Level
**Recipe Genius** - Fast AI recipes (no form)
**Personal Trainer** - Fitness Level, Goals, Injuries/Limitations

Each app has a custom prompt template with field variables.

---

## After SQL - Deploy Code

Push your updated code to production:
- 6 API routes updated (added auth)
- 3 frontend pages updated (use authenticatedFetch)
- 2 new helper files added

---

## Testing

1. Create new user in Supabase Auth
2. Wait 2-3 seconds
3. Check `apps` table - should see 3 default apps
4. Check `task_fields` table - should see fields for each app
5. Check `prompt_templates` table - should see templates

---

## Troubleshooting

**Error: "syntax error at or near NOT"** - This is fixed in the current SQL file (uses DROP POLICY IF EXISTS instead of CREATE POLICY IF NOT EXISTS)

**Trigger not creating apps?** - Make sure the entire SQL ran without errors. Test by creating a new user.

**Can't see fields/templates?** - Check that `task_fields` and `prompt_templates` tables got populated.

See `CHANGES_SUMMARY.md` for code details or `USER_ISOLATION_GUIDE.md` for implementation details.
