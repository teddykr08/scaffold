-- Migration to ONLY create the Study App with Study Tutor task for new users
-- This will be triggered when a new user is created in auth.users

CREATE OR REPLACE FUNCTION create_default_study_app_for_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  study_app_id UUID;
BEGIN
  -- Create only the Study App for the new user
  INSERT INTO apps (name, user_id, created_at)
  VALUES ('Study App', NEW.id, now())
  ON CONFLICT DO NOTHING;

  -- Get the actual app ID 
  SELECT id INTO study_app_id FROM apps WHERE name = 'Study App' AND user_id = NEW.id LIMIT 1;

  -- STUDY APP: Add Study Tutor task
  IF study_app_id IS NOT NULL THEN
    INSERT INTO tasks (app_id, user_id, name, has_form, created_at)
    VALUES (study_app_id, NEW.id, 'study_tutor', true, now())
    ON CONFLICT DO NOTHING;

    INSERT INTO task_fields (app_id, user_id, task_name, field_name, field_label, field_type, required, "order", options, created_at)
    VALUES 
      (study_app_id, NEW.id, 'study_tutor', 'subject', 'Subject', 'text', true, 1, null, now()),
      (study_app_id, NEW.id, 'study_tutor', 'grade_level', 'Grade Level', 'select', true, 2, '["Middle School", "High School", "College"]'::jsonb, now())
    ON CONFLICT DO NOTHING;

    INSERT INTO prompt_templates (app_id, user_id, task_name, template, created_at)
    VALUES (study_app_id, NEW.id, 'study_tutor', 'You are an expert tutor. Subject: {{subject}}, Grade: {{grade_level}}. Explain this topic simply: <<fixed>>', now())
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Remove old trigger if it exists
DROP TRIGGER IF EXISTS create_default_apps_trigger ON auth.users;
-- Create a new trigger for only the Study App
CREATE TRIGGER create_default_study_app_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_default_study_app_for_user();
