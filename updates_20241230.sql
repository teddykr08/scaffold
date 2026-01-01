-- Migration to add customization fields to tasks table
ALTER TABLE tasks 
ADD COLUMN theme TEXT DEFAULT 'default',
ADD COLUMN custom_color TEXT DEFAULT '#000000',
ADD COLUMN font TEXT DEFAULT 'Inter';

-- Create table just in case it doesn't exist (though it should)
-- (This block is purely for reference/completeness if re-running from scratch)
-- CREATE TABLE IF NOT EXISTS prompt_templates (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
--   task_name TEXT,
--   template TEXT,
--   description TEXT,
--   created_at TIMESTAMPTZ DEFAULT now(),
--   updated_at TIMESTAMPTZ DEFAULT now()
-- );
