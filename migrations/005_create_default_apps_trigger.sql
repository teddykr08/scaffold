-- Migration to create default apps with fields and templates for new users
-- This will be triggered when a new user is created in auth.users

-- Create a function that initializes default apps with fields and templates for a new user
CREATE OR REPLACE FUNCTION create_default_apps_for_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  study_tutor_app_id UUID;
  recipe_app_id UUID;
  personal_trainer_app_id UUID;
BEGIN
  -- Create 3 default test apps for the new user
  INSERT INTO apps (name, user_id, created_at)
  VALUES 
    ('Study Tutor', NEW.id, now()),
    ('Recipe Genius', NEW.id, now()),
    ('Personal Trainer', NEW.id, now())
  ON CONFLICT DO NOTHING;

  -- Get the actual app IDs 
  SELECT id INTO study_tutor_app_id FROM apps WHERE name = 'Study Tutor' AND user_id = NEW.id LIMIT 1;
  SELECT id INTO recipe_app_id FROM apps WHERE name = 'Recipe Genius' AND user_id = NEW.id LIMIT 1;
  SELECT id INTO personal_trainer_app_id FROM apps WHERE name = 'Personal Trainer' AND user_id = NEW.id LIMIT 1;

  -- STUDY TUTOR APP
  IF study_tutor_app_id IS NOT NULL THEN
    INSERT INTO tasks (app_id, user_id, name, has_form, created_at)
    VALUES (study_tutor_app_id, NEW.id, 'explain_topic', true, now())
    ON CONFLICT DO NOTHING;

    INSERT INTO task_fields (app_id, user_id, task_name, field_name, field_label, field_type, required, "order", options, created_at)
    VALUES 
      (study_tutor_app_id, NEW.id, 'explain_topic', 'subject', 'Subject', 'text', true, 1, null, now()),
      (study_tutor_app_id, NEW.id, 'explain_topic', 'grade_level', 'Grade Level', 'select', true, 2, '["Middle School", "High School", "College"]'::jsonb, now())
    ON CONFLICT DO NOTHING;

    INSERT INTO prompt_templates (app_id, user_id, task_name, template, created_at)
    VALUES (study_tutor_app_id, NEW.id, 'explain_topic', 'You are an expert tutor. Subject: {{subject}}, Grade: {{grade_level}}. Explain this topic simply: <<fixed>>', now())
    ON CONFLICT DO NOTHING;
  END IF;

  -- RECIPE GENIUS APP (Formless Example)
  IF recipe_app_id IS NOT NULL THEN
    INSERT INTO tasks (app_id, user_id, name, has_form, created_at)
    VALUES (recipe_app_id, NEW.id, 'quick_recipe', false, now())
    ON CONFLICT DO NOTHING;

    INSERT INTO prompt_templates (app_id, user_id, task_name, template, created_at)
    VALUES (recipe_app_id, NEW.id, 'quick_recipe', 'You are a world-class chef. Provide a creative recipe for the following ingredients or theme: <<fixed>>', now())
    ON CONFLICT DO NOTHING;
  END IF;

  -- PERSONAL TRAINER APP
  IF personal_trainer_app_id IS NOT NULL THEN
    -- Tasks
    INSERT INTO tasks (app_id, user_id, name, has_form, created_at)
    VALUES 
      (personal_trainer_app_id, NEW.id, 'workout_routine', true, now()),
      (personal_trainer_app_id, NEW.id, 'create_diet', true, now())
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

    -- Templates
    INSERT INTO prompt_templates (app_id, user_id, task_name, template, created_at)
    VALUES 
      (personal_trainer_app_id, NEW.id, 'workout_routine', 'You are a professional personal trainer. Fitness Level: {{fitness_level}}, Goals: {{goals}}. Create a workout for: <<fixed>>', now()),
      (personal_trainer_app_id, NEW.id, 'create_diet', 'You are a nutritionist. Fitness Level: {{fitness_level}}, Goals: {{goals}}. Create a customized diet plan for: <<fixed>>', now())
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
