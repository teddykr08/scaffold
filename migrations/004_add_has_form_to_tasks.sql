-- Add has_form column to tasks table (default true)
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS has_form boolean DEFAULT true;

-- Backfill existing tasks to true
UPDATE tasks SET has_form = true WHERE has_form IS NULL;
