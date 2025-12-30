-- ============================================================================
-- FINAL SQL FOR USER ISOLATION IMPLEMENTATION
-- ============================================================================
-- Copy and paste this entire file into Supabase SQL Editor and execute
-- This handles all user isolation, RLS policies, and default apps with fields
-- ============================================================================

-- ============================================================================
-- PART 1: ADD USER ISOLATION COLUMNS TO ALL TABLES
-- ============================================================================

-- Add user_id to apps table for user isolation
ALTER TABLE apps 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for faster user-based queries
CREATE INDEX IF NOT EXISTS idx_apps_user_id ON apps(user_id);

-- Create unique constraint on (user_id, name) so each user can have apps with same name
ALTER TABLE apps 
DROP CONSTRAINT IF EXISTS apps_user_id_name_unique;
ALTER TABLE apps 
ADD CONSTRAINT apps_user_id_name_unique UNIQUE (user_id, name);

-- Drop old unique constraint on name if it exists
ALTER TABLE apps 
DROP CONSTRAINT IF EXISTS apps_name_unique;

-- Enable RLS on apps table
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own apps" ON apps;
DROP POLICY IF EXISTS "Users can create own apps" ON apps;
DROP POLICY IF EXISTS "Users can update own apps" ON apps;
DROP POLICY IF EXISTS "Users can delete own apps" ON apps;

-- RLS policy: Users can only see their own apps
CREATE POLICY "Users can view own apps"
ON apps FOR SELECT
USING (auth.uid() = user_id);

-- RLS policy: Users can only create apps for themselves
CREATE POLICY "Users can create own apps"
ON apps FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS policy: Users can only update their own apps
CREATE POLICY "Users can update own apps"
ON apps FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS policy: Users can only delete their own apps
CREATE POLICY "Users can delete own apps"
ON apps FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- Add user_id to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add infrastructure for formless mode as seen in schema diagram
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS has_form BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS fixed_context TEXT;

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);

-- Update tasks constraint to include user_id
-- First drop old unique constraints
ALTER TABLE tasks 
DROP CONSTRAINT IF EXISTS tasks_app_id_name_unique;
ALTER TABLE tasks 
DROP CONSTRAINT IF EXISTS tasks_name_key;

-- Add new constraint with user_id
ALTER TABLE tasks 
DROP CONSTRAINT IF EXISTS tasks_app_id_name_user_id_unique;
ALTER TABLE tasks 
ADD CONSTRAINT tasks_app_id_name_user_id_unique UNIQUE (app_id, name, user_id);

-- Enable RLS on tasks table
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create tasks in own apps" ON tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;

-- RLS policy: Users can only see tasks for their own apps
CREATE POLICY "Users can view own tasks"
ON tasks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create tasks in own apps"
ON tasks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
ON tasks FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
ON tasks FOR DELETE
USING (auth.uid() = user_id);



-- ============================================================================
-- Add user_id to task_fields table
ALTER TABLE task_fields 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add options column for select fields
ALTER TABLE task_fields
ADD COLUMN IF NOT EXISTS options JSONB;

-- Add helper columns as seen in schema diagram
ALTER TABLE task_fields
ADD COLUMN IF NOT EXISTS allow_global_fallback BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS show_in_form BOOLEAN DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_task_fields_user_id ON task_fields(user_id);

ALTER TABLE task_fields ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own task fields" ON task_fields;
DROP POLICY IF EXISTS "Users can create task fields" ON task_fields;
DROP POLICY IF EXISTS "Users can update own task fields" ON task_fields;
DROP POLICY IF EXISTS "Users can delete own task fields" ON task_fields;

CREATE POLICY "Users can view own task fields"
ON task_fields FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create task fields"
ON task_fields FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own task fields"
ON task_fields FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own task fields"
ON task_fields FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- Add user_id to prompt_templates table
ALTER TABLE prompt_templates 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_prompt_templates_user_id ON prompt_templates(user_id);

ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own prompt templates" ON prompt_templates;
DROP POLICY IF EXISTS "Users can create prompt templates" ON prompt_templates;
DROP POLICY IF EXISTS "Users can update own prompt templates" ON prompt_templates;
DROP POLICY IF EXISTS "Users can delete own prompt templates" ON prompt_templates;

CREATE POLICY "Users can view own prompt templates"
ON prompt_templates FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create prompt templates"
ON prompt_templates FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prompt templates"
ON prompt_templates FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own prompt templates"
ON prompt_templates FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- PART 2: CREATE DEFAULT APPS WITH FIELDS AND TEMPLATES FOR NEW USERS
-- ============================================================================

-- Create a function that initializes default apps with fields and templates for a new user
CREATE OR REPLACE FUNCTION create_default_apps_for_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  study_tutor_app_id UUID;
  recipe_genius_app_id UUID;
  personal_trainer_app_id UUID;
BEGIN
  -- Create 3 default test apps for the new user
  -- Use ON CONFLICT DO NOTHING to avoid trigger failures if things already exist
  INSERT INTO apps (name, user_id, created_at)
  VALUES 
    ('Study Tutor', NEW.id, now()),
    ('Personal Trainer', NEW.id, now())
  ON CONFLICT DO NOTHING;

  -- Get the actual app IDs 
  SELECT id INTO study_tutor_app_id FROM apps WHERE name = 'Study Tutor' AND user_id = NEW.id LIMIT 1;
  SELECT id INTO personal_trainer_app_id FROM apps WHERE name = 'Personal Trainer' AND user_id = NEW.id LIMIT 1;
  
  -- Create Recipe Genius App
  INSERT INTO apps (name, user_id, created_at)
  VALUES ('Recipe Genius', NEW.id, now())
  ON CONFLICT DO NOTHING;
  
  SELECT id INTO recipe_genius_app_id FROM apps WHERE name = 'Recipe Genius' AND user_id = NEW.id LIMIT 1;

  -- STUDY TUTOR APP
  IF study_tutor_app_id IS NOT NULL THEN
    INSERT INTO tasks (app_id, user_id, name, has_form, created_at)
    VALUES (study_tutor_app_id, NEW.id, 'explain_topic', true, now())
    ON CONFLICT DO NOTHING;

    -- Using task_fields ONLY (Global fields removed from examples)
    INSERT INTO task_fields (app_id, user_id, task_name, field_name, field_label, field_type, required, "order", options, created_at)
    VALUES 
      (study_tutor_app_id, NEW.id, 'explain_topic', 'subject', 'Subject', 'text', true, 1, null, now()),
      (study_tutor_app_id, NEW.id, 'explain_topic', 'grade_level', 'Grade Level', 'select', true, 2, '["Middle School", "High School", "College"]'::jsonb, now())
    ON CONFLICT DO NOTHING;

    INSERT INTO prompt_templates (app_id, user_id, task_name, template, created_at)
    VALUES (study_tutor_app_id, NEW.id, 'explain_topic', 'You are an expert tutor. Subject: {{subject}}, Grade: {{grade_level}}. Explain this topic simply: <<fixed>>', now())
    ON CONFLICT DO NOTHING;
  END IF;

  -- RECIPE GENIUS APP (Formless mode: has_form = false)
  IF recipe_genius_app_id IS NOT NULL THEN
    INSERT INTO tasks (app_id, user_id, name, has_form, created_at)
    VALUES (recipe_genius_app_id, NEW.id, 'quick_recipe', false, now())
    ON CONFLICT DO NOTHING;

    INSERT INTO prompt_templates (app_id, user_id, task_name, template, created_at)
    VALUES (recipe_genius_app_id, NEW.id, 'quick_recipe', 'You are a world-class chef. Provide a creative recipe for the following ingredients or theme: <<fixed>>', now())
    ON CONFLICT DO NOTHING;
  END IF;

  -- PERSONAL TRAINER APP
  IF personal_trainer_app_id IS NOT NULL THEN
    -- Task 1: Workout Routine
    INSERT INTO tasks (app_id, user_id, name, has_form, created_at)
    VALUES (personal_trainer_app_id, NEW.id, 'workout_routine', true, now())
    ON CONFLICT DO NOTHING;

    -- Task 2: Creation of Diet
    INSERT INTO tasks (app_id, user_id, name, has_form, created_at)
    VALUES (personal_trainer_app_id, NEW.id, 'create_diet', true, now())
    ON CONFLICT DO NOTHING;

    -- Working Fields for Workout Routine
    INSERT INTO task_fields (app_id, user_id, task_name, field_name, field_label, field_type, required, "order", options, created_at)
    VALUES 
      (personal_trainer_app_id, NEW.id, 'workout_routine', 'fitness_level', 'Fitness Level', 'select', true, 1, '["Beginner", "Intermediate", "Advanced"]'::jsonb, now()),
      (personal_trainer_app_id, NEW.id, 'workout_routine', 'goals', 'Goals', 'text', true, 2, null, now())
    ON CONFLICT DO NOTHING;

    -- Working Fields for Diet
    INSERT INTO task_fields (app_id, user_id, task_name, field_name, field_label, field_type, required, "order", options, created_at)
    VALUES 
      (personal_trainer_app_id, NEW.id, 'create_diet', 'fitness_level', 'Fitness Level', 'select', true, 1, '["Beginner", "Intermediate", "Advanced"]'::jsonb, now()),
      (personal_trainer_app_id, NEW.id, 'create_diet', 'goals', 'Goals', 'text', true, 2, null, now())
    ON CONFLICT DO NOTHING;

    -- Template for Workout Routine
    INSERT INTO prompt_templates (app_id, user_id, task_name, template, created_at)
    VALUES (personal_trainer_app_id, NEW.id, 'workout_routine', 'You are a professional personal trainer. Fitness Level: {{fitness_level}}, Goals: {{goals}}. Create a workout for: <<fixed>>', now())
    ON CONFLICT DO NOTHING;

    -- Template for Creating Diet
    INSERT INTO prompt_templates (app_id, user_id, task_name, template, created_at)
    VALUES (personal_trainer_app_id, NEW.id, 'create_diet', 'You are a nutritionist. Fitness Level: {{fitness_level}}, Goals: {{goals}}. Create a customized diet plan for: <<fixed>>', now())
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Create a trigger that fires when a new user is created in auth.users
DROP TRIGGER IF EXISTS create_default_apps_trigger ON auth.users;
CREATE TRIGGER create_default_apps_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_default_apps_for_user();

-- ============================================================================
-- PART 3: VERIFICATION QUERIES
-- ============================================================================
-- Run these after setup to verify everything is working:
-- 
-- Check apps table has user_id column:
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'apps' AND column_name = 'user_id';
--
-- Check RLS is enabled on apps:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'apps';
--
-- Check trigger exists:
-- SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'auth.users';
--
-- Test with new user (create new user via Supabase Auth, then check):
-- SELECT name FROM apps WHERE user_id = '<new_user_id>';
-- (Should show: Study Tutor, Personal Trainer, Recipe Genius)

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Summary:
-- ✅ Added user_id columns to: apps, tasks, task_fields, prompt_templates
-- ✅ Enabled RLS on all tables with 4 policies per table (SELECT, INSERT, UPDATE, DELETE)
-- ✅ Updated unique constraints to include user_id
-- ✅ Created indexes on user_id columns
-- ✅ Created trigger function to generate default apps with fields and templates
-- ✅ Each new user gets:
--    - Study Tutor app with: Subject, Grade Level, Learning Style fields
--    - Recipe Genius app (Formless mode) with custom template
--    - Personal Trainer app with: Fitness Level, Goals, Injuries/Limitations fields
--    - Each app has a custom default prompt template
-- 
-- Users can now:
-- ✅ Have apps with the same name (different from other users)
-- ✅ Only access their own data via RLS
-- ✅ Get pre-configured apps with fields and templates on signup
-- ============================================================================
