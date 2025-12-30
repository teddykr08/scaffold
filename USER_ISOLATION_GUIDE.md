# User Isolation Implementation - Complete Guide

## Overview

This implementation adds user isolation to your Scaffold application. Each user now has their own separate apps, tasks, and fields. New users automatically get 3 default test apps:
1. Study Tutor
2. Recipe Genius
3. Personal Trainer

Multiple users can have apps/tasks with the same name since they're isolated by `user_id`.

## Database Changes Required

### SQL Migration File Location
See: `migrations/004_add_user_isolation.sql` and `migrations/005_create_default_apps_trigger.sql`

### Key Changes to Tables:

#### 1. **apps** table
- Added `user_id` UUID column with Foreign Key to `auth.users`
- Changed unique constraint from `(name)` to `(user_id, name)` - allows same app names for different users
- Enabled Row Level Security (RLS)
- Added RLS policies for user isolation

#### 2. **tasks** table
- Added `user_id` UUID column with Foreign Key to `auth.users`
- Changed unique constraint from `(app_id, name)` to `(app_id, name, user_id)` - allows same task names for different users
- Enabled RLS with user-based policies



#### 4. **task_fields** table
- Added `user_id` UUID column
- Enabled RLS with user-based policies

#### 5. **prompt_templates** table
- Added `user_id` UUID column
- Enabled RLS with user-based policies

### SQL Code to Execute

Run these migrations in Supabase SQL Editor in order:

**Step 1: Run Migration 004**
```sql
-- See: migrations/004_add_user_isolation.sql
```

**Step 2: Run Migration 005**
```sql
-- See: migrations/005_create_default_apps_trigger.sql
```

This creates a PostgreSQL trigger that automatically creates the 3 default apps (Study Tutor, Lawyer, Personal Trainer) for every new user.

## Code Changes Made

### Backend API Routes Updated

All API routes now require authentication via `Authorization: Bearer <token>` header:

1. **`/api/apps`**
   - GET: Filter apps by authenticated user's ID
   - POST: Create app for authenticated user, include `user_id` in insert

2. **`/api/apps/[id]`**
   - GET: Verify user owns the app before returning

3. **`/api/tasks`**
   - GET: Filter tasks by user_id
   - POST: Add user_id when creating, verify app ownership



5. **`/api/task-fields`**
   - GET: Filter by user_id
   - POST: Add user_id when creating, verify app ownership

6. **`/api/prompt-templates`**
   - GET: Filter by user_id
   - POST: Add user_id when creating, verify app ownership

### Frontend Updates

All authenticated fetch calls now include the auth token:

**Helper Function Added:** `authenticatedFetch()` in multiple pages:
- Gets the Supabase session
- Extracts the access token
- Adds it to Authorization header: `Bearer <token>`

**Updated Pages:**
- `app/dashboard/page.tsx` - Main dashboard
- `app/dashboard/[app_id]/page.tsx` - App detail page
- `app/dashboard/[app_id]/[task_name]/page.tsx` - Task editor page

## How It Works

### User Registration Flow
1. User creates account via Supabase Auth
2. Supabase trigger `create_default_apps_trigger` automatically runs
3. 3 default apps are created for the new user
4. User sees their isolated dashboard with only their apps

### Authentication Flow
1. User logs in with email/password
2. Supabase returns a session with `access_token`
3. Frontend stores this token
4. Frontend includes token in all API requests: `Authorization: Bearer <token>`
5. Backend extracts user ID from token using `supabase.auth.getUser(token)`
6. Backend filters all queries by `user_id`

### Data Isolation
- Each table has `user_id` column
- RLS policies enforce `auth.uid() = user_id` for all operations
- Service role key can bypass RLS for admin operations
- Regular users can only see/modify their own data

## Important Notes

1. **Service Role Key Still Works**
   - The service role key bypasses RLS, so you can still do admin operations
   - For normal operations, always include auth token in requests

2. **Multiple Users, Same App Names**
   - User A can have an app named "Study Tutor"
   - User B can also have an app named "Study Tutor"
   - They won't conflict because of `(user_id, name)` unique constraint

3. **Default Apps Created Automatically**
   - When a user signs up, PostgreSQL trigger immediately creates 3 apps
   - No additional code needed

4. **Migration Safety**
   - Migrations use `IF NOT EXISTS` and `DROP IF EXISTS`
   - Safe to run multiple times
   - Won't break existing data

## Testing

1. Create a new user account
2. Check that 3 apps appear automatically
3. Create another user with same email (different provider) and verify they have their own apps
4. Verify users can't see each other's apps

## Rollback (if needed)

To remove user isolation (not recommended for production):

```sql
-- Remove user_id columns and restore old constraints
ALTER TABLE apps DROP COLUMN user_id;
ALTER TABLE apps DROP CONSTRAINT apps_user_id_name_unique;
ALTER TABLE apps ADD CONSTRAINT apps_name_unique UNIQUE (name);
-- ... repeat for other tables
-- Drop RLS policies
ALTER TABLE apps DISABLE ROW LEVEL SECURITY;
-- ... repeat for other tables
```

## Files Modified

- `migrations/004_add_user_isolation.sql` (NEW)
- `migrations/005_create_default_apps_trigger.sql` (NEW)
- `lib/authHelpers.ts` (NEW)
- `lib/authenticatedFetch.ts` (NEW)
- `app/api/apps/route.ts`
- `app/api/apps/[id]/route.ts`
- `app/api/tasks/route.ts`

- `app/api/task-fields/route.ts`
- `app/api/prompt-templates/route.ts`
- `app/dashboard/page.tsx`
- `app/dashboard/[app_id]/page.tsx`
- `app/dashboard/[app_id]/[task_name]/page.tsx`
