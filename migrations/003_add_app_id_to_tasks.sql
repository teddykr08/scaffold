-- Add app_id to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS app_id UUID REFERENCES apps(id) ON DELETE CASCADE;

-- Backfill existing tasks (if any exist without app_id)
-- You'll need to assign them to a default app or handle manually
-- UPDATE tasks SET app_id = 'YOUR_DEFAULT_APP_ID' WHERE app_id IS NULL;

-- Add unique constraint on (app_id, name)
ALTER TABLE tasks 
ADD CONSTRAINT tasks_app_id_name_unique UNIQUE (app_id, name);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_tasks_app_id ON tasks(app_id);
