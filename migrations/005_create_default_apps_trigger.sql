-- Migration to create default apps with fields and templates for new users
-- This will be triggered when a new user is created in auth.users

-- Create a function that initializes default apps with fields and templates for a new user
CREATE OR REPLACE FUNCTION create_default_apps_for_user()
RETURNS TRIGGER AS $$
DECLARE
  study_tutor_app_id UUID;
  lawyer_app_id UUID;
  personal_trainer_app_id UUID;
BEGIN
  -- Create 3 default test apps for the new user
  INSERT INTO apps (name, user_id, created_at)
  VALUES 
    ('Study Tutor', NEW.id, now()),
    ('Lawyer', NEW.id, now()),
    ('Personal Trainer', NEW.id, now())
  RETURNING id INTO study_tutor_app_id, lawyer_app_id, personal_trainer_app_id;

  -- Get the actual app IDs from the insert
  SELECT id INTO study_tutor_app_id FROM apps WHERE name = 'Study Tutor' AND user_id = NEW.id LIMIT 1;
  SELECT id INTO lawyer_app_id FROM apps WHERE name = 'Lawyer' AND user_id = NEW.id LIMIT 1;
  SELECT id INTO personal_trainer_app_id FROM apps WHERE name = 'Personal Trainer' AND user_id = NEW.id LIMIT 1;

  -- STUDY TUTOR APP - Global Fields
  INSERT INTO global_fields (app_id, user_id, name, field_type, created_at)
  VALUES 
    (study_tutor_app_id, NEW.id, 'Subject', 'text', now()),
    (study_tutor_app_id, NEW.id, 'Grade Level', 'select', now()),
    (study_tutor_app_id, NEW.id, 'Learning Style', 'select', now());

  -- STUDY TUTOR APP - Prompt Template
  INSERT INTO prompt_templates (app_id, user_id, name, template, created_at)
  VALUES (study_tutor_app_id, NEW.id, 'Default', 'You are an expert study tutor specialized in {subject} for {grade_level} students. Your teaching style matches {learning_style} learning preferences. Create clear, engaging explanations with examples.', now());

  -- LAWYER APP - Global Fields
  INSERT INTO global_fields (app_id, user_id, name, field_type, created_at)
  VALUES 
    (lawyer_app_id, NEW.id, 'Case Type', 'text', now()),
    (lawyer_app_id, NEW.id, 'Jurisdiction', 'text', now()),
    (lawyer_app_id, NEW.id, 'Urgency Level', 'select', now());

  -- LAWYER APP - Prompt Template
  INSERT INTO prompt_templates (app_id, user_id, name, template, created_at)
  VALUES (lawyer_app_id, NEW.id, 'Default', 'You are an expert lawyer and fluent in the law of {jurisdiction}. You specialize in {case_type} cases. Your responses must be legally sound and consider urgency level: {urgency_level}. Provide clear legal guidance.', now());

  -- PERSONAL TRAINER APP - Global Fields
  INSERT INTO global_fields (app_id, user_id, name, field_type, created_at)
  VALUES 
    (personal_trainer_app_id, NEW.id, 'Fitness Level', 'select', now()),
    (personal_trainer_app_id, NEW.id, 'Goals', 'text', now()),
    (personal_trainer_app_id, NEW.id, 'Injuries/Limitations', 'text', now());

  -- PERSONAL TRAINER APP - Prompt Template
  INSERT INTO prompt_templates (app_id, user_id, name, template, created_at)
  VALUES (personal_trainer_app_id, NEW.id, 'Default', 'You are a professional personal trainer with expertise across all fitness levels. Current client fitness level: {fitness_level}, Goals: {goals}, Limitations: {injuries_limitations}. Create personalized, safe, and effective workout and nutrition guidance.', now());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger that fires when a new user is created in auth.users
DROP TRIGGER IF EXISTS create_default_apps_trigger ON auth.users;
CREATE TRIGGER create_default_apps_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_default_apps_for_user();
