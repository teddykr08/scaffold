-- Add user_id to apps table for user isolation
ALTER TABLE apps 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for faster user-based queries
CREATE INDEX IF NOT EXISTS idx_apps_user_id ON apps(user_id);

-- Create unique constraint on (user_id, name) so each user can have apps with same name
ALTER TABLE apps 
ADD CONSTRAINT apps_user_id_name_unique UNIQUE (user_id, name);

-- Drop old unique constraint on name if it exists
ALTER TABLE apps 
DROP CONSTRAINT IF EXISTS apps_name_unique;

-- Enable RLS on apps table
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;

-- RLS policy: Users can only see their own apps
CREATE POLICY IF NOT EXISTS "Users can view own apps"
ON apps FOR SELECT
USING (auth.uid() = user_id);

-- RLS policy: Users can only create apps for themselves
CREATE POLICY IF NOT EXISTS "Users can create own apps"
ON apps FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS policy: Users can only update their own apps
CREATE POLICY IF NOT EXISTS "Users can update own apps"
ON apps FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS policy: Users can only delete their own apps
CREATE POLICY IF NOT EXISTS "Users can delete own apps"
ON apps FOR DELETE
USING (auth.uid() = user_id);

-- Service role bypasses RLS, so we don't need policies for that

-- Add user_id to related tables for consistency
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);

-- Update tasks constraint to include user_id
-- First drop old constraint
ALTER TABLE tasks 
DROP CONSTRAINT IF EXISTS tasks_app_id_name_unique;

-- Add new constraint with user_id
ALTER TABLE tasks 
ADD CONSTRAINT tasks_app_id_name_user_id_unique UNIQUE (app_id, name, user_id);

-- Enable RLS on tasks table
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- RLS policy: Users can only see tasks for their own apps
CREATE POLICY IF NOT EXISTS "Users can view own tasks"
ON tasks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can create tasks in own apps"
ON tasks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own tasks"
ON tasks FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own tasks"
ON tasks FOR DELETE
USING (auth.uid() = user_id);

-- Global fields tied to user through app
ALTER TABLE global_fields 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_global_fields_user_id ON global_fields(user_id);

ALTER TABLE global_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view own global fields"
ON global_fields FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can create global fields"
ON global_fields FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own global fields"
ON global_fields FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own global fields"
ON global_fields FOR DELETE
USING (auth.uid() = user_id);

-- Task fields tied to user through app
ALTER TABLE task_fields 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_task_fields_user_id ON task_fields(user_id);

ALTER TABLE task_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view own task fields"
ON task_fields FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can create task fields"
ON task_fields FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own task fields"
ON task_fields FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own task fields"
ON task_fields FOR DELETE
USING (auth.uid() = user_id);

-- Prompt templates tied to user through app
ALTER TABLE prompt_templates 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_prompt_templates_user_id ON prompt_templates(user_id);

ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view own prompt templates"
ON prompt_templates FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can create prompt templates"
ON prompt_templates FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own prompt templates"
ON prompt_templates FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own prompt templates"
ON prompt_templates FOR DELETE
USING (auth.uid() = user_id);
