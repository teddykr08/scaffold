-- Add customization columns to tasks table if they don't exist
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS theme text DEFAULT 'default',
ADD COLUMN IF NOT EXISTS custom_color text DEFAULT '#000000',
ADD COLUMN IF NOT EXISTS font text DEFAULT 'Inter';

-- Add comment for clarity
COMMENT ON COLUMN tasks.theme IS 'Form theme (default, modern, etc.)';
COMMENT ON COLUMN tasks.custom_color IS 'Primary color for form buttons and accents (hex code)';
COMMENT ON COLUMN tasks.font IS 'Font family for the form (Google Fonts)';
